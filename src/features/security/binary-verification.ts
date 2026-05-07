// src/features/security/binary-verification.ts
// 클라이언트 .exe 무결성 검증 (② Application).
//
// 정책:
//   - 빌드된 공식 .exe의 SHA-256만 official_binaries 테이블에 등록
//   - 사용자가 보낸 hash가 그 화이트리스트에 있으면 정직한 빌드로 인정
//   - 변조된 .exe → hash 다름 → 검증 실패
//
// Redis 캐시:
//   - hash → boolean을 1시간 TTL로 캐시
//   - DB hit 줄여 매 요청마다 ~5ms로 검증

import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { redis } from "@/infrastructure/redis";
import { officialBinaries } from "@/infrastructure/db/schema";

const CACHE_TTL_SECONDS = 3600;
const SHA256_HEX_LENGTH = 64;

/**
 * 클라이언트 hash가 공식 빌드 hash와 매치하는지 검증.
 *
 * 반환:
 *   - true: 공식 빌드 (검색 허용)
 *   - false: hash 형식 오류 또는 매치 실패 (변조 의심 → 검색 거부)
 */
export async function isOfficialBinary(hash: string): Promise<boolean> {
  // 형식 검증 — SHA-256 hex는 정확히 64자
  if (!hash || hash.length !== SHA256_HEX_LENGTH) return false;
  if (!/^[a-f0-9]+$/i.test(hash)) return false;

  const normalized = hash.toLowerCase();
  const cacheKey = `binary:${normalized}`;

  // Redis 캐시
  const cached = await redis.get<boolean>(cacheKey);
  if (cached !== null) return cached;

  // DB 조회
  const [row] = await db
    .select({ id: officialBinaries.id })
    .from(officialBinaries)
    .where(eq(officialBinaries.sha256, normalized))
    .limit(1);

  const ok = !!row;
  await redis.set(cacheKey, ok, { ex: CACHE_TTL_SECONDS });
  return ok;
}
