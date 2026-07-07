import { getOrCreateCurrentUser } from "@/features/users/service";
import { AdminPermissionError, assertAdmin } from "@/features/admin/permissions";
import { prewarmPopularSearches } from "@/features/admin/cache-prewarm";

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

  const form = await req.formData().catch(() => null);
  const rawLimit = form?.get("limit")?.toString() ?? "50";
  const limit = Number.parseInt(rawLimit, 10);
  const result = await prewarmPopularSearches(Number.isFinite(limit) ? limit : 50);

  return Response.redirect(new URL(`/admin/stats?prewarm=${result.warmed}`, req.url));
}
