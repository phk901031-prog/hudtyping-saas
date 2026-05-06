// src/app/api/search/route.ts
// GET /api/search?q=단어
//
// 라우트는 얇게:
//   1) 인증 (features/auth/service의 authenticate)
//   2) 입력 파싱
//   3) searchService 호출
//   4) HTTP 응답 매핑 + 백그라운드 로깅 (after)

import type { NextRequest } from "next/server";
import { after } from "next/server";
import { searchWord, logSearch } from "@/features/search/service";
import { authenticate } from "@/features/auth/service";

export async function GET(req: NextRequest) {
  const user = await authenticate(req);
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
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

  after(() => logSearch(user.clerkId, q, result.cache === "hit"));
  return Response.json(result);
}
