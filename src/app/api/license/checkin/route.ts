// POST /api/license/checkin
// body: { key, fingerprint }
// 선택적 주기 재확인 — 회수 여부를 다시 확인하고 신선한 서명 토큰을 재발급한다.
// 만료일 자체는 절대 다시 계산하지 않는다 (activateLicense와 동일한 원칙).

import { checkinLicense } from "@/features/licenses/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_KEY: "등록된 활성화 정보를 찾을 수 없습니다.",
  REVOKED: "회수된 라이선스입니다.",
  EXPIRED: "유효기간이 만료된 라이선스입니다.",
  SLOT_FULL: "이미 다른 PC에서 활성화 중입니다.",
};

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit({
    scope: "license-checkin",
    subject: getRequestSubject(req),
    limit: 30,
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

  const result = await checkinLicense(body.key, body.fingerprint.trim());

  if ("error" in result) {
    return Response.json(
      { error: ERROR_MESSAGES[result.error], code: result.error },
      { status: 400 }
    );
  }

  return Response.json(result);
}
