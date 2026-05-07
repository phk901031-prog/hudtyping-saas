// src/app/api/verify-client/route.ts
// POST /api/verify-client
// body: { sha256: string, version?: string }
//
// 클라이언트(.exe) 시작 시 자기 자신 hash를 보내 등록 여부 확인.
// 검증 실패 → 사용자에게 "공식 .exe가 아닙니다" 안내 + 검색 불가.
//
// 보안 노트:
//   - 이 엔드포인트는 인증 없이 호출 가능 (가입 전 사용자도 .exe 다운받자마자 검증할 수 있게)
//   - hash 자체는 비밀이 아니라 무결성 증명용
//   - 공격자가 SaaS API에 무차별 hash 보내며 brute force 시도해도 의미 없음 (2^256 공간)

import { isOfficialBinary } from "@/features/security/binary-verification";

export const runtime = "edge";

export async function POST(req: Request) {
  let body: { sha256?: unknown; version?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const sha256 = typeof body.sha256 === "string" ? body.sha256 : null;
  if (!sha256) {
    return Response.json({ error: "sha256 required" }, { status: 400 });
  }

  const verified = await isOfficialBinary(sha256);

  return Response.json({
    verified,
    message: verified
      ? "공식 빌드 확인됨"
      : "공식 빌드가 아닙니다. SaaS에서 새 .exe를 다운받아 주세요.",
  });
}
