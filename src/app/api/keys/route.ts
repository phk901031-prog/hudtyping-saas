// src/app/api/keys/route.ts
// GET  /api/keys  list current user's API keys
// POST /api/keys  create a new API key

import { auth } from "@/infrastructure/clerk";
import { getOrCreateCurrentUser } from "@/features/users/service";
import {
  ApiKeyAlreadyExistsError,
  createApiKey,
  listApiKeys,
} from "@/features/auth/api-keys/service";
import { checkRateLimit } from "@/features/security/rate-limit";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    scope: "api-key-read",
    subject: userId,
    limit: 60,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const keys = await listApiKeys(userId);
  return Response.json({ keys });
}

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    scope: "api-key-write",
    subject: user.clerkId,
    limit: 10,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
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
        message:
          "새 API 키를 안전한 곳에 복사해주세요. 이 키는 다시 보여드릴 수 없어요.",
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
