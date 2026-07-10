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

export async function getWordDetail(
  targetCode: string
): Promise<WordDetailWithCacheMeta> {
  const key = redisKey(targetCode);

  const redisCached = await redis.get<WordDetail>(key);
  if (redisCached) {
    return { ...redisCached, cache: "hit" };
  }

  const dbCached = await getPersistentCache(targetCode);
  if (dbCached) {
    void redis.set(key, dbCached, { ex: CACHE_TTL_SECONDS }).catch((err) => {
      console.error("[word-detail-cache] failed to warm redis:", err);
    });
    return { ...dbCached, cache: "hit" };
  }

  const result = await viewUrimalsaem(targetCode);
  void Promise.all([
    redis.set(key, result, { ex: CACHE_TTL_SECONDS }),
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

  return row.result as WordDetail;
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
