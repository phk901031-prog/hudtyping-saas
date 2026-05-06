// src/app/api/admin/users/[id]/route.ts
// PATCH /api/admin/users/:clerkId
// body: { status?: UserStatus, role?: UserRole }
//
// admin만 호출 가능. 본인 자신 admin 해제는 차단(lock-out 방지).

import { getOrCreateCurrentUser } from "@/features/users/service";
import {
  AdminPermissionError,
  assertAdmin,
  updateUserRole,
  updateUserStatus,
} from "@/features/admin/service";
import type { UserRole, UserStatus } from "@/infrastructure/db/schema";

const VALID_STATUSES: UserStatus[] = ["pending", "approved", "rejected"];
const VALID_ROLES: UserRole[] = ["user", "admin"];

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

  const { id: targetClerkId } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    status?: string;
    role?: string;
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
  } else {
    return Response.json(
      { error: "status 또는 role 중 하나는 필요해요." },
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
