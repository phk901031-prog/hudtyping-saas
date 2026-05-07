// src/features/auth/api-keys/token.ts
// API 키 토큰 생성/해시 — 순수 함수 (③ Domain).
//
// 모든 함수가 Web Crypto API 사용 → Node.js 18+ 와 Vercel Edge Runtime 모두 호환.
// (이전 `node:crypto` import는 edge에서 작동 안 함.)

const TOKEN_PREFIX = "hk_live_";
const PREFIX_DISPLAY_LENGTH = 16;

export interface GeneratedToken {
  /** 사용자에게 1회만 보여줄 평문 */
  plain: string;
  /** UI 식별용 (예: "hk_live_a1b2c3d4") */
  prefix: string;
  /** DB에 저장될 SHA256 해시 */
  hash: string;
}

/** 새 API 키 생성 — 평문/prefix/hash 함께 반환 */
export async function generateApiKey(): Promise<GeneratedToken> {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  const random = base64urlEncode(bytes);
  const plain = `${TOKEN_PREFIX}${random}`;
  const prefix = plain.slice(0, PREFIX_DISPLAY_LENGTH);
  const hash = await hashToken(plain);
  return { plain, prefix, hash };
}

/** 평문 토큰을 SHA256 해시로 (Web Crypto API) */
export async function hashToken(plain: string): Promise<string> {
  const data = new TextEncoder().encode(plain);
  const hashBuffer = await globalThis.crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Uint8Array → base64url 문자열 (URL-safe, padding 제거) */
function base64urlEncode(bytes: Uint8Array): string {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  // btoa는 Web API — Node 16+, Edge Runtime 모두 globalThis에 있음
  return btoa(str)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
