// src/features/quota/service.ts
// 월 검색 한도 비즈니스 로직 (② Application).
//
// 정책:
//   - 일반 사용자: users.monthly_limit (기본 500회/월)
//   - 관리자(role='admin'): 무제한
//   - 리셋: 매월 1일 0시 UTC
//   - 캐시 hit/miss 모두 1회 카운트
//
// 성능 최적화:
//   - 매 검색마다 search_logs COUNT 하면 ~50ms 추가
//   - 대신 Redis에 사용량 카운터 캐시 (TTL 60초)
//   - 60초 stale 허용 — 한도 초과 판정이 잠깐 늦을 수 있지만 실용상 무관
//   - 키에 월 prefix 포함 → 매월 자동 reset
//   - logSearch 후 Redis incr로 사용량 자동 갱신 (다음 캐시 새로고침 전까지 정확)

import { sql, and, eq, gte } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { redis } from "@/infrastructure/redis";
import { searchLogs, type User } from "@/infrastructure/db/schema";

export type UnlimitedReason = "admin" | "permanent" | "timed";

export interface QuotaInfo {
  /** 이번 달(UTC 기준) 검색 횟수 */
  usage: number;
  /** 월 한도 */
  limit: number;
  /** 무제한 여부 (admin · 영구 무제한 · 기간제 무제한 중 하나) */
  unlimited: boolean;
  /** 무제한 사유 — 클라이언트가 배지 표시할 때 참고 */
  unlimitedReason?: UnlimitedReason;
  /** 기간제 무제한일 경우 만료 시각 ISO 8601 */
  unlimitedUntil?: string;
  /** 다음 리셋 시각 ISO 8601 (월 한도 기준) */
  resetAt: string;
}

const QUOTA_CACHE_TTL_SECONDS = 60;

/** "2026-05" 형태의 월 키 — Redis 캐시 키에 포함되어 매월 자동 reset */
function currentMonthKey(): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
}

function startOfThisMonthUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
}

function startOfNextMonthUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)
  );
}

function quotaCacheKey(clerkId: string): string {
  return `quota:${clerkId}:${currentMonthKey()}`;
}

/**
 * 사용자의 현재 한도/사용량.
 * Redis 캐시 우선 → miss면 DB COUNT → 캐시 저장.
 */
export async function getQuota(user: User): Promise<QuotaInfo> {
  const resetAt = startOfNextMonthUTC().toISOString();

  if (user.role === "admin") {
    return {
      usage: 0,
      limit: user.monthlyLimit,
      unlimited: true,
      unlimitedReason: "admin",
      resetAt,
    };
  }

  if (user.unlimitedPermanent) {
    return {
      usage: 0,
      limit: user.monthlyLimit,
      unlimited: true,
      unlimitedReason: "permanent",
      resetAt,
    };
  }

  if (user.unlimitedUntil && user.unlimitedUntil.getTime() > Date.now()) {
    return {
      usage: 0,
      limit: user.monthlyLimit,
      unlimited: true,
      unlimitedReason: "timed",
      unlimitedUntil: user.unlimitedUntil.toISOString(),
      resetAt,
    };
  }

  const cacheKey = quotaCacheKey(user.clerkId);

  // 1) Redis hit
  const cached = await redis.get<number>(cacheKey);
  if (cached !== null) {
    return {
      usage: cached,
      limit: user.monthlyLimit,
      unlimited: false,
      resetAt,
    };
  }

  // 2) miss → DB 조회 후 캐시
  const [row] = await db
    .select({ cnt: sql<number>`COUNT(*)::int` })
    .from(searchLogs)
    .where(
      and(
        eq(searchLogs.clerkId, user.clerkId),
        gte(searchLogs.createdAt, startOfThisMonthUTC())
      )
    );
  const usage = row?.cnt ?? 0;

  await redis.set(cacheKey, usage, { ex: QUOTA_CACHE_TTL_SECONDS });
  return { usage, limit: user.monthlyLimit, unlimited: false, resetAt };
}

/**
 * 검색 허용 여부 + 한도 정보.
 * 호출자가 allowed=false면 429 + quota를 응답으로.
 */
export async function checkQuota(
  user: User
): Promise<{ allowed: boolean; quota: QuotaInfo }> {
  const quota = await getQuota(user);
  const allowed = quota.unlimited || quota.usage < quota.limit;
  return { allowed, quota };
}

/**
 * 검색 1회 직후 호출 — Redis 카운터 +1.
 * search_logs INSERT는 호출자(@/features/search/service.ts의 logSearch)가 따로 처리.
 * 캐시가 비어있으면(처음이면) incr이 1로 만들고 TTL 부여.
 */
export async function incrementQuotaUsage(clerkId: string): Promise<void> {
  const cacheKey = quotaCacheKey(clerkId);
  try {
    const current = await redis.incr(cacheKey);
    // TTL 갱신 — 매 incr 후 TTL 재설정 (Redis는 incr이 TTL 유지하지만 새 키엔 TTL 없음)
    if (current === 1) {
      await redis.expire(cacheKey, QUOTA_CACHE_TTL_SECONDS);
    }
  } catch (err) {
    console.error("[quota] incr 실패:", err);
  }
}
