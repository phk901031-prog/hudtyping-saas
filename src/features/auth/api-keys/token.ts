// src/features/auth/api-keys/token.ts
// API 키 토큰 생성/해시 — 순수 함수 (③ Domain).
// I/O 없음. DB·외부 SDK 모름. 단위 테스트 용이.

import crypto from "crypto";

// 토큰 형식: "hk_live_" + 32바이트 base64url 인코딩 (43자)
//   - hk = hudtyping
//   - live = 운영 환경 (나중에 'test' prefix로 테스트 키 분리 가능)
const TOKEN_PREFIX = "hk_live_";
const PREFIX_DISPLAY_LENGTH = 16; // "hk_live_a1b2c3d4" 까지를 식별용으로 보여줌

export interface GeneratedToken {
  /** 사용자에게 1회만 보여줄 평문. 절대 DB에 저장하지 말 것. */
  plain: string;
  /** UI에서 키 식별용으로 보여줄 앞부분 (예: "hk_live_a1b2c3d4") */
  prefix: string;
  /** DB에 저장될 SHA256 해시 (검증 시 같은 함수로 비교) */
  hash: string;
}

/** 새 API 키 생성 — 평문/prefix/hash를 함께 반환. */
export function generateApiKey(): GeneratedToken {
  const random = crypto.randomBytes(32).toString("base64url");
  const plain = `${TOKEN_PREFIX}${random}`;
  const prefix = plain.slice(0, PREFIX_DISPLAY_LENGTH);
  const hash = hashToken(plain);
  return { plain, prefix, hash };
}

/** 평문 토큰을 SHA256 해시로 변환. 입력 토큰 검증 시에도 같은 함수로 비교. */
export function hashToken(plain: string): string {
  return crypto.createHash("sha256").update(plain).digest("hex");
}
