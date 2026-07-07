import { desc, gte, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { dictionaryCache, searchLogs, users } from "@/infrastructure/db/schema";

export async function getGlobalStats() {
  const userCounts = await db
    .select({
      status: users.status,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(users)
    .groupBy(users.status);

  const [searchSummary] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      success: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.status} = 'success' THEN 1 ELSE 0 END), 0)::int`,
      failures: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.status} <> 'success' THEN 1 ELSE 0 END), 0)::int`,
      cacheHits: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.cacheHit} THEN 1 ELSE 0 END), 0)::int`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${searchLogs.clerkId})::int`,
      avgResponseMs: sql<number>`COALESCE(ROUND(AVG(${searchLogs.responseMs})), 0)::int`,
      p95ResponseMs: sql<number>`COALESCE(ROUND(PERCENTILE_CONT(0.95) WITHIN GROUP (ORDER BY ${searchLogs.responseMs}) FILTER (WHERE ${searchLogs.responseMs} IS NOT NULL)), 0)::int`,
      p99ResponseMs: sql<number>`COALESCE(ROUND(PERCENTILE_CONT(0.99) WITHIN GROUP (ORDER BY ${searchLogs.responseMs}) FILTER (WHERE ${searchLogs.responseMs} IS NOT NULL)), 0)::int`,
      slowSearches: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.responseMs} >= 5000 THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(searchLogs);

  const popular = await db
    .select({
      query: searchLogs.query,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(sql`${searchLogs.status} = 'success'`)
    .groupBy(searchLogs.query)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(50);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const daily = await db
    .select({
      day: sql<string>`TO_CHAR(${searchLogs.createdAt}, 'YYYY-MM-DD')`,
      cnt: sql<number>`COUNT(*)::int`,
      failures: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.status} <> 'success' THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(searchLogs)
    .where(gte(searchLogs.createdAt, thirtyDaysAgo))
    .groupBy(sql`TO_CHAR(${searchLogs.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${searchLogs.createdAt}, 'YYYY-MM-DD')`);

  const hourly = await db
    .select({
      slot: sql<number>`FLOOR(EXTRACT(HOUR FROM ${searchLogs.createdAt} AT TIME ZONE 'Asia/Seoul') / 4)::int`,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(gte(searchLogs.createdAt, thirtyDaysAgo))
    .groupBy(sql`FLOOR(EXTRACT(HOUR FROM ${searchLogs.createdAt} AT TIME ZONE 'Asia/Seoul') / 4)`)
    .orderBy(sql`FLOOR(EXTRACT(HOUR FROM ${searchLogs.createdAt} AT TIME ZONE 'Asia/Seoul') / 4)`);

  const versionSummary = await db
    .select({
      appVersion: sql<string>`COALESCE(${searchLogs.appVersion}, 'legacy/web')`,
      cnt: sql<number>`COUNT(*)::int`,
      failures: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.status} <> 'success' THEN 1 ELSE 0 END), 0)::int`,
      avgResponseMs: sql<number>`COALESCE(ROUND(AVG(${searchLogs.responseMs})), 0)::int`,
    })
    .from(searchLogs)
    .where(gte(searchLogs.createdAt, thirtyDaysAgo))
    .groupBy(sql`COALESCE(${searchLogs.appVersion}, 'legacy/web')`)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(10);

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
      status: searchLogs.status,
      errorCode: searchLogs.errorCode,
      responseMs: searchLogs.responseMs,
      appVersion: searchLogs.appVersion,
      createdAt: searchLogs.createdAt,
      clerkId: searchLogs.clerkId,
    })
    .from(searchLogs)
    .orderBy(desc(searchLogs.createdAt))
    .limit(12);

  const slowRecentSearches = await db
    .select({
      query: searchLogs.query,
      cacheHit: searchLogs.cacheHit,
      status: searchLogs.status,
      errorCode: searchLogs.errorCode,
      responseMs: searchLogs.responseMs,
      appVersion: searchLogs.appVersion,
      createdAt: searchLogs.createdAt,
      clerkId: searchLogs.clerkId,
    })
    .from(searchLogs)
    .where(sql`${searchLogs.responseMs} >= 3000`)
    .orderBy(desc(searchLogs.responseMs), desc(searchLogs.createdAt))
    .limit(15);

  return {
    userCounts,
    searchSummary: searchSummary ?? {
      total: 0,
      success: 0,
      failures: 0,
      cacheHits: 0,
      uniqueUsers: 0,
      avgResponseMs: 0,
      p95ResponseMs: 0,
      p99ResponseMs: 0,
      slowSearches: 0,
    },
    popular,
    daily,
    hourly,
    versionSummary,
    dictionarySummary: dictionarySummary ?? {
      total: 0,
      totalHits: 0,
      lastUpdated: null,
    },
    recentSearches,
    slowRecentSearches,
  };
}
