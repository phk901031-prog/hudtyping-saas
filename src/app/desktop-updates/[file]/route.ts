// src/app/desktop-updates/[file]/route.ts
// GET /desktop-updates/:file — 데스크톱 앱 자동 업데이트(electron-updater generic provider) 창구.
//
// 앱은 https://playsteno.com/desktop-updates/ 만 알고 있다 (GitHub 계정명 노출 없음).
// - latest.yml           : 최신 릴리스의 메타파일을 서버가 읽어 그대로 내려준다
// - hudtyping-Setup-X.Y.Z.exe(.blockmap) : 해당 버전 릴리스 첨부파일의 서명 URL 로 302
// 저장소를 private 으로 돌려도 서버의 GITHUB_TOKEN 으로 계속 동작한다.

import { NextResponse } from "next/server";
import {
  readAssetText,
  resolveAssetDownloadUrl,
} from "@/infrastructure/release-assets";

export const dynamic = "force-dynamic";

// 허용하는 파일명만 처리 (임의 첨부파일 조회 차단)
const INSTALLER_RE = /^hudtyping-Setup-(\d+\.\d+\.\d+)\.exe(\.blockmap)?$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params;

  if (file === "latest.yml") {
    const yml = await readAssetText("latest", "latest.yml");
    if (!yml) return new NextResponse("unavailable", { status: 503 });
    return new NextResponse(yml, {
      headers: {
        "Content-Type": "text/yaml; charset=utf-8",
        // 업데이트 확인이 몰려도 GitHub 호출은 5분에 1번 수준
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  }

  const match = INSTALLER_RE.exec(file);
  if (!match) return new NextResponse("not found", { status: 404 });

  const fileUrl = await resolveAssetDownloadUrl(`v${match[1]}`, file);
  if (!fileUrl) return new NextResponse("not found", { status: 404 });

  const res = NextResponse.redirect(fileUrl, 302);
  res.headers.set("Cache-Control", "no-store");
  return res;
}
