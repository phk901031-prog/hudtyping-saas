// src/features/users/service.ts
// Users 도메인의 비즈니스 흐름 (② Application).
//
// 핵심: JIT(Just-In-Time) provisioning
//   사용자가 페이지 진입 시 우리 DB에 row 없으면 Clerk 정보로 자동 생성.
//   → Clerk webhook 등록 안 된 환경(로컬 개발)에서도 모든 인증 흐름 정상 동작.

import { eq } from "drizzle-orm";
import { auth, clerkClient } from "@/infrastructure/clerk";
import { db } from "@/infrastructure/db";
import { users, type User } from "@/infrastructure/db/schema";

/**
 * 현재 로그인한 사용자의 DB row를 가져온다.
 * - 비로그인이면 null 반환.
 * - DB에 row가 없으면 Clerk에서 사용자 정보를 가져와 자동 생성한다 (status='pending').
 * - 다시 호출돼도 멱등 (`onConflictDoNothing`).
 */
export async function getOrCreateCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // 1) 일반 경로: 이미 DB에 있는 경우 (전체 호출의 99% 케이스)
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);
  if (existing.length > 0) return existing[0];

  // 2) JIT provisioning: 처음 본 사용자 → Clerk에서 정보 가져와 INSERT
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;
  if (!email) {
    throw new Error(`Clerk 사용자(${userId})에게 이메일이 없습니다.`);
  }

  const [created] = await db
    .insert(users)
    .values({ clerkId: userId, email })
    .onConflictDoNothing()
    .returning();

  // 동시 요청으로 INSERT가 무시된 경우 → 재조회
  if (!created) {
    const refetch = await db
      .select()
      .from(users)
      .where(eq(users.clerkId, userId))
      .limit(1);
    return refetch[0];
  }

  return created;
}
