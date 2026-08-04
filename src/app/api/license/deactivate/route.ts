// POST /api/license/deactivate
// body: { key, fingerprint }
// 사용자가 "이 PC 비활성화"를 눌러 슬롯을 반납할 때 호출된다 (다른 PC로 옮기려는 경우 등).

import { deactivateLicenseSlot } from "@/features/licenses/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit({
    scope: "license-deactivate",
    subject: getRequestSubject(req),
    limit: 10,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { key?: string; fingerprint?: string };
  if (!body.key?.trim() || !body.fingerprint?.trim()) {
    return Response.json({ error: "라이선스 키와 기기 정보가 필요합니다." }, { status: 400 });
  }

  const deactivated = await deactivateLicenseSlot(body.key, body.fingerprint.trim());
  if (!deactivated) {
    return Response.json(
      { error: "활성화된 정보를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return Response.json({ deactivated: true });
}
