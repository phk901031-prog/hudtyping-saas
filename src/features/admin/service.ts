// src/features/admin/service.ts
// 관리자 도메인 (② Application).
//
// 권한 검사·회원 관리·전체 통계.
// 호출자는 반드시 본인의 User 객체를 갖고 와서 assertAdmin을 통과시켜야 함.

import { eq, sql, desc, gte } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  users,
  searchLogs,
  type User,
  type UserStatus,
  type UserRole,
} from "@/infrastructure/db/schema";

/** 일반 사용자가 admin 동작을 시도했을 때 throw할 에러 */
export class AdminPermissionError extends Error {
  constructor() {
    super("관리자 권한이 필요합니다.");
    this.name = "AdminPermissionError";
  }
}

/** admin 권한 강제 검사. 일반 사용자면 throw. */
export function assertAdmin(user: User): void {
  if (user.role !== "admin") {
    throw new AdminPermissionError();
  }
}

// ──────────────────────────────────────────────────────────────────────
// 회원 관리
// ──────────────────────────────────────────────────────────────────────

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
// 전체 통계 (개인 통계는 features/search/service.ts의 getMyStats)
// ──────────────────────────────────────────────────────────────────────

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
