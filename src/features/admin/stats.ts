// src/features/admin/stats.ts
// 관리자용 전체 통계 — 모든 사용자 합산 (개인 통계는 features/search/stats.ts).

import { desc, sql, gte } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  users,
  searchLogs,
  dictionaryCache,
} from "@/infrastructure/db/schema";

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

  // 3) 인기 검색어 top 50 (전체 사용자 합산)
  const popular = await db
    .select({
      query: searchLogs.query,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .groupBy(searchLogs.query)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(50);

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

  // 5) 시간대별 분포 — 한국 시간(KST) 기준 4시간 슬롯 6개 (최근 30일)
  //    slot 0=0~4시, 1=4~8시, 2=8~12시, 3=12~16시, 4=16~20시, 5=20~24시
  //    AT TIME ZONE 'Asia/Seoul' 로 UTC → KST 변환 후 EXTRACT(HOUR)
  const hourly = await db
    .select({
      slot: sql<number>`FLOOR(EXTRACT(HOUR FROM ${searchLogs.createdAt} AT TIME ZONE 'Asia/Seoul') / 4)::int`,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(gte(searchLogs.createdAt, thirtyDaysAgo))
    .groupBy(sql`FLOOR(EXTRACT(HOUR FROM ${searchLogs.createdAt} AT TIME ZONE 'Asia/Seoul') / 4)`)
    .orderBy(sql`FLOOR(EXTRACT(HOUR FROM ${searchLogs.createdAt} AT TIME ZONE 'Asia/Seoul') / 4)`);

  const [dictionarySummary] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      totalHits: sql<number>`COALESCE(SUM(${dictionaryCache.hitCount}), 0)::int`,
      lastUpdated: sql<Date | null>`MAX(${dictionaryCache.updatedAt})`,
    })
    .from(dictionaryCache);

  const recentSearches = await db
    .select({
      query: searchLogs.query,
      cacheHit: searchLogs.cacheHit,
      createdAt: searchLogs.createdAt,
      clerkId: searchLogs.clerkId,
    })
    .from(searchLogs)
    .orderBy(desc(searchLogs.createdAt))
    .limit(8);

  return {
    userCounts,
    searchSummary: searchSummary ?? { total: 0, cacheHits: 0, uniqueUsers: 0 },
    popular,
    daily,
    hourly,
    dictionarySummary: dictionarySummary ?? {
      total: 0,
      totalHits: 0,
      lastUpdated: null,
    },
    recentSearches,
  };
}
