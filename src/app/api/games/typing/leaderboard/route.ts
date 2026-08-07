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
    // 게임 종료 직후 새 최고 기록이 바로 보여야 하므로 CDN/브라우저에
    // 순위 응답을 보관하지 않는다.
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}
