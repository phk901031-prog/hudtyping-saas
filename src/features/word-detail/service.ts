// Word-detail 서비스 (② Application).
// 3-tier 캐시: Redis hot → Neon word_detail_cache → 우리말샘 view API.
// features/search/service.ts와 동일 정책 — 응답 지연 없이 fire-and-forget 저장.

import { eq, sql } from "drizzle-orm";
import { redis } from "@/infrastructure/redis";
import { db } from "@/infrastructure/db";
import { wordDetailCache } from "@/infrastructure/db/schema";
import { viewUrimalsaem } from "@/infrastructure/urimalsaem";
import type { WordDetail, WordDetailWithCacheMeta } from "./types";

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;
const NOT_FOUND_CACHE_TTL_SECONDS = 60 * 60;

export async function getWordDetail(
  targetCode: string
): Promise<WordDetailWithCacheMeta> {
  // 서비스가 다른 호출 경로에서도 재사용되므로 route 검증에만 의존하지 않는다.
  if (!/^\d{1,20}$/.test(targetCode)) {
    throw new Error("Invalid target_code");
  }
  const key = redisKey(targetCode);

  const redisCached = await redis.get<WordDetail>(key);
  if (redisCached && !isStaleDetail(redisCached)) {
    return { ...redisCached, cache: "hit" };
  }

  const dbCached = await getPersistentCache(targetCode);
  if (dbCached) {
    void redis.set(key, dbCached, { ex: cacheTtl(dbCached) }).catch((err) => {
      console.error("[word-detail-cache] failed to warm redis:", err);
    });
    return { ...dbCached, cache: "hit" };
  }

  const result = await viewUrimalsaem(targetCode);
  void Promise.all([
    redis.set(key, result, { ex: cacheTtl(result) }),
    upsertPersistentCache(targetCode, result),
  ]).catch((err) => {
    console.error("[word-detail-cache] failed to store result:", err);
  });

  return { ...result, cache: "miss" };
}

function redisKey(targetCode: string): string {
  return `worddetail:${targetCode}`;
}

async function getPersistentCache(
  targetCode: string
): Promise<WordDetail | null> {
  const [row] = await db
    .select({ result: wordDetailCache.result })
    .from(wordDetailCache)
    .where(eq(wordDetailCache.targetCode, targetCode))
    .limit(1);

  if (!row) return null;

  // 이전 잘못된 파서(view 응답 스키마 오해)로 저장된 엔트리는 word=""·senses=[]
  // 상태로 남아있음. miss 취급 → API 재조회 → upsert가 덮어씀.
  const cached = row.result as WordDetail;
  if (isStaleDetail(cached)) return null;

  // 사용 카운트/시각 갱신 — 실패해도 응답엔 영향 없게 fire-and-forget.
  void db
    .update(wordDetailCache)
    .set({
      hitCount: sql`${wordDetailCache.hitCount} + 1`,
      lastUsedAt: new Date(),
    })
    .where(eq(wordDetailCache.targetCode, targetCode))
    .catch((err) => {
      console.error("[word-detail-cache] failed to update usage:", err);
    });

  return cached;
}

/** found가 없는 과거 캐시만 무효화한다. 정상적인 미검색 결과(found=false)는 negative cache한다. */
function isStaleDetail(detail: WordDetail): boolean {
  return (
    typeof detail.found !== "boolean" ||
    detail.targetCode === "" ||
    !Array.isArray(detail.senses)
  );
}

function cacheTtl(detail: WordDetail): number {
  return detail.found ? CACHE_TTL_SECONDS : NOT_FOUND_CACHE_TTL_SECONDS;
}

async function upsertPersistentCache(
  targetCode: string,
  result: WordDetail
): Promise<void> {
  try {
    await db
      .insert(wordDetailCache)
      .values({
        targetCode,
        result,
        hitCount: 0, // 첫 저장은 hit 아님 (miss로 갓 받아옴)
        lastUsedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: wordDetailCache.targetCode,
        set: {
          result,
          updatedAt: new Date(),
          lastUsedAt: new Date(),
        },
      });
  } catch (err) {
    console.error("[word-detail-cache] failed to persist result:", err);
  }
}
