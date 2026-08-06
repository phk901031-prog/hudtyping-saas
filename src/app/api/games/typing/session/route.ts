import { getOrCreateCurrentUser } from "@/features/users/service";
import { createTypingSession, TypingGameError } from "@/features/typing-game/service";
import {
  checkRateLimit,
  getRequestSubject,
} from "@/features/security/rate-limit";

export async function POST(request: Request) {
  const user = await getOrCreateCurrentUser();
  const subject = user?.clerkId ?? getRequestSubject(request);
  const rateLimit = await checkRateLimit({
    scope: "typing-session",
    subject,
    limit: 12,
  });

  if (!rateLimit.allowed) {
    return Response.json(
      { error: "게임을 너무 자주 시작했습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  try {
    const session = await createTypingSession(user);
    return Response.json(session, {
      status: 201,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    if (error instanceof TypingGameError && error.code === "PROFILE_REQUIRED") {
      return Response.json({ error: error.message, code: error.code }, { status: 403 });
    }
    throw error;
  }
}
