import { getOrCreateCurrentUser } from "@/features/users/service";
import { checkRateLimit } from "@/features/security/rate-limit";
import {
  isTypingBorderStyle,
  isTypingNameColor,
  isValidTypingNickname,
} from "@/features/typing-game/customization";
import { updateTypingProfile } from "@/features/typing-game/service";

interface ProfileBody {
  nickname?: unknown;
  nameColor?: unknown;
  borderStyle?: unknown;
}

export async function PATCH(request: Request) {
  const user = await getOrCreateCurrentUser();
  if (!user) return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const rateLimit = await checkRateLimit({
    scope: "typing-profile",
    subject: user.clerkId,
    limit: 8,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "꾸미기 설정을 너무 자주 변경했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await request.json().catch(() => null)) as ProfileBody | null;
  if (
    !body ||
    typeof body.nickname !== "string" ||
    !isValidTypingNickname(body.nickname) ||
    !isTypingNameColor(body.nameColor) ||
    !isTypingBorderStyle(body.borderStyle)
  ) {
    return Response.json(
      { error: "닉네임 또는 꾸미기 설정이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  try {
    const profile = await updateTypingProfile({
      user,
      nickname: body.nickname,
      nameColor: body.nameColor,
      borderStyle: body.borderStyle,
    });
    return Response.json(profile, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "꾸미기 설정을 저장하지 못했습니다.";
    return Response.json({ error: message }, { status: message.includes("사용 중") ? 409 : 400 });
  }
}
