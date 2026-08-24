import { getOrCreateCurrentUser } from "@/features/users/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";
import { createTypingSession } from "@/features/typing-game/session";
import { isTypingMode } from "@/features/typing-game/content";
import { PLAY_STENO_MAINTENANCE } from "@/config/maintenance";

export async function POST(req: Request) {
  if (PLAY_STENO_MAINTENANCE) {
    return Response.json({ error: "점검 중입니다.", code: "MAINTENANCE" }, { status: 503 });
  }

  // 게스트도 플레이 가능 — 낱말지기 승인 여부와 무관 (§4.9).
  const user = await getOrCreateCurrentUser();

  const rateLimit = await checkRateLimit({
    scope: "game-session-create",
    subject: user?.clerkId ?? getRequestSubject(req),
    limit: 30,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { mode?: unknown };
  if (!isTypingMode(body.mode)) {
    return Response.json({ error: "모드가 올바르지 않습니다." }, { status: 400 });
  }

  const session = await createTypingSession(body.mode);
  if (!session) {
    return Response.json({ error: "지문을 불러오지 못했습니다." }, { status: 500 });
  }

  return Response.json(
    {
      sessionId: session.sessionId,
      contentId: session.content.id,
      body: session.content.body,
      mode: body.mode,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
