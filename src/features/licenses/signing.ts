// src/features/licenses/signing.ts
// 라이선스 토큰 Ed25519 서명 — Web Crypto API 사용 (Node.js + Edge Runtime 모두 호환,
// features/auth/api-keys/token.ts 와 같은 이유로 node:crypto 대신 crypto.subtle 사용).
//
// 서버 개인키(LICENSE_SIGNING_PRIVATE_KEY, PEM)로 서명만 한다 — 검증은 클라이언트
// (hudtyping-local)가 하드코드된 공개키로 오프라인에서 수행한다.

export interface LicenseTokenPayload {
  licenseKey: string;
  fingerprint: string;
  plan: string;
  activatedAt: string; // ISO 8601
  expiresAt: string | null; // ISO 8601, lifetime이면 null
  activationId: number;
}

const PRIVATE_KEY_ENV = "LICENSE_SIGNING_PRIVATE_KEY";

let cachedPrivateKey: CryptoKey | null = null;

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, "")
    .replace(/-----END [^-]+-----/, "")
    .replace(/\s+/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function getPrivateKey(): Promise<CryptoKey> {
  if (cachedPrivateKey) return cachedPrivateKey;
  const pem = process.env[PRIVATE_KEY_ENV];
  if (!pem) {
    throw new Error(`${PRIVATE_KEY_ENV} 환경변수가 설정되지 않았습니다.`);
  }
  cachedPrivateKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(pem),
    "Ed25519",
    false,
    ["sign"]
  );
  return cachedPrivateKey;
}

/** Uint8Array/ArrayBuffer → base64url 문자열 (URL-safe, padding 제거) */
function base64urlEncode(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let str = "";
  for (const b of arr) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * 라이선스 토큰 서명. 형식: base64url(payload JSON) + "." + base64url(signature)
 * — JWT 라이브러리 없이 커스텀으로 만든 최소 형태.
 */
export async function signLicenseToken(payload: LicenseTokenPayload): Promise<string> {
  const privateKey = await getPrivateKey();
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("Ed25519", privateKey, data);
  return `${base64urlEncode(data)}.${base64urlEncode(signature)}`;
}
