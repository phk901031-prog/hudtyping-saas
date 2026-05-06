// src/features/webhooks/clerk-handler.ts
// Clerk webhook 이벤트 핸들러 (② Application).
//
// route.ts는 verifyWebhook으로 서명 검증만 하고 이 함수에 위임.
// 활성화 조건: Phase 7 배포 후 Clerk 대시보드에 webhook URL 등록 + CLERK_WEBHOOK_SIGNING_SECRET 설정.

import { eq } from "drizzle-orm";
import type { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/infrastructure/db";
import { users } from "@/infrastructure/db/schema";

/**
 * Clerk webhook 이벤트를 처리한다.
 * - user.created: DB에 row 생성 (JIT가 이미 만들었으면 onConflictDoNothing)
 * - user.deleted: DB에서 row 삭제 (cascade로 search_logs/api_keys도 함께 정리)
 * - 기타 이벤트는 무시
 */
export async function handleClerkWebhook(event: WebhookEvent): Promise<void> {
  switch (event.type) {
    case "user.created": {
      const u = event.data;
      const email = u.email_addresses[0]?.email_address;
      if (!email) {
        console.warn(`[clerk-webhook] user.created with no email: ${u.id}`);
        return;
      }
      await db
        .insert(users)
        .values({ clerkId: u.id, email })
        .onConflictDoNothing();
      console.log(`[clerk-webhook] user.created: ${u.id} (${email})`);
      break;
    }

    case "user.deleted": {
      const u = event.data;
      if (u.id) {
        await db.delete(users).where(eq(users.clerkId, u.id));
        console.log(`[clerk-webhook] user.deleted: ${u.id}`);
      }
      break;
    }

    default:
      // user.updated 등 — 현재는 처리할 일 없음
      break;
  }
}
