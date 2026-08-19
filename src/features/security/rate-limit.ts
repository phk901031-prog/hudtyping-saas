import { redis } from "@/infrastructure/redis";

export interface RateLimitDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * 사용자 단위 fixed-window 제한. 월간 quota와 별개로 순간적인 API 남용을 막는다.
 * Redis 장애 시에는 기존 사용자를 막지 않도록 fail-open하고 오류를 기록한다.
 */
export async function checkRateLimit(input: {
  scope:
    | "search"
    | "word-detail"
    | "log"
    | "connection-create"
    | "connection-activate"
    | "binary-verify"
    | "api-key-read"
    | "api-key-write"
    | "admin-write"
    | "license-activate"
    | "license-checkin"
    | "license-deactivate"
    | "game-session-create"
    | "game-result-submit"
    | "game-leaderboard-read"
    | "game-profile-write";
  subject: string;
  limit: number;
  windowSeconds?: number;
}): Promise<RateLimitDecision> {
  const windowSeconds = input.windowSeconds ?? 60;
  const window = Math.floor(Date.now() / (windowSeconds * 1000));
  const key = `rate-limit:${input.scope}:${input.subject}:${window}`;

  try {
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, windowSeconds + 1);

    return {
      allowed: count <= input.limit,
      limit: input.limit,
      remaining: Math.max(0, input.limit - count),
      retryAfterSeconds: windowSeconds - (Math.floor(Date.now() / 1000) % windowSeconds),
    };
  } catch (error) {
    console.error("[rate-limit] Redis check failed; allowing request:", error);
    return {
      allowed: true,
      limit: input.limit,
      remaining: input.limit,
      retryAfterSeconds: 0,
    };
  }
}

/** 프록시가 전달한 주소를 abuse-control 식별자로만 사용한다. 인증 판단에는 사용하지 않는다. */
export function getRequestSubject(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
  return address.replace(/[^a-fA-F0-9.:_-]/g, "").slice(0, 64) || "unknown";
}
