// src/features/quota/service.ts
// 월 검색 한도 관련 비즈니스 로직 (② Application).
//
// 정책:
//   - 일반 사용자: users.monthly_limit (기본 500회/월)
//   - 관리자(role='admin'): 무제한 (한도 체크 스킵)
//   - 리셋: 매월 1일 0시 0분 (UTC)
//   - 캐시 hit/miss 모두 1회로 카운트 (단순성·일관성)
//
// 사용 위치:
//   - /api/search 라우트: 검색 전 checkQuota → 초과 시 429 응답
//   - /stats 페이지: getQuota로 사용량 표시

import { sql, and, eq, gte } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { searchLogs, type User } from "@/infrastructure/db/schema";

export interface QuotaInfo {
  /** 이번 달(UTC 기준) 검색 횟수 */
  usage: number;
  /** 월 한도. unlimited=true면 의미 없음 */
  limit: number;
  /** 무제한 여부 (admin) */
  unlimited: boolean;
  /** 다음 리셋 시각 (다음 달 1일 0시 UTC) */
  resetAt: string; // ISO 8601 — JSON 직렬화 호환
}

/** UTC 기준 이번 달 1일 0시 */
function startOfThisMonthUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)
  );
}

/** UTC 기준 다음 달 1일 0시 */
function startOfNextMonthUTC(): Date {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0)
  );
}

/**
 * 사용자의 현재 한도/사용량 정보를 가져온다.
 * admin은 DB 조회 없이 unlimited로 즉시 반환.
 */
export async function getQuota(user: User): Promise<QuotaInfo> {
  const resetAt = startOfNextMonthUTC().toISOString();

  if (user.role === "admin") {
    return {
      usage: 0,
      limit: user.monthlyLimit, // 참고용. unlimited=true라 실제 체크엔 안 쓰임
      unlimited: true,
      resetAt,
    };
  }

  const monthStart = startOfThisMonthUTC();
  const [row] = await db
    .select({ cnt: sql<number>`COUNT(*)::int` })
    .from(searchLogs)
    .where(
      and(
        eq(searchLogs.clerkId, user.clerkId),
        gte(searchLogs.createdAt, monthStart)
      )
    );

  return {
    usage: row?.cnt ?? 0,
    limit: user.monthlyLimit,
    unlimited: false,
    resetAt,
  };
}

/**
 * 검색 허용 여부 + 현재 한도 정보.
 * 호출자가 allowed=false면 429로 응답하고 quota를 함께 보내 사용자에게 안내.
 */
export async function checkQuota(
  user: User
): Promise<{ allowed: boolean; quota: QuotaInfo }> {
  const quota = await getQuota(user);
  const allowed = quota.unlimited || quota.usage < quota.limit;
  return { allowed, quota };
}
