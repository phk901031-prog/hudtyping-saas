import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";
import { fetchLeaderboard, type LeaderboardPeriod } from "@/features/typing-game/leaderboard";
import { isTypingMode } from "@/features/typing-game/content";
import { PLAY_STENO_MAINTENANCE } from "@/config/maintenance";

const PERIODS: LeaderboardPeriod[] = ["daily", "weekly", "monthly", "all"];

export async function GET(req: Request) {
  if (PLAY_STENO_MAINTENANCE) {
    return Response.json({ error: "점검 중입니다.", code: "MAINTENANCE", rows: [] }, { status: 503 });
  }

  const rateLimit = await checkRateLimit({
    scope: "game-leaderboard-read",
    subject: getRequestSubject(req),
    limit: 60,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const url = new URL(req.url);
  const modeParam = url.searchParams.get("mode");
  const periodParam = url.searchParams.get("period") ?? "daily";

  if (!isTypingMode(modeParam)) {
    return Response.json({ error: "모드가 올바르지 않습니다." }, { status: 400 });
  }
  if (!PERIODS.includes(periodParam as LeaderboardPeriod)) {
    return Response.json({ error: "기간이 올바르지 않습니다." }, { status: 400 });
  }

  const rows = await fetchLeaderboard({
    mode: modeParam,
    period: periodParam as LeaderboardPeriod,
  });

  return Response.json(
    { rows },
    { headers: { "Cache-Control": "private, no-store, max-age=0" } }
  );
}
