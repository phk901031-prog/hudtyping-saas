// src/features/admin/users.ts
// 관리자가 회원을 다루는 동작들 (② Application).
// 호출자는 반드시 본인의 User 객체로 assertAdmin을 통과시킨 뒤 호출해야 함.

import { eq, desc, sql, gte, and, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  users,
  searchLogs,
  type User,
  type UserStatus,
  type UserRole,
} from "@/infrastructure/db/schema";

/** UTC 기준 이번달 시작 — quota/service.ts 와 동일 기준 */
function startOfThisMonthUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
}

/**
 * 회원 목록.
 * @param filter.status — 특정 status만 (없으면 전체)
 * - 가입일 역순 정렬
 */
export async function listUsers(filter?: {
  status?: UserStatus;
}): Promise<User[]> {
  if (filter?.status) {
    return db
      .select()
      .from(users)
      .where(eq(users.status, filter.status))
      .orderBy(desc(users.createdAt));
  }
  return db.select().from(users).orderBy(desc(users.createdAt));
}

/**
 * 회원 목록 + 활동 정보 (이번달 검색 수 + 마지막 검색).
 * /admin/users 인라인 표시용. 정렬은 listUsers와 동일(가입일 역순).
 *
 * 쿼리 3개를 병렬로 묶고 JS에서 merge:
 *   1) users 목록
 *   2) clerk_id별 이번달 검색 수 (GROUP BY)
 *   3) clerk_id별 마지막 검색 (DISTINCT ON)
 * 사용자 수 30명 규모면 충분히 가볍다.
 */
export type UserWithActivity = User & {
  monthlyCount: number;
  totalCount: number;
  cacheHitCount: number;
  failureCount: number;
  avgResponseMs: number;
  lastQuery: string | null;
  lastSearchAt: Date | null;
  lastAppVersion: string | null;
};

export async function listUsersWithActivity(filter?: {
  status?: UserStatus;
}): Promise<UserWithActivity[]> {
  const usersList = await listUsers(filter);
  if (usersList.length === 0) return [];

  const monthStart = startOfThisMonthUTC();
  const clerkIds = usersList.map((u) => u.clerkId);

  const [monthlyRows, totalRows, lastRows] = await Promise.all([
    db
      .select({
        clerkId: searchLogs.clerkId,
        cnt: sql<number>`COUNT(*)::int`,
      })
      .from(searchLogs)
      .where(
        and(
          gte(searchLogs.createdAt, monthStart),
          inArray(searchLogs.clerkId, clerkIds)
        )
      )
      .groupBy(searchLogs.clerkId),
    db
      .select({
        clerkId: searchLogs.clerkId,
        total: sql<number>`COUNT(*)::int`,
        cacheHits: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.cacheHit} THEN 1 ELSE 0 END), 0)::int`,
        failures: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.status} <> 'success' THEN 1 ELSE 0 END), 0)::int`,
        avgResponseMs: sql<number>`COALESCE(ROUND(AVG(${searchLogs.responseMs})), 0)::int`,
      })
      .from(searchLogs)
      .where(inArray(searchLogs.clerkId, clerkIds))
      .groupBy(searchLogs.clerkId),
    db
      .selectDistinctOn([searchLogs.clerkId], {
        clerkId: searchLogs.clerkId,
        query: searchLogs.query,
        createdAt: searchLogs.createdAt,
        appVersion: searchLogs.appVersion,
      })
      .from(searchLogs)
      .where(inArray(searchLogs.clerkId, clerkIds))
      .orderBy(searchLogs.clerkId, desc(searchLogs.createdAt)),
  ]);

  const monthlyMap = new Map(monthlyRows.map((r) => [r.clerkId, r.cnt]));
  const totalMap = new Map(
    totalRows.map((r) => [
      r.clerkId,
      {
        total: Number(r.total),
        cacheHits: Number(r.cacheHits),
        failures: Number(r.failures),
        avgResponseMs: Number(r.avgResponseMs),
      },
    ])
  );
  const lastMap = new Map(
    lastRows.map((r) => [
      r.clerkId,
      { query: r.query, createdAt: r.createdAt, appVersion: r.appVersion },
    ])
  );

  return usersList.map((u) => {
    const last = lastMap.get(u.clerkId);
    return {
      ...u,
      monthlyCount: monthlyMap.get(u.clerkId) ?? 0,
      totalCount: totalMap.get(u.clerkId)?.total ?? 0,
      cacheHitCount: totalMap.get(u.clerkId)?.cacheHits ?? 0,
      failureCount: totalMap.get(u.clerkId)?.failures ?? 0,
      avgResponseMs: totalMap.get(u.clerkId)?.avgResponseMs ?? 0,
      lastQuery: last?.query ?? null,
      lastSearchAt: last?.createdAt ?? null,
      lastAppVersion: last?.appVersion ?? null,
    };
  }).sort((a, b) => {
    if (b.monthlyCount !== a.monthlyCount) return b.monthlyCount - a.monthlyCount;
    const bTime = b.lastSearchAt?.getTime() ?? 0;
    const aTime = a.lastSearchAt?.getTime() ?? 0;
    return bTime - aTime;
  });
}

/** 사용자 status 변경 (승인/거절) */
export async function updateUserStatus(
  clerkId: string,
  status: UserStatus
): Promise<User | null> {
  const [updated] = await db
    .update(users)
    .set({ status, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId))
    .returning();
  return updated ?? null;
}

/** 사용자 role 변경 (admin 임명/해제) */
export async function updateUserRole(
  clerkId: string,
  role: UserRole
): Promise<User | null> {
  const [updated] = await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId))
    .returning();
  return updated ?? null;
}

/** 월 검색 한도 변경 — 관리자가 사용자별로 조정 (예: VIP는 5000) */
export async function updateUserMonthlyLimit(
  clerkId: string,
  monthlyLimit: number
): Promise<User | null> {
  const [updated] = await db
    .update(users)
    .set({ monthlyLimit, updatedAt: new Date() })
    .where(eq(users.clerkId, clerkId))
    .returning();
  return updated ?? null;
}

// ──────────────────────────────────────────────────────────────────
// 사용자 상세 조회 (관리자가 "누가 뭘 검색했는지" 보는 화면용)
// ──────────────────────────────────────────────────────────────────

/** 특정 사용자 row 1건. 없으면 null. */
export async function getUserById(clerkId: string): Promise<User | null> {
  const [row] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, clerkId))
    .limit(1);
  return row ?? null;
}

/**
 * 한 사용자의 검색 활동 요약 + 인기 검색어.
 * /admin/users/[id] 페이지에서 사용.
 */
export async function getUserSearchActivity(clerkId: string) {
  // 1) 요약 집계
  const [summary] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      cacheHits: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.cacheHit} THEN 1 ELSE 0 END), 0)::int`,
      failures: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.status} <> 'success' THEN 1 ELSE 0 END), 0)::int`,
      avgResponseMs: sql<number>`COALESCE(ROUND(AVG(${searchLogs.responseMs})), 0)::int`,
      slowSearches: sql<number>`COALESCE(SUM(CASE WHEN ${searchLogs.responseMs} >= 5000 THEN 1 ELSE 0 END), 0)::int`,
      firstSearch: sql<Date | null>`MIN(${searchLogs.createdAt})`,
      lastSearch: sql<Date | null>`MAX(${searchLogs.createdAt})`,
      lastAppVersion: sql<string | null>`(ARRAY_AGG(${searchLogs.appVersion} ORDER BY ${searchLogs.createdAt} DESC))[1]`,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId));

  // 2) 인기 검색어 top 20 (이 사용자만)
  const popular = await db
    .select({
      query: searchLogs.query,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId))
    .groupBy(searchLogs.query)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(20);

  return {
    total: summary?.total ?? 0,
    cacheHits: Number(summary?.cacheHits ?? 0),
    failures: Number(summary?.failures ?? 0),
    avgResponseMs: Number(summary?.avgResponseMs ?? 0),
    slowSearches: Number(summary?.slowSearches ?? 0),
    firstSearch: summary?.firstSearch ?? null,
    lastSearch: summary?.lastSearch ?? null,
    lastAppVersion: summary?.lastAppVersion ?? null,
    popular,
  };
}

/**
 * 한 사용자의 최근 검색 기록.
 * limit 기본 100. 페이지네이션은 향후 필요해지면 추가.
 */
export async function getUserSearchHistory(
  clerkId: string,
  limit = 100
): Promise<
  Array<{
    query: string;
    cacheHit: boolean;
    status: string;
    errorCode: string | null;
    responseMs: number | null;
    appVersion: string | null;
    createdAt: Date;
  }>
> {
  return db
    .select({
      query: searchLogs.query,
      cacheHit: searchLogs.cacheHit,
      status: searchLogs.status,
      errorCode: searchLogs.errorCode,
      responseMs: searchLogs.responseMs,
      appVersion: searchLogs.appVersion,
      createdAt: searchLogs.createdAt,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId))
    .orderBy(desc(searchLogs.createdAt))
    .limit(limit);
}
