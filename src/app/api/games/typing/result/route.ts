import { getOrCreateCurrentUser } from "@/features/users/service";
import {
  finishTypingSession,
  TypingGameError,
  type TypingGameEntryInput,
} from "@/features/typing-game/service";
import {
  checkRateLimit,
  getRequestSubject,
} from "@/features/security/rate-limit";

interface ResultBody {
  sessionId?: unknown;
  entries?: unknown;
}

export async function POST(request: Request) {
  const user = await getOrCreateCurrentUser();
  const subject = user?.clerkId ?? getRequestSubject(request);
  const rateLimit = await checkRateLimit({
    scope: "typing-submit",
    subject,
    limit: 15,
  });

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "결과를 너무 자주 제출했습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const body = (await request.json().catch(() => null)) as ResultBody | null;
  if (!body || !isSessionId(body.sessionId) || !isEntries(body.entries)) {
    return Response.json({ error: "결과 형식이 올바르지 않습니다." }, { status: 400 });
  }
  try {
    const result = await finishTypingSession({
      sessionId: body.sessionId,
      entries: body.entries,
      currentUser: user,
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof TypingGameError) {
      return Response.json(
        { error: error.message, code: error.code },
        { status: error.code === "SESSION_NOT_FOUND" ? 404 : 400 }
      );
    }
    console.error("[typing-game/result] 결과 저장 실패:", error);
    return Response.json(
      { error: "결과를 저장하지 못했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }
}

function isSessionId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  );
}

function isEntries(value: unknown): value is TypingGameEntryInput[] {
  return (
    Array.isArray(value) &&
    value.length <= 28 &&
    value.every(
      (entry) =>
        typeof entry === "object" &&
        entry !== null &&
        typeof (entry as { promptId?: unknown }).promptId === "string" &&
        typeof (entry as { typed?: unknown }).typed === "string"
    )
  );
}
