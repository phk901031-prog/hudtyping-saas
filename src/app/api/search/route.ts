// src/app/api/search/route.ts
// GET /api/search?q=단어
//
// 라우트 책임:
//   1) 인증 (Bearer 헤더 OR Clerk 쿠키)
//   2) 한도 체크 (admin은 스킵)
//   3) 입력 파싱
//   4) searchService 호출
//   5) HTTP 응답 매핑 + 백그라운드 로깅 (after)

import type { NextRequest } from "next/server";
import { after } from "next/server";
import { searchWord } from "@/features/search/service";
import { logSearch } from "@/features/search/logger";
import { authenticate } from "@/features/auth/service";
import { checkQuota, incrementQuotaUsage } from "@/features/quota/service";

// Edge Runtime — cold start 거의 0 + 사용자 가까운 PoP에서 실행 (latency 단축).
// 의존성: Drizzle + Neon HTTP + Upstash Redis + Clerk auth + Web Crypto (hashToken)
//   — 모두 edge 호환.
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 한도 체크 — admin은 quota.unlimited라 항상 통과
  const { allowed, quota } = await checkQuota(user);
  if (!allowed) {
    return Response.json(
      {
        error: `이번 달 검색 한도(${quota.limit}회)를 모두 사용했어요. ${quota.resetAt.slice(0, 10)}에 리셋돼요.`,
        quota,
      },
      { status: 429 }
    );
  }

  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return Response.json({ error: "검색어가 비었습니다." }, { status: 400 });
  }

  let result;
  try {
    result = await searchWord(q);
  } catch (err) {
    console.error("[/api/search] 검색 실패:", err);
    return Response.json(
      { error: "검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." },
      { status: 502 }
    );
  }

  // 백그라운드 작업: DB 로깅 + Redis quota 카운터 증가 (한도 캐시가 곧바로 반영되도록)
  after(async () => {
    await Promise.all([
      logSearch(user.clerkId, q, result.cache === "hit"),
      incrementQuotaUsage(user.clerkId),
    ]);
  });

  // 응답에 quota 정보 포함 — 클라이언트가 남은 횟수 표시 가능
  return Response.json({
    ...result,
    quota: { ...quota, usage: quota.usage + 1 }, // 방금 한 검색 반영
  });
}
