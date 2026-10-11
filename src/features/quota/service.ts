// src/features/quota/service.ts
// 월 검색 한도 비즈니스 로직 (② Application).
//
// 정책:
//   - 일반 사용자: users.monthly_limit (개별 override) ?? app_settings.default_monthly_limit (전역 기본값)
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
import { appSettings, searchLogs, type User } from "@/infrastructure/db/schema";

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
const DEFAULT_LIMIT_CACHE_KEY = "config:default-monthly-limit";
const DEFAULT_LIMIT_CACHE_TTL_SECONDS = 300;
// app_settings row(id=1)가 아직 없을 때만 쓰는 최후 폴백 — 정상 운영 중엔 안 쓰임.
const DEFAULT_LIMIT_FALLBACK = 500;
const APP_SETTINGS_ROW_ID = 1;

/**
 * 전역 월 검색 한도 기본값. users.monthly_limit이 NULL인 모든 사용자가 이 값을 따른다.
 * Redis에 5분 캐시 — 검색마다 Neon을 추가로 타지 않게.
 */
export async function getDefaultMonthlyLimit(): Promise<number> {
  const cached = await redis.get<number>(DEFAULT_LIMIT_CACHE_KEY);
  if (cached !== null) return cached;

  const [row] = await db
    .select({ value: appSettings.defaultMonthlyLimit })
    .from(appSettings)
    .where(eq(appSettings.id, APP_SETTINGS_ROW_ID))
    .limit(1);
  const value = row?.value ?? DEFAULT_LIMIT_FALLBACK;

  await redis.set(DEFAULT_LIMIT_CACHE_KEY, value, {
    ex: DEFAULT_LIMIT_CACHE_TTL_SECONDS,
  });
  return value;
}

/** 관리자가 전역 월 검색 한도 기본값을 바꿀 때 호출. Neon에 upsert 후 Redis 캐시 갱신. */
export async function setDefaultMonthlyLimit(value: number): Promise<number> {
  await db
    .insert(appSettings)
    .values({ id: APP_SETTINGS_ROW_ID, defaultMonthlyLimit: value })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: { defaultMonthlyLimit: value, updatedAt: new Date() },
    });
  await redis.set(DEFAULT_LIMIT_CACHE_KEY, value, {
    ex: DEFAULT_LIMIT_CACHE_TTL_SECONDS,
  });
  return value;
}

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
  // 개별 override(숫자)가 없으면 전역 기본값을 따른다.
  const limit = user.monthlyLimit ?? (await getDefaultMonthlyLimit());

  if (user.role === "admin") {
    return {
      usage: 0,
      limit,
      unlimited: true,
      unlimitedReason: "admin",
      resetAt,
    };
  }

  if (user.unlimitedPermanent) {
    return {
      usage: 0,
      limit,
      unlimited: true,
      unlimitedReason: "permanent",
      resetAt,
    };
  }

  if (user.unlimitedUntil && user.unlimitedUntil.getTime() > Date.now()) {
    return {
      usage: 0,
      limit,
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
      limit,
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
  return { usage, limit, unlimited: false, resetAt };
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
