// src/app/(marketing)/download/windows/installer/route.ts
// GET /download/windows/installer — Windows 설치 파일 다운로드 진입점.
//
// 홈페이지에는 이 playsteno.com 주소만 노출하고, 서버가 원본 저장소의
// 서명된 임시 파일 주소로 302 리다이렉트한다. 파일 자체는 Vercel 을 거치지 않아
// 대역폭 비용이 들지 않는다.

import { NextResponse } from "next/server";
import { WINDOWS_RELEASE } from "@/config/release";
import { resolveAssetDownloadUrl } from "@/infrastructure/release-assets";

// 요청마다 새 서명 URL 을 받아야 하므로 정적 캐시 금지
export const dynamic = "force-dynamic";

export async function GET() {
  const { version } = WINDOWS_RELEASE;
  const fileUrl = await resolveAssetDownloadUrl(
    `v${version}`,
    `hudtyping-Setup-${version}.exe`
  );

  // 원본 확인 실패 시 원본 주소로 보내지 않고(계정명 노출) 잠시 후 재시도 안내
  if (!fileUrl) {
    return new NextResponse(
      "설치 파일을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8", "Retry-After": "60" } }
    );
  }

  const res = NextResponse.redirect(fileUrl, 302);
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer");
  return res;
}
