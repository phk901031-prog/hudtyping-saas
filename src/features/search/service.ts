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

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

export async function searchWord(
  query: string
): Promise<SearchResultWithCacheMeta> {
  const normalizedQuery = normalizeQuery(query);
  const cacheKey = `search:${normalizedQuery}`;

  const redisCached = await redis.get<SearchResult>(cacheKey);
  if (redisCached) {
    return { ...redisCached, cache: "hit" };
  }

  const dbCached = await getPersistentCache(normalizedQuery);
  if (dbCached) {
    void redis.set(cacheKey, dbCached, { ex: CACHE_TTL_SECONDS }).catch((err) => {
      console.error("[search-cache] failed to warm redis:", err);
    });
    return { ...dbCached, cache: "hit" };
  }

  const result = await searchUrimalsaem(normalizedQuery);
  void Promise.all([
    redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS }),
    upsertPersistentCache(normalizedQuery, result),
  ]).catch((err) => {
    console.error("[search-cache] failed to store result:", err);
  });

  return { ...result, cache: "miss" };
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

  return row.result as SearchResult;
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
