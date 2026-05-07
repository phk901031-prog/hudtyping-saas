// src/features/auth/api-keys/service.ts
// API 키 도메인의 비즈니스 흐름 (② Application).
//
// route.ts들은 이 service의 함수만 호출 — DB 쿼리·해시 알고리즘은 직접 다루지 않음.

import { eq, and, desc } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { apiKeys, users, type User } from "@/infrastructure/db/schema";
import { generateApiKey, hashToken } from "./token";
import { isOfficialBinary } from "@/features/security/binary-verification";

/** 사용자가 이미 키를 가진 상태에서 새 발급 시도 시 throw */
export class ApiKeyAlreadyExistsError extends Error {
  constructor() {
    super(
      "이미 발급된 API 키가 있어요. 재발급하려면 기존 키를 먼저 삭제해주세요."
    );
    this.name = "ApiKeyAlreadyExistsError";
  }
}

/**
 * 새 키 발급.
 * - **사용자 1인당 키 1개만 허용**. 이미 있으면 ApiKeyAlreadyExistsError throw.
 * - 응답에 평문 토큰(plain)이 포함되니 1회만 노출 후 클라이언트에서 즉시 보관해야 함.
 * - DB에는 SHA256 해시만 저장.
 */
export async function createApiKey(clerkId: string, name: string) {
  // 1개 제한 검사
  const existing = await db
    .select({ id: apiKeys.id })
    .from(apiKeys)
    .where(eq(apiKeys.clerkId, clerkId))
    .limit(1);
  if (existing.length > 0) {
    throw new ApiKeyAlreadyExistsError();
  }

  const { plain, prefix, hash } = await generateApiKey();
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
 * Authorization 헤더의 Bearer 토큰 + 클라이언트 .exe hash를 함께 검증.
 *
 * 검증 실패 케이스 (모두 null):
 *   - Bearer 헤더 없음/형식 오류
 *   - API 키 해시 매치 실패
 *   - 사용자 status ≠ approved
 *   - clientHash 누락 — Bearer 인증은 반드시 X-Client-Hash 동반 (변조 .exe 차단)
 *   - clientHash가 official_binaries 화이트리스트에 없음
 *
 * 통과 시: User 반환 + last_used_at 갱신 (fire-and-forget)
 */
export async function verifyApiKeyFromHeader(
  authHeader: string | null,
  clientHash: string | null
): Promise<User | null> {
  if (!authHeader) return null;

  const match = authHeader.match(/^Bearer\s+(\S+)$/);
  if (!match) return null;
  const plain = match[1];

  // ⚠️ 클라이언트 무결성 검증 — Bearer 인증은 .exe에서만 와야 하므로 hash 필수.
  // 변조된 .exe → hash 매치 실패 → 인증 거부.
  if (!clientHash) {
    console.warn("[binary-verify] X-Client-Hash 헤더 누락 — 옛 버전 또는 우회 시도");
    return null;
  }
  if (!(await isOfficialBinary(clientHash))) {
    console.warn(
      `[binary-verify] hash 매치 실패: ${clientHash.slice(0, 12)}...`
    );
    return null;
  }

  const hash = await hashToken(plain);
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

  // last_used_at 갱신은 fire-and-forget — await 안 해서 응답에 ~50ms 절약.
  // 메타데이터 성격이라 어쩌다 한 번 누락돼도 critical 아님.
  // (Vercel serverless에서 함수 종료 후 promise가 drop될 가능성은 있지만
  //  보통 짧은 UPDATE는 무사히 실행됨.)
  void db
    .update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, apiKey.id))
    .catch((err) => {
      console.error("[api-keys] last_used_at 갱신 실패:", err);
    });

  return user;
}
