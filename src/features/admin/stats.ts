// src/features/admin/stats.ts
// 관리자용 전체 통계 — 모든 사용자 합산 (개인 통계는 features/search/stats.ts).

import { sql, gte } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { users, searchLogs } from "@/infrastructure/db/schema";

export async function getGlobalStats() {
  // 1) 사용자 status별 분포
  const userCounts = await db
    .select({
      status: users.status,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(users)
    .groupBy(users.status);

  // 2) 전체 검색 요약
  const [searchSummary] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      cacheHits: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.cacheHit} THEN 1 ELSE 0 END), 0)::int`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${searchLogs.clerkId})::int`,
    })
    .from(searchLogs);

  // 3) 인기 검색어 top 20 (전체 사용자 합산)
  const popular = await db
    .select({
      query: searchLogs.query,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .groupBy(searchLogs.query)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(20);

  // 4) 일별 검색량 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const daily = await db
    .select({
      day: sql<string>`TO_CHAR(${searchLogs.createdAt}, 'YYYY-MM-DD')`,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(gte(searchLogs.createdAt, thirtyDaysAgo))
    .groupBy(sql`TO_CHAR(${searchLogs.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${searchLogs.createdAt}, 'YYYY-MM-DD')`);

  return {
    userCounts,
    searchSummary: searchSummary ?? { total: 0, cacheHits: 0, uniqueUsers: 0 },
    popular,
    daily,
  };
}
