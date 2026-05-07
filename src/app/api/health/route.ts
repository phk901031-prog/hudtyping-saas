// src/app/api/health/route.ts
// GET /api/health — 외부 핑/모니터링용.
//
// 인증 불필요. 단순히 200 응답해서 Vercel 함수가 sleep 안 들어가게 유지.
// UptimeRobot 같은 모니터링 서비스가 5분마다 ping하면
// 우리 라우트들이 항상 warm 상태 → cold start 0.

export async function GET() {
  return Response.json(
    { ok: true, ts: Date.now() },
    {
      // 캐시 비활성화 — 매번 함수가 실제로 실행돼야 의미 있음
      headers: { "Cache-Control": "no-store" },
    }
  );
}
