// POST /api/admin/settings
//
// 전역 설정 변경 — 지금은 월 검색 한도 기본값 하나뿐.
// /admin/stats 페이지의 일반 HTML form에서 호출(프리워밍 폼과 동일 패턴).
//
// body(form-urlencoded): { defaultMonthlyLimit: string }

import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import { setDefaultMonthlyLimit } from "@/features/quota/service";
import { checkRateLimit } from "@/features/security/rate-limit";

const MAX_MONTHLY_LIMIT = 1_000_000; // admin/users/[id] 라우트와 동일 상한

export async function POST(req: Request) {
  const me = await getOrCreateCurrentUser();
  if (!me) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    assertAdmin(me);
  } catch (err) {
    if (err instanceof AdminPermissionError) {
      return Response.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const rateLimit = await checkRateLimit({
    scope: "admin-write",
    subject: me.clerkId,
    limit: 60,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.", code: "RATE_LIMITED" },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const form = await req.formData().catch(() => null);
  const raw = form?.get("defaultMonthlyLimit")?.toString() ?? "";
  const value = Number.parseInt(raw, 10);

  if (!Number.isInteger(value) || value < 0 || value > MAX_MONTHLY_LIMIT) {
    return Response.json(
      { error: `0~${MAX_MONTHLY_LIMIT.toLocaleString()} 사이의 정수여야 해요.` },
      { status: 400 }
    );
  }

  await setDefaultMonthlyLimit(value);

  return Response.redirect(new URL(`/admin/stats?defaultLimitUpdated=${value}`, req.url));
}
