import "server-only";

import {
  createECDH,
  createHash,
  createPrivateKey,
  createPublicKey,
  sign,
  type KeyObject,
} from "node:crypto";
import type { LicenseTokenPayload } from "@/features/licenses/signing";

const PRIVATE_KEY_ENV = "LICENSE_SIGNING_PRIVATE_KEY";
const P256_ORDER = BigInt("0xffffffff00000000ffffffffffffffffbce6faada7179e84f3b9cac2fc632551");
const DOMAIN = Buffer.from("PlaySteno/SOGPlayer/ECDSA-P256/v1", "utf8");

let cachedPrivateKey: KeyObject | null = null;

function base64urlEncode(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64url");
}

function toFixed32(value: bigint): Buffer {
  return Buffer.from(value.toString(16).padStart(64, "0"), "hex");
}

/**
 * 기존 Ed25519 라이선스 비밀키에서 제품·알고리즘별 도메인 분리로 P-256 키를 파생한다.
 * 개인키 원문이나 파생키는 저장·노출하지 않으며, 속플레이어는 대응 공개키만 내장한다.
 */
function getPrivateKey(): KeyObject {
  if (cachedPrivateKey) return cachedPrivateKey;
  const pem = process.env[PRIVATE_KEY_ENV];
  if (!pem) throw new Error(`${PRIVATE_KEY_ENV} 환경변수가 설정되지 않았습니다.`);

  // 낱말지기 서명(features/licenses/signing.ts)과 같은 방식으로 PEM 머리·꼬리와 공백을 걷어내고 DER 로 읽는다.
  // Vercel 환경변수에 줄바꿈 없이 한 줄로 저장되거나 \n 이 글자로 들어가도 동작하게 하기 위함.
  const der = Buffer.from(
    pem
      .replace(/\\n/g, "")
      .replace(/-----BEGIN[^-]*-----/, "")
      .replace(/-----END[^-]*-----/, "")
      .replace(/\s+/g, ""),
    "base64"
  );
  const sourceJwk = createPrivateKey({ key: der, format: "der", type: "pkcs8" }).export({ format: "jwk" });
  if (!sourceJwk.d) throw new Error("라이선스 개인키에서 키 재료를 읽을 수 없습니다.");
  const seed = Buffer.from(sourceJwk.d, "base64url");
  const digest = createHash("sha256").update(DOMAIN).update(seed).digest();
  const scalar = (BigInt(`0x${digest.toString("hex")}`) % (P256_ORDER - BigInt(1))) + BigInt(1);
  const privateScalar = toFixed32(scalar);

  const ecdh = createECDH("prime256v1");
  ecdh.setPrivateKey(privateScalar);
  const publicPoint = ecdh.getPublicKey(undefined, "uncompressed");
  cachedPrivateKey = createPrivateKey({
    format: "jwk",
    key: {
      kty: "EC",
      crv: "P-256",
      d: privateScalar.toString("base64url"),
      x: publicPoint.subarray(1, 33).toString("base64url"),
      y: publicPoint.subarray(33, 65).toString("base64url"),
    },
  });
  return cachedPrivateKey;
}

/** 속플레이어의 .NET 기본 암호화 API로 검증 가능한 P-256 서명 토큰. */
export function signSogLicenseToken(payload: LicenseTokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = sign("sha256", data, {
    key: getPrivateKey(),
    dsaEncoding: "ieee-p1363",
  });
  return `${base64urlEncode(data)}.${base64urlEncode(signature)}`;
}

/** 배포 환경과 설치 파일의 내장 공개키가 일치하는지 확인할 때 사용하는 공개 정보. */
export function getSogLicensePublicKeySpkiBase64(): string {
  return createPublicKey(getPrivateKey())
    .export({ type: "spki", format: "der" })
    .toString("base64");
}
