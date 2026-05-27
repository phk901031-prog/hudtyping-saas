// src/features/admin/users.ts
// 관리자가 회원을 다루는 동작들 (② Application).
// 호출자는 반드시 본인의 User 객체로 assertAdmin을 통과시킨 뒤 호출해야 함.

import { eq, desc, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  users,
  searchLogs,
  type User,
  type UserStatus,
  type UserRole,
} from "@/infrastructure/db/schema";

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
      firstSearch: sql<Date | null>`MIN(${searchLogs.createdAt})`,
      lastSearch: sql<Date | null>`MAX(${searchLogs.createdAt})`,
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
    firstSearch: summary?.firstSearch ?? null,
    lastSearch: summary?.lastSearch ?? null,
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
  Array<{ query: string; cacheHit: boolean; createdAt: Date }>
> {
  return db
    .select({
      query: searchLogs.query,
      cacheHit: searchLogs.cacheHit,
      createdAt: searchLogs.createdAt,
    })
    .from(searchLogs)
    .where(eq(searchLogs.clerkId, clerkId))
    .orderBy(desc(searchLogs.createdAt))
    .limit(limit);
}
