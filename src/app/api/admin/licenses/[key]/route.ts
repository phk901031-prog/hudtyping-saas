// PATCH /api/admin/licenses/:key  body: { revoked: boolean }
// admin만 호출 가능. 회수/회수 해제.

import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import { revokeLicense, unrevokeLicense, getLicenseActivations } from "@/features/licenses/service";
import { checkRateLimit } from "@/features/security/rate-limit";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
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

  const { key } = await params;
  const body = (await req.json().catch(() => ({}))) as { revoked?: boolean };

  if (typeof body.revoked !== "boolean") {
    return Response.json({ error: "revoked(boolean)가 필요해요." }, { status: 400 });
  }

  const updated = body.revoked ? await revokeLicense(key) : await unrevokeLicense(key);
  if (!updated) {
    return Response.json({ error: "라이선스를 찾을 수 없어요." }, { status: 404 });
  }

  return Response.json(updated);
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ key: string }> }
) {
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

  const { key } = await params;
  const activations = await getLicenseActivations(key);
  return Response.json({ activations });
}
