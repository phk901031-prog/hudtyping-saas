import type { NextRequest } from "next/server";
import { after } from "next/server";
import { checkAppVersion, getClientVersionMeta } from "@/features/app-version/policy";
import { authenticate } from "@/features/auth/service";
import { checkQuota, incrementQuotaUsage } from "@/features/quota/service";
import { logSearchAttempt } from "@/features/search/logger";
import { searchWord } from "@/features/search/service";
import { UrimalsaemUnavailableError } from "@/infrastructure/urimalsaem";
import { checkRateLimit } from "@/features/security/rate-limit";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const { appVersion, clientType } = getClientVersionMeta(req.headers);

  const user = await authenticate(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return Response.json({ error: "검색어가 비어 있습니다." }, { status: 400 });
  }
  if (q.length > 100) {
    return Response.json({ error: "검색어는 100자 이하로 입력해주세요." }, { status: 400 });
  }

  const versionDecision = checkAppVersion(appVersion, clientType);
  if (!versionDecision.allowed) {
    after(() =>
      logSearchAttempt({
        clerkId: user.clerkId,
        query: q,
        status: "failed",
        errorCode: "VERSION_UNSUPPORTED",
        responseMs: Date.now() - startedAt,
        appVersion,
      })
    );

    return Response.json(
      {
        error: `새 버전 설치가 필요합니다. 홈페이지에서 최신 버전을 다운로드해주세요. (최소 v${versionDecision.minVersion})`,
        code: "VERSION_UNSUPPORTED",
        minVersion: versionDecision.minVersion,
      },
      { status: 426 }
    );
  }

  const rateLimit = await checkRateLimit({
    scope: "search",
    subject: user.clerkId,
    limit: 120,
  });
  if (!rateLimit.allowed) {
    after(() =>
      logSearchAttempt({
        clerkId: user.clerkId,
        query: q,
        status: "failed",
        errorCode: "RATE_LIMITED",
        responseMs: Date.now() - startedAt,
        appVersion,
      })
    );
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const { allowed, quota } = await checkQuota(user);
  if (!allowed) {
    after(() =>
      logSearchAttempt({
        clerkId: user.clerkId,
        query: q,
        status: "failed",
        errorCode: "QUOTA_EXCEEDED",
        responseMs: Date.now() - startedAt,
        appVersion,
      })
    );

    return Response.json(
      {
        error: `이번 달 검색 한도(${quota.limit}회)를 모두 사용했어요. ${quota.resetAt.slice(0, 10)}에 리셋됩니다.`,
        code: "QUOTA_EXCEEDED",
        quota,
      },
      { status: 429 }
    );
  }

  try {
    const result = await searchWord(q);
    const responseMs = Date.now() - startedAt;

    after(async () => {
      await Promise.all([
        logSearchAttempt({
          clerkId: user.clerkId,
          query: q,
          cacheHit: result.cache === "hit",
          status: "success",
          responseMs,
          appVersion,
        }),
        incrementQuotaUsage(user.clerkId),
      ]);
    });

    return Response.json({
      ...result,
      quota: { ...quota, usage: quota.usage + 1 },
      meta: {
        appVersion,
        responseMs,
      },
    });
  } catch (err) {
    console.error("[/api/search] search failed:", err);
    const responseMs = Date.now() - startedAt;
    const isUrimalsaemUnavailable = err instanceof UrimalsaemUnavailableError;

    after(() =>
      logSearchAttempt({
        clerkId: user.clerkId,
        query: q,
        status: "failed",
        errorCode: isUrimalsaemUnavailable
          ? "URIMALSAEM_UNAVAILABLE"
          : "SEARCH_FAILED",
        responseMs,
        appVersion,
      })
    );

    if (isUrimalsaemUnavailable) {
      return Response.json(
        {
          error: "우리말샘 응답 지연 중",
          code: "URIMALSAEM_UNAVAILABLE",
          meta: { appVersion, responseMs },
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        error: "검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        code: "SEARCH_FAILED",
        meta: { appVersion, responseMs },
      },
      { status: 502 }
    );
  }
}
