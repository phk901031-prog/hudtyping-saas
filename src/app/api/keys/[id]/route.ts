// src/app/api/keys/[id]/route.ts
// DELETE /api/keys/:id  revoke current user's API key

import { auth } from "@/infrastructure/clerk";
import { revokeApiKey } from "@/features/auth/api-keys/service";
import { checkRateLimit } from "@/features/security/rate-limit";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    scope: "api-key-write",
    subject: userId,
    limit: 20,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { id: idStr } = await params;
  if (!/^\d{1,10}$/.test(idStr)) {
    return Response.json({ error: "Invalid key id" }, { status: 400 });
  }
  const id = Number(idStr);

  const ok = await revokeApiKey(userId, id);
  if (!ok) {
    return Response.json(
      { error: "키를 찾을 수 없거나 삭제 권한이 없어요." },
      { status: 404 }
    );
  }

  return new Response(null, { status: 204 });
}
