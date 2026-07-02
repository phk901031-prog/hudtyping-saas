// src/app/api/search/route.ts
// GET /api/search?q=word

import type { NextRequest } from "next/server";
import { after } from "next/server";
import { searchWord } from "@/features/search/service";
import { logSearch } from "@/features/search/logger";
import { authenticate } from "@/features/auth/service";
import { checkQuota, incrementQuotaUsage } from "@/features/quota/service";
import { UrimalsaemUnavailableError } from "@/infrastructure/urimalsaem";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    return Response.json({ error: "검색어가 비어 있습니다." }, { status: 400 });
  }

  let result;
  try {
    result = await searchWord(q);
  } catch (err) {
    console.error("[/api/search] search failed:", err);

    if (err instanceof UrimalsaemUnavailableError) {
      return Response.json(
        {
          error:
            "우리말샘 응답이 지연되고 있어요. 잠시 후 다시 검색해주세요.",
          code: "URIMALSAEM_UNAVAILABLE",
        },
        { status: 503 }
      );
    }

    return Response.json(
      {
        error: "검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.",
        code: "SEARCH_FAILED",
      },
      { status: 502 }
    );
  }

  after(async () => {
    await Promise.all([
      logSearch(user.clerkId, q, result.cache === "hit"),
      incrementQuotaUsage(user.clerkId),
    ]);
  });

  return Response.json({
    ...result,
    quota: { ...quota, usage: quota.usage + 1 },
  });
}
