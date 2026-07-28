// src/app/api/admin/users/[id]/route.ts
// PATCH /api/admin/users/:clerkId
// body: { status?: UserStatus, role?: UserRole }
//
// admin만 호출 가능. 본인 자신 admin 해제는 차단(lock-out 방지).

import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import {
  updateUserMonthlyLimit,
  updateUserRole,
  updateUserStatus,
  updateUserUnlimited,
} from "@/features/admin/users";
import type { UserRole, UserStatus } from "@/infrastructure/db/schema";
import { checkRateLimit } from "@/features/security/rate-limit";

const VALID_STATUSES: UserStatus[] = ["pending", "approved", "rejected"];
const VALID_ROLES: UserRole[] = ["user", "admin"];
const MAX_MONTHLY_LIMIT = 1_000_000; // 사실상 무제한 — 더 큰 수는 의미 없음

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id: targetClerkId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    status?: string;
    role?: string;
    monthlyLimit?: number;
    unlimited?:
      | { mode: "until"; until: string }
      | { mode: "permanent" }
      | { mode: "clear" };
  };

  // 자기 자신 admin 해제는 차단 (lock-out 방지)
  if (targetClerkId === me.clerkId && body.role === "user") {
    return Response.json(
      { error: "본인의 관리자 권한은 해제할 수 없어요." },
      { status: 400 }
    );
  }

  let updated;

  if (body.status !== undefined) {
    if (!VALID_STATUSES.includes(body.status as UserStatus)) {
      return Response.json(
        { error: `status는 ${VALID_STATUSES.join("/")} 중 하나여야 해요.` },
        { status: 400 }
      );
    }
    updated = await updateUserStatus(targetClerkId, body.status as UserStatus);
  } else if (body.role !== undefined) {
    if (!VALID_ROLES.includes(body.role as UserRole)) {
      return Response.json(
        { error: `role은 ${VALID_ROLES.join("/")} 중 하나여야 해요.` },
        { status: 400 }
      );
    }
    updated = await updateUserRole(targetClerkId, body.role as UserRole);
  } else if (body.monthlyLimit !== undefined) {
    if (
      typeof body.monthlyLimit !== "number" ||
      !Number.isInteger(body.monthlyLimit) ||
      body.monthlyLimit < 0 ||
      body.monthlyLimit > MAX_MONTHLY_LIMIT
    ) {
      return Response.json(
        { error: `monthlyLimit은 0~${MAX_MONTHLY_LIMIT.toLocaleString()} 사이의 정수여야 해요.` },
        { status: 400 }
      );
    }
    updated = await updateUserMonthlyLimit(targetClerkId, body.monthlyLimit);
  } else if (body.unlimited !== undefined) {
    const grant = body.unlimited;
    if (grant.mode === "until") {
      const parsed = new Date(grant.until);
      if (Number.isNaN(parsed.getTime())) {
        return Response.json(
          { error: "unlimited.until 이 유효한 날짜가 아니에요." },
          { status: 400 }
        );
      }
      if (parsed.getTime() <= Date.now()) {
        return Response.json(
          { error: "만료 시각은 현재보다 미래여야 해요." },
          { status: 400 }
        );
      }
      updated = await updateUserUnlimited(targetClerkId, { until: parsed });
    } else if (grant.mode === "permanent") {
      updated = await updateUserUnlimited(targetClerkId, { permanent: true });
    } else if (grant.mode === "clear") {
      updated = await updateUserUnlimited(targetClerkId, { clear: true });
    } else {
      return Response.json(
        { error: "unlimited.mode 는 until/permanent/clear 중 하나여야 해요." },
        { status: 400 }
      );
    }
  } else {
    return Response.json(
      { error: "status, role, monthlyLimit, unlimited 중 하나는 필요해요." },
      { status: 400 }
    );
  }

  if (!updated) {
    return Response.json(
      { error: "사용자를 찾을 수 없어요." },
      { status: 404 }
    );
  }

  return Response.json(updated);
}
