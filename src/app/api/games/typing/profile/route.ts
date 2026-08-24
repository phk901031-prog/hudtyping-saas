import { getOrCreateCurrentUser } from "@/features/users/service";
import { checkRateLimit } from "@/features/security/rate-limit";
import { createOrGetGameProfile } from "@/features/typing-game/profile";
import { isTypingBorderStyle, isTypingNameColor } from "@/features/typing-game/types";
import { PLAY_STENO_MAINTENANCE } from "@/config/maintenance";

export async function POST(req: Request) {
  if (PLAY_STENO_MAINTENANCE) {
    return Response.json({ error: "점검 중입니다.", code: "MAINTENANCE" }, { status: 503 });
  }

  const user = await getOrCreateCurrentUser();
  if (!user) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  const rateLimit = await checkRateLimit({
    scope: "game-profile-write",
    subject: user.clerkId,
    limit: 10,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => null)) as {
    nickname?: unknown;
    nameColor?: unknown;
    borderStyle?: unknown;
  } | null;

  if (
    !body ||
    typeof body.nickname !== "string" ||
    !isTypingNameColor(body.nameColor) ||
    !isTypingBorderStyle(body.borderStyle)
  ) {
    return Response.json({ error: "입력값이 올바르지 않습니다." }, { status: 400 });
  }

  try {
    const profile = await createOrGetGameProfile({
      clerkId: user.clerkId,
      nickname: body.nickname,
      nameColor: body.nameColor,
      borderStyle: body.borderStyle,
    });
    return Response.json({ profile }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "저장하지 못했습니다.";
    return Response.json(
      { error: message },
      { status: message.includes("사용 중") ? 409 : 400 }
    );
  }
}
