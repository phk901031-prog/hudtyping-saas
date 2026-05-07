// src/app/api/keys/route.ts
// GET  /api/keys  → 내 키 목록
// POST /api/keys  → 새 키 발급 (응답에 평문 1회 포함)

import { auth } from "@/infrastructure/clerk";
import { getOrCreateCurrentUser } from "@/features/users/service";
import {
  ApiKeyAlreadyExistsError,
  createApiKey,
  listApiKeys,
} from "@/features/auth/api-keys/service";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const keys = await listApiKeys(userId);
  return Response.json({ keys });
}

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.status !== "approved") {
    return Response.json(
      { error: "관리자 승인이 필요합니다." },
      { status: 403 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { name?: string };
  const name = body.name?.trim();
  if (!name) {
    return Response.json({ error: "키 이름이 필요해요." }, { status: 400 });
  }
  if (name.length > 50) {
    return Response.json(
      { error: "키 이름은 50자 이하로 입력해주세요." },
      { status: 400 }
    );
  }

  try {
    const created = await createApiKey(user.clerkId, name);
    return Response.json(
      {
        ...created,
        message: "키를 안전한 곳에 복사해주세요. 다시 보여드릴 수 없어요.",
      },
      { status: 201 }
    );
  } catch (err) {
    if (err instanceof ApiKeyAlreadyExistsError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }
}
