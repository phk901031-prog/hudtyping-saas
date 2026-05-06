// src/app/api/webhooks/clerk/route.ts
// Clerk webhook 라우트 — 얇은 어댑터.
//
// 책임:
//   1) Svix 서명 검증 (verifyWebhook 헬퍼)
//   2) 검증 끝나면 features/webhooks의 handleClerkWebhook에 위임
//
// ⚠️ 활성화 조건:
//   - Clerk 대시보드에 이 라우트 URL 등록
//   - CLERK_WEBHOOK_SIGNING_SECRET 환경변수 설정
// 그전까지는 JIT provisioning(`features/users`)이 같은 역할.

import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { NextRequest } from "next/server";
import { handleClerkWebhook } from "@/features/webhooks/clerk-handler";

export async function POST(req: NextRequest) {
  let event;
  try {
    event = await verifyWebhook(req);
  } catch (err) {
    console.error("[clerk-webhook] 서명 검증 실패:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  await handleClerkWebhook(event);
  return new Response(null, { status: 204 });
}
