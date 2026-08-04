// DELETE /api/admin/licenses/activations/:id
// admin이 특정 활성화 슬롯을 강제로 해제 (다른 PC에서 다시 활성화할 수 있게 풀어줌).

import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import { forceDeactivateSlot } from "@/features/licenses/service";
import { checkRateLimit } from "@/features/security/rate-limit";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getOrCreateCurrentUser();
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAdmin(me);
  } catch (err) {
    if (err instanceof AdminPermissionError) {
      return Response.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const rateLimit = await checkRateLimit({ scope: "admin-write", subject: me.clerkId, limit: 60 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const { id } = await params;
  const activationId = parseInt(id, 10);
  if (!Number.isInteger(activationId)) {
    return Response.json({ error: "잘못된 id예요." }, { status: 400 });
  }

  const updated = await forceDeactivateSlot(activationId);
  if (!updated) {
    return Response.json({ error: "활성화 정보를 찾을 수 없어요." }, { status: 404 });
  }

  return Response.json(updated);
}
