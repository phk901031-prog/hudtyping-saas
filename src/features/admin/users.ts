// src/features/admin/users.ts
// 관리자가 회원을 다루는 동작들 (② Application).
// 호출자는 반드시 본인의 User 객체로 assertAdmin을 통과시킨 뒤 호출해야 함.

import { eq, desc, sql, gte, and, inArray } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { clerkClient } from "@/infrastructure/clerk";
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

// ──────────────────────────────────────────────────────────────────────
// 무제한 부여/해제
// ──────────────────────────────────────────────────────────────────────
/**
 * 회원에게 무제한 검색을 부여하거나 해제.
 *
 * 세 가지 모드:
 *   - { until: Date }    — 특정 시각까지 (캘린더/N일 UI 공통 저장 방식)
 *   - { permanent: true }— 기간 없이 영구 무제한
 *   - { clear: true }    — 부여 해제, 원래 monthlyLimit 로 복귀
 *
 * 세 값은 서로 배타적 — permanent 를 켜면 until 은 NULL 로, until 을 켜면 permanent 는 false 로.
 */
export type UnlimitedGrant =
  | { until: Date }
  | { permanent: true }
  | { clear: true };

// ──────────────────────────────────────────────────────────────────────
// 하드 딜리트 (완전 탈퇴 처리)
//
// 순서: Clerk 계정 삭제 → Neon users row 삭제
//   - Clerk 삭제 실패면 abort (Neon 은 손대지 않음 — 롤백 안전).
//   - Clerk 성공 후 Neon 이 실패하는 극단 케이스에선 orphan row 가 남지만,
//     Clerk 이 없으므로 그 사용자는 다시 로그인 못 함. 로그로 남겨 수동 정리.
//   - Neon FK CASCADE 로 search_logs · api_keys · desktop_tokens ·
//     desktop_connection_codes 자동 삭제. operator_dictionary_entries.created_by
//     는 SET NULL 이라 운영자 사전 항목은 유지 (익명 처리).
//
// 결과 코드:
//   - "deleted": 정상 완료
//   - "not-found": 이미 없음 (idempotent 성공)
//   - "clerk-failed": Clerk 삭제 실패 (Neon 은 그대로)
// ──────────────────────────────────────────────────────────────────────
export type HardDeleteResult =
  | { status: "deleted" }
  | { status: "not-found" }
  | { status: "clerk-failed"; message: string };

export async function deleteUserHard(clerkId: string): Promise<HardDeleteResult> {
  // Clerk 계정 삭제 (없으면 404 → not-found 로 처리)
  try {
    const clerk = await clerkClient();
    await clerk.users.deleteUser(clerkId);
  } catch (err) {
    const status = (err as { status?: number })?.status;
    if (status !== 404) {
      console.error("[admin/users/hard-delete] Clerk 삭제 실패:", err);
      const message =
        err instanceof Error ? err.message : "Clerk 계정 삭제 실패";
      return { status: "clerk-failed", message };
    }
    // 404 → Clerk 에 이미 없음. 계속 진행해 Neon 정리.
  }

  const deleted = await db
    .delete(users)
    .where(eq(users.clerkId, clerkId))
    .returning({ clerkId: users.clerkId });

  if (deleted.length === 0) {
    return { status: "not-found" };
  }
  return { status: "deleted" };
}

export async function updateUserUnlimited(
  clerkId: string,
  grant: UnlimitedGrant
): Promise<User | null> {
  let patch: {
    unlimitedUntil: Date | null;
    unlimitedPermanent: boolean;
    updatedAt: Date;
  };
  if ("clear" in grant) {
    patch = {
      unlimitedUntil: null,
      unlimitedPermanent: false,
      updatedAt: new Date(),
    };
  } else if ("permanent" in grant) {
    patch = {
      unlimitedUntil: null,
      unlimitedPermanent: true,
      updatedAt: new Date(),
    };
  } else {
    patch = {
      unlimitedUntil: grant.until,
      unlimitedPermanent: false,
      updatedAt: new Date(),
    };
  }

  const [updated] = await db
    .update(users)
    .set(patch)
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
