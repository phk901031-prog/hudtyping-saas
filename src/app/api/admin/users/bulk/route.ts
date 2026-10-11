// PATCH /api/admin/users/bulk
//
// /admin/users 체크박스로 고른 사용자 여러 명에게 월 한도를 한 번에 적용.
// admin만 호출 가능.
//
// body: { clerkIds: string[], monthlyLimit: number | null }
//   - monthlyLimit이 null이면 선택한 사용자들의 개별 override를 해제하고
//     전역 기본값(app_settings)을 따르게 한다.

import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import { bulkUpdateMonthlyLimit } from "@/features/admin/users";
import { checkRateLimit } from "@/features/security/rate-limit";

const MAX_MONTHLY_LIMIT = 1_000_000; // 다른 admin monthlyLimit 라우트와 동일 상한
const MAX_BULK_TARGETS = 500; // 사실상 전체 가입자보다 넉넉한 상한 — 실수로 거대 배열 보내는 것 방지

export async function PATCH(req: Request) {
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

  const body = (await req.json().catch(() => null)) as {
    clerkIds?: unknown;
    monthlyLimit?: number | null;
  } | null;

  const clerkIds = Array.isArray(body?.clerkIds)
    ? body.clerkIds.filter((id): id is string => typeof id === "string" && id.length > 0)
    : [];

  if (clerkIds.length === 0) {
    return Response.json({ error: "clerkIds가 비어 있어요." }, { status: 400 });
  }
  if (clerkIds.length > MAX_BULK_TARGETS) {
    return Response.json(
      { error: `한 번에 최대 ${MAX_BULK_TARGETS}명까지 적용할 수 있어요.` },
      { status: 400 }
    );
  }

  const monthlyLimit = body?.monthlyLimit ?? null;
  if (
    monthlyLimit !== null &&
    (typeof monthlyLimit !== "number" ||
      !Number.isInteger(monthlyLimit) ||
      monthlyLimit < 0 ||
      monthlyLimit > MAX_MONTHLY_LIMIT)
  ) {
    return Response.json(
      { error: `monthlyLimit은 0~${MAX_MONTHLY_LIMIT.toLocaleString()} 사이의 정수이거나 null(기본값 사용)이어야 해요.` },
      { status: 400 }
    );
  }

  const updatedCount = await bulkUpdateMonthlyLimit(clerkIds, monthlyLimit);

  return Response.json({ updated: updatedCount });
}
