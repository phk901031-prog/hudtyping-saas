// src/app/api/admin/licenses/route.ts
// GET  /api/admin/licenses       — 목록
// POST /api/admin/licenses       — 신규 발급 { plan, durationDays?, issuedToEmail?, notes?, maxActivations? }
// admin만 호출 가능.

import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import { issueLicense, listLicenses } from "@/features/licenses/service";
import type { LicensePlan } from "@/infrastructure/db/schema";
import { checkRateLimit } from "@/features/security/rate-limit";

const VALID_PLANS: LicensePlan[] = ["lifetime", "annual", "trial"];

export async function GET() {
  const me = await getOrCreateCurrentUser();
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAdmin(me);
  } catch (err) {
    if (err instanceof AdminPermissionError) {
      return Response.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const list = await listLicenses();
  return Response.json({ licenses: list });
}

export async function POST(req: Request) {
  const me = await getOrCreateCurrentUser();
  if (!me) return Response.json({ error: "Unauthorized" }, { status: 401 });

  try {
    assertAdmin(me);
  } catch (err) {
    if (err instanceof AdminPermissionError) {
      return Response.json({ error: err.message }, { status: 403 });
    }
    throw err;
  }

  const rateLimit = await checkRateLimit({ scope: "admin-write", subject: me.clerkId, limit: 60 });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    plan?: string;
    durationDays?: number;
    issuedToEmail?: string;
    notes?: string;
    maxActivations?: number;
  };

  if (!body.plan || !VALID_PLANS.includes(body.plan as LicensePlan)) {
    return Response.json(
      { error: `plan은 ${VALID_PLANS.join("/")} 중 하나여야 해요.` },
      { status: 400 }
    );
  }
  if (body.plan !== "lifetime") {
    if (
      typeof body.durationDays !== "number" ||
      !Number.isInteger(body.durationDays) ||
      body.durationDays < 1 ||
      body.durationDays > 3650
    ) {
      return Response.json(
        { error: "annual/trial 플랜은 durationDays(1~3650)가 필요해요." },
        { status: 400 }
      );
    }
  }

  try {
    const license = await issueLicense({
      plan: body.plan as LicensePlan,
      durationDays: body.durationDays,
      issuedToEmail: body.issuedToEmail,
      notes: body.notes,
      maxActivations: body.maxActivations,
      createdBy: me.clerkId,
    });
    return Response.json(license, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "알 수 없는 오류";
    return Response.json({ error: message }, { status: 500 });
  }
}
