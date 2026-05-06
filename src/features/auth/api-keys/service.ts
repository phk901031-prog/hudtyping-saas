// src/features/auth/api-keys/service.ts
// API 키 도메인의 비즈니스 흐름 (② Application).
//
// route.ts들은 이 service의 함수만 호출 — DB 쿼리·해시 알고리즘은 직접 다루지 않음.

import { eq, and, desc } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { apiKeys, users, type User } from "@/infrastructure/db/schema";
import { generateApiKey, hashToken } from "./token";

/**
 * 새 키 발급.
 * 응답에 평문 토큰(plain)이 포함되니 1회만 노출 후 클라이언트에서 즉시 보관해야 함.
 * DB에는 SHA256 해시만 저장.
 */
export async function createApiKey(clerkId: string, name: string) {
  const { plain, prefix, hash } = generateApiKey();
  const [created] = await db
    .insert(apiKeys)
    .values({ clerkId, name, prefix, hash })
    .returning({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      createdAt: apiKeys.createdAt,
    });
  return { ...created, plain };
}

/**
 * 사용자의 키 목록 — 평문/해시는 노출하지 않음.
 * 본인 키만 돌려주려면 clerkId 검증을 호출자에서 했다고 가정 (이 함수는 받은 clerkId 그대로 WHERE).
 */
export async function listApiKeys(clerkId: string) {
  return db
    .select({
      id: apiKeys.id,
      name: apiKeys.name,
      prefix: apiKeys.prefix,
      lastUsedAt: apiKeys.lastUsedAt,
      createdAt: apiKeys.createdAt,
    })
    .from(apiKeys)
    .where(eq(apiKeys.clerkId, clerkId))
    .orderBy(desc(apiKeys.createdAt));
}

/**
 * 본인 키 삭제 (revoke).
 * - WHERE에 clerkId 강제 → 남의 id 추측해도 못 지움.
 * - 성공: true, 키 없음/권한 없음: false.
 */
export async function revokeApiKey(
  clerkId: string,
  id: number
): Promise<boolean> {
  const result = await db
    .delete(apiKeys)
    .where(and(eq(apiKeys.id, id), eq(apiKeys.clerkId, clerkId)))
    .returning({ id: apiKeys.id });
  return result.length > 0;
}

/**
 * Authorization 헤더의 Bearer 토큰을 검증.
 * - 헤더 없음/형식 오류 → null
 * - 해시 매치 안 됨 → null
 * - status≠approved → null
 * - 통과: User 반환 + last_used_at 갱신
 */
export async function verifyApiKeyFromHeader(
  authHeader: string | null
): Promise<User | null> {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(\S+)$/);
  if (!match) return null;
  const plain = match[1];

  const hash = hashToken(plain);
  const rows = await db
    .select({ apiKey: apiKeys, user: users })
    .from(apiKeys)
    .innerJoin(users, eq(users.clerkId, apiKeys.clerkId))
    .where(eq(apiKeys.hash, hash))
    .limit(1);

  if (rows.length === 0) return null;
  const { apiKey, user } = rows[0];

  // 보안: 승인된 사용자만 통과
  if (user.status !== "approved") return null;

  // last_used_at 갱신 (실패해도 인증 자체는 성공이므로 try/catch)
  try {
    await db
      .update(apiKeys)
      .set({ lastUsedAt: new Date() })
      .where(eq(apiKeys.id, apiKey.id));
  } catch (err) {
    console.error("[api-keys] last_used_at 갱신 실패:", err);
  }

  return user;
}
