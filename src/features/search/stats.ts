// src/features/search/stats.ts
// 사용자 본인의 검색 통계 집계 (요약 + 최근 + 인기).
// /stats 페이지에서 사용.
//
// 인덱스 활용:
//   - search_logs_clerk_id_idx: WHERE clerk_id 조회
//   - search_logs_query_idx: GROUP BY query 집계
//   - search_logs_created_at_idx: ORDER BY created_at

import { eq, sql, desc } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { searchLogs } from "@/infrastructure/db/schema";

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
