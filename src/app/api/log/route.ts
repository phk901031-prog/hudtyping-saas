// POST /api/log
//
// HUD 로컬 disk 캐시가 응답을 즉시 냈지만 서버가 검색 통계·quota 카운트는 유지해야
// 하는 상황에서 호출된다. 결과는 필요 없음 — 카운트와 로그만.
//
// 정책:
//   - 인증: search 와 동일 (Bearer 또는 Clerk 쿠키)
//   - 앱 버전 정책: search 와 동일 (426 Upgrade Required)
//   - 월 검색 한도: 카운트한다 (캐시 hit도 사용자 활동임)
//   - 우리말샘 API 는 호출하지 않음 → 부담 0
//
// body: { query: string, cacheHit?: boolean, responseMs?: number }

import type { NextRequest } from "next/server";
import { after } from "next/server";
import { checkAppVersion, getClientVersionMeta } from "@/features/app-version/policy";
import { authenticate } from "@/features/auth/service";
import { checkQuota, incrementQuotaUsage } from "@/features/quota/service";
import { logSearchAttempt } from "@/features/search/logger";
import { checkRateLimit } from "@/features/security/rate-limit";

export const runtime = "edge";

const MAX_QUERY_LEN = 200;
const LOG_RATE_LIMIT_PER_MINUTE = 300;

export async function POST(req: NextRequest) {
  const startedAt = Date.now();
  const { appVersion, clientType } = getClientVersionMeta(req.headers);

  const user = await authenticate(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const versionDecision = checkAppVersion(appVersion, clientType);
  if (!versionDecision.allowed) {
    return Response.json(
      {
        error: `새 버전 설치가 필요합니다. 홈페이지에서 최신 버전을 다운로드해주세요. (최소 v${versionDecision.minVersion})`,
        code: "VERSION_UNSUPPORTED",
        minVersion: versionDecision.minVersion,
      },
      { status: 426 }
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { query?: string; cacheHit?: boolean; responseMs?: number }
    | null;

  const query = typeof body?.query === "string" ? body.query.trim() : "";
  if (!query || query.length > MAX_QUERY_LEN) {
    return Response.json(
      { error: "검색어가 비어 있거나 너무 깁니다." },
      { status: 400 }
    );
  }

  const rateLimit = await checkRateLimit({
    scope: "log",
    subject: user.clerkId,
    limit: LOG_RATE_LIMIT_PER_MINUTE,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
        code: "RATE_LIMITED",
      },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const { allowed, quota } = await checkQuota(user);
  if (!allowed) {
    return Response.json(
      {
        error: `이번 달 검색 한도(${quota.limit}회)를 모두 사용했어요. ${quota.resetAt.slice(0, 10)}에 리셋됩니다.`,
        code: "QUOTA_EXCEEDED",
        quota,
      },
      { status: 429 }
    );
  }

  const responseMs = Date.now() - startedAt;

  after(async () => {
    await Promise.all([
      logSearchAttempt({
        clerkId: user.clerkId,
        query,
        cacheHit: body?.cacheHit ?? true,
        status: "success",
        responseMs: body?.responseMs ?? 0,
        appVersion,
      }),
      incrementQuotaUsage(user.clerkId),
    ]);
  });

  return Response.json({
    ok: true,
    quota: { ...quota, usage: quota.usage + 1 },
    meta: { appVersion, responseMs },
  });
}
