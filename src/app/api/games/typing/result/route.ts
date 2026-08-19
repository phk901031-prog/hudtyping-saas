import { getOrCreateCurrentUser } from "@/features/users/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";
import { submitTypingResult, type SubmitOutcome } from "@/features/typing-game/result";

const SESSION_ID_PATTERN = /^[0-9a-f-]{36}$/i;

const ERROR_MESSAGES: Record<Extract<SubmitOutcome, { ok: false }>["code"], string> = {
  SESSION_EXPIRED: "게임 세션이 만료됐거나 이미 제출되었습니다.",
  INVALID_SUBMISSION: "지문을 끝까지 입력한 뒤 제출해주세요.",
  INVALID_SPEED: "결과 값이 올바르지 않습니다.",
  TOO_FAST: "입력 속도가 비정상적으로 빠릅니다.",
};

export async function POST(req: Request) {
  const user = await getOrCreateCurrentUser();

  const rateLimit = await checkRateLimit({
    scope: "game-result-submit",
    subject: user?.clerkId ?? getRequestSubject(req),
    limit: 20,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    sessionId?: unknown;
    typedText?: unknown;
  };

  if (
    typeof body.sessionId !== "string" ||
    !SESSION_ID_PATTERN.test(body.sessionId) ||
    typeof body.typedText !== "string" ||
    body.typedText.length > 1000
  ) {
    return Response.json({ error: "제출 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const outcome = await submitTypingResult({
    sessionId: body.sessionId,
    typedText: body.typedText,
    clerkId: user?.clerkId ?? null,
  });

  if (!outcome.ok) {
    return Response.json(
      { error: ERROR_MESSAGES[outcome.code], code: outcome.code },
      { status: outcome.code === "SESSION_EXPIRED" ? 404 : 400 }
    );
  }

  return Response.json(outcome, { headers: { "Cache-Control": "no-store" } });
}
