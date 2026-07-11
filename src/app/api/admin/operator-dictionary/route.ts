import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import {
  deleteOperatorDictionaryEntry,
  upsertOperatorDictionaryEntry,
} from "@/features/admin/operator-dictionary";
import { checkRateLimit } from "@/features/security/rate-limit";

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

  const form = await req.formData();
  const action = form.get("action")?.toString() ?? "save";

  if (action === "delete") {
    const id = Number.parseInt(form.get("id")?.toString() ?? "", 10);
    if (Number.isFinite(id)) {
      await deleteOperatorDictionaryEntry(id);
    }
    return Response.redirect(new URL("/admin/operator-dictionary", req.url));
  }

  await upsertOperatorDictionaryEntry({
    term: form.get("term")?.toString() ?? "",
    label: form.get("label")?.toString() ?? "운영자 등록 표기",
    note: form.get("note")?.toString() ?? "",
    enabled: form.get("enabled")?.toString() === "on",
    createdBy: me.clerkId,
  });

  return Response.redirect(new URL("/admin/operator-dictionary", req.url));
}
