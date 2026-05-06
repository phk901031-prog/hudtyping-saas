// src/app/api/keys/[id]/route.ts
// DELETE /api/keys/:id  → 본인 키 삭제 (revoke)

import { auth } from "@/infrastructure/clerk";
import { revokeApiKey } from "@/features/auth/api-keys/service";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: idStr } = await params;
  const id = parseInt(idStr, 10);
  if (isNaN(id)) {
    return Response.json({ error: "Invalid key id" }, { status: 400 });
  }

  const ok = await revokeApiKey(userId, id);
  if (!ok) {
    return Response.json(
      { error: "키를 찾을 수 없거나 권한이 없어요." },
      { status: 404 }
    );
  }

  return new Response(null, { status: 204 });
}
