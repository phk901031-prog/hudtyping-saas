// src/features/search/service.ts
// Fast dictionary lookup flow:
//   1. Redis hot cache
//   2. Neon persistent dictionary cache
//   3. Urimalsaem external API only as the final fallback

import { eq, sql } from "drizzle-orm";
import { redis } from "@/infrastructure/redis";
import { db } from "@/infrastructure/db";
import { dictionaryCache } from "@/infrastructure/db/schema";
import { searchUrimalsaem } from "@/infrastructure/urimalsaem";
import type { SearchResult, SearchResultWithCacheMeta } from "./types";
import { findOperatorNotes } from "@/features/admin/operator-dictionary";

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function searchWord(
  query: string
): Promise<SearchResultWithCacheMeta> {
  const normalizedQuery = normalizeQuery(query);
  const cacheKey = `search:${normalizedQuery}`;
  // 운영자 표기와 검색 캐시는 서로 독립적이다. 캐시 hit도 DB 조회가
  // 끝난 뒤 Redis를 확인하던 직렬 네트워크 왕복을 병렬화한다.
  const [operatorNotes, redisCached] = await Promise.all([
    findOperatorNotes(normalizedQuery),
    redis.get<SearchResult>(cacheKey),
  ]);
  if (redisCached && !isStaleSchema(redisCached)) {
    return withOperatorNotes(redisCached, operatorNotes, "hit");
  }

  const dbCached = await getPersistentCache(normalizedQuery);
  if (dbCached) {
    void redis.set(cacheKey, dbCached, { ex: CACHE_TTL_SECONDS }).catch((err) => {
      console.error("[search-cache] failed to warm redis:", err);
    });
    return withOperatorNotes(dbCached, operatorNotes, "hit");
  }

  if (operatorNotes.length > 0) {
    void searchUrimalsaem(normalizedQuery)
      .then((result) =>
        Promise.all([
          redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS }),
          upsertPersistentCache(normalizedQuery, result),
        ])
      )
      .catch((err) => {
        console.warn("[search-cache] failed to warm operator term:", err);
      });

    return {
      query: normalizedQuery,
      total: 0,
      items: [],
      operatorNotes,
      cache: "hit",
    };
  }

  const result = await searchUrimalsaem(normalizedQuery);
  void Promise.all([
    redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS }),
    upsertPersistentCache(normalizedQuery, result),
  ]).catch((err) => {
    console.error("[search-cache] failed to store result:", err);
  });

  return withOperatorNotes(result, operatorNotes, "miss");
}

function normalizeQuery(query: string): string {
  return query.trim().replace(/\s+/g, " ");
}

async function getPersistentCache(
  query: string
): Promise<SearchResult | null> {
  const [row] = await db
    .select({ result: dictionaryCache.result })
    .from(dictionaryCache)
    .where(eq(dictionaryCache.query, query))
    .limit(1);

  if (!row) return null;

  const cached = row.result as SearchResult;

  // 이전 스키마(targetCode 없음)로 저장된 엔트리는 miss 취급 → 재조회 후
  // upsert가 새 스키마로 덮어써서 자연 마이그레이션. HUD 예문 조회를 뚫어놓는 목적.
  if (isStaleSchema(cached)) return null;

  void db
    .update(dictionaryCache)
    .set({
      hitCount: sql`${dictionaryCache.hitCount} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(dictionaryCache.query, query))
    .catch((err) => {
      console.error("[dictionary-cache] failed to update usage:", err);
    });

  return cached;
}

/** sense.targetCode 필드가 하나라도 빠진 sense가 있으면 이전 스키마.
 *  구엔트리는 (1) targetCode 없거나 (2) item 레벨에 있던 이전 잘못된 위치.
 *  둘 다 여기서 miss로 처리해 자연 마이그레이션. */
function isStaleSchema(result: SearchResult): boolean {
  return (result.items ?? []).some((it) =>
    (it.senses ?? []).some((s) => !/^\d+$/.test(s.targetCode ?? ""))
  );
}

async function upsertPersistentCache(
  query: string,
  result: SearchResult
): Promise<void> {
  try {
    await db
      .insert(dictionaryCache)
      .values({
        query,
        result,
        hitCount: 1,
        lastUsedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: dictionaryCache.query,
        set: {
          result,
          hitCount: sql`${dictionaryCache.hitCount} + 1`,
          updatedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });
  } catch (err) {
    console.error("[dictionary-cache] failed to persist result:", err);
  }
}

function withOperatorNotes(
  result: SearchResult,
  operatorNotes: SearchResultWithCacheMeta["operatorNotes"],
  cache: SearchResultWithCacheMeta["cache"]
): SearchResultWithCacheMeta {
  return {
    ...result,
    operatorNotes:
      operatorNotes && operatorNotes.length > 0 ? operatorNotes : result.operatorNotes,
    cache,
  };
}
