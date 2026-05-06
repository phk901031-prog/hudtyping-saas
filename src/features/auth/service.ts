// src/features/auth/service.ts
// 두 인증 방식을 통합한 헬퍼 (② Application).
//
// API 라우트들은 이 한 함수만 호출하면 됨 — Bearer/Clerk 분기는 여기 안에서.

import type { NextRequest } from "next/server";
import type { User } from "@/infrastructure/db/schema";
import { verifyApiKeyFromHeader } from "./api-keys/service";
import { getOrCreateCurrentUser } from "@/features/users/service";

/**
 * 두 인증 경로 중 하나라도 통과하면 User 반환. 둘 다 실패면 null.
 *
 *   1) Authorization: Bearer hk_live_... → 로컬 HUD/외부 도구
 *   2) Clerk 쿠키                       → 브라우저 SaaS 사용자 (JIT 자동 등록)
 *
 * 두 경로 모두 status='approved' 검사 포함.
 */
export async function authenticate(req: NextRequest): Promise<User | null> {
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    return verifyApiKeyFromHeader(authHeader);
  }

  const user = await getOrCreateCurrentUser();
  if (!user || user.status !== "approved") return null;
  return user;
}
