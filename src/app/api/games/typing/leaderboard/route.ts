import { fetchTypingLeaderboard } from "@/features/typing-game/service";
import {
  checkRateLimit,
  getRequestSubject,
} from "@/features/security/rate-limit";

export async function GET(request: Request) {
  const rateLimit = await checkRateLimit({
    scope: "typing-ranking",
    subject: getRequestSubject(request),
    limit: 60,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "순위표를 너무 자주 조회했습니다. 잠시 후 다시 시도해주세요." },
      {
        status: 429,
        headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
      }
    );
  }

  const url = new URL(request.url);
  const period = url.searchParams.get("period") === "monthly" ? "monthly" : "weekly";
  const leaderboard = await fetchTypingLeaderboard(period);

  return Response.json(leaderboard, {
    headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=60" },
  });
}
