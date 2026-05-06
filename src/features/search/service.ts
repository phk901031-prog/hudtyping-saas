// src/features/search/service.ts
// Search 도메인의 비즈니스 흐름 (② Application).
//
// 세 함수 export:
//   - searchWord(query) → 캐시 우선 + 미스 시 우리말샘 호출 + 캐시 저장
//   - logSearch(clerkId, query, cacheHit) → DB에 검색 기록 INSERT
//   - getMyStats(clerkId) → 통계 페이지용 집계 (요약+최근+인기)
//
// 의도적으로 분리한 책임:
//   - HTTP 응답 만들기는 route.ts 몫 (이 service는 데이터만 반환/throw)
//   - after()로 백그라운드 실행하는 결정도 route.ts 몫
//   - 인증·status 검사는 별도 헬퍼(@/features/auth/service)

import { eq, sql, desc } from "drizzle-orm";
import { redis } from "@/infrastructure/redis";
import { searchUrimalsaem } from "@/infrastructure/urimalsaem";
import { db } from "@/infrastructure/db";
import { searchLogs } from "@/infrastructure/db/schema";
import type {
  SearchResult,
  SearchResultWithCacheMeta,
} from "./types";

// 캐시 TTL: 7일 (사전 데이터는 거의 안 바뀌므로 길게 두어도 안전)
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

/**
 * 한 번의 단어 검색 흐름:
 *   1) Redis 캐시 조회 → HIT면 즉시 반환 (~5ms)
 *   2) MISS면 우리말샘 호출 (~250ms)
 *   3) 결과를 Redis에 저장 (TTL 7일, 0건 결과도 캐시)
 *
 * 외부 호출 실패는 throw — 호출자가 catch해서 HTTP 응답으로 매핑.
 */
export async function searchWord(
  query: string
): Promise<SearchResultWithCacheMeta> {
  const cacheKey = `search:${query}`;

  const cached = await redis.get<SearchResult>(cacheKey);
  if (cached) {
    return { ...cached, cache: "hit" };
  }

  const result = await searchUrimalsaem(query);
  await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });

  return { ...result, cache: "miss" };
}

/**
 * 검색 통계 기록.
 * 실패해도 사용자 응답에 영향 주면 안 되므로 try/catch로 격리.
 * 호출자는 보통 `after(() => logSearch(...))`로 백그라운드 실행.
 */
export async function logSearch(
  clerkId: string,
  query: string,
  cacheHit: boolean
): Promise<void> {
  try {
    await db.insert(searchLogs).values({ clerkId, query, cacheHit });
  } catch (err) {
    console.error("[search/logSearch] 기록 실패:", err);
  }
}

/**
 * 통계 페이지(/stats)에서 쓰는 본인 집계 묶음.
 * 인덱스 활용:
 *   - search_logs_clerk_id_idx: WHERE clerk_id 조회
 *   - search_logs_query_idx: GROUP BY query 집계
 *   - search_logs_created_at_idx: ORDER BY created_at
 */
export async function getMyStats(clerkId: string) {
  // 1) 요약 — 한 쿼리로 집계
  const [summary] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      cacheHits: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.cacheHit} THEN 1 ELSE 0 END), 0)::int`,
      firstSearch: sql<Date | null>`MIN(${searchLogs.createdAt})`,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId));

  // 2) 최근 검색어 10건
  const recent = await db
    .select({
      query: searchLogs.query,
      cacheHit: searchLogs.cacheHit,
      createdAt: searchLogs.createdAt,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId))
    .orderBy(desc(searchLogs.createdAt))
    .limit(10);

  // 3) 인기 검색어 top 10
  const popular = await db
    .select({
      query: searchLogs.query,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId))
    .groupBy(searchLogs.query)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

  return {
    total: summary?.total ?? 0,
    cacheHits: Number(summary?.cacheHits ?? 0),
    firstSearch: summary?.firstSearch ?? null,
    recent,
    popular,
  };
}
