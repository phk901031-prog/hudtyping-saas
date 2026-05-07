// src/features/admin/users.ts
// 관리자가 회원을 다루는 동작들 (② Application).
// 호출자는 반드시 본인의 User 객체로 assertAdmin을 통과시킨 뒤 호출해야 함.

import { eq, desc } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  users,
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
