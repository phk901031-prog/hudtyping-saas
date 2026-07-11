// GET /api/word/[targetCode]
// 우리말샘 view API 프록시 — 특정 target_code의 상세(예문 포함) 조회.
//
// 정책:
//   - 인증: Bearer 헤더 or Clerk 세션 (search와 동일)
//   - 앱 버전 정책: search와 동일 (426 Upgrade Required)
//   - 월 검색 한도: 카운트하지 않음 (이미 검색한 단어의 상세 조회는 서비스 성격)

import type { NextRequest } from "next/server";
import { checkAppVersion, getClientVersionMeta } from "@/features/app-version/policy";
import { authenticate } from "@/features/auth/service";
import { getWordDetail } from "@/features/word-detail/service";
import { UrimalsaemUnavailableError } from "@/infrastructure/urimalsaem";
import { checkRateLimit } from "@/features/security/rate-limit";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ targetCode: string }> }
) {
  const startedAt = Date.now();
  const { targetCode: rawTargetCode } = await ctx.params;
  const targetCode = rawTargetCode?.trim() ?? "";

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

  if (!/^\d{1,20}$/.test(targetCode)) {
    return Response.json(
      { error: "target_code 형식이 잘못됐습니다.", code: "INVALID_TARGET_CODE" },
      { status: 400 }
    );
  }

  const rateLimit = await checkRateLimit({
    scope: "word-detail",
    subject: user.clerkId,
    limit: 120,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const result = await getWordDetail(targetCode);
    const responseMs = Date.now() - startedAt;

    if (!result.found) {
      return Response.json(
        {
          error: "해당 뜻풀이의 상세 정보를 찾지 못했습니다.",
          code: "WORD_DETAIL_NOT_FOUND",
          meta: { appVersion, responseMs },
        },
        { status: 404 }
      );
    }

    return Response.json({
      ...result,
      meta: { appVersion, responseMs },
    });
  } catch (err) {
    console.error("[/api/word] failed:", err);
    const responseMs = Date.now() - startedAt;
    const isUnavailable = err instanceof UrimalsaemUnavailableError;

    if (isUnavailable) {
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
        error: "예문 조회 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        code: "WORD_DETAIL_FAILED",
        meta: { appVersion, responseMs },
      },
      { status: 502 }
    );
  }
}
