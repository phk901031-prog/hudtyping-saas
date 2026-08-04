// POST /api/license/activate
// body: { key, fingerprint, deviceName? }
// 낱말지기 데스크톱 앱의 첫 실행(정품 등록) 또는 재설치 시 호출된다.

import { activateLicense } from "@/features/licenses/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_KEY: "존재하지 않는 라이선스 키입니다.",
  REVOKED: "회수된 라이선스입니다.",
  EXPIRED: "유효기간이 만료된 라이선스입니다.",
  SLOT_FULL: "이미 다른 PC에서 활성화 중입니다. 기존 PC를 비활성화한 뒤 다시 시도해주세요.",
};

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit({
    scope: "license-activate",
    subject: getRequestSubject(req),
    limit: 20,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const body = (await req.json().catch(() => ({}))) as {
    key?: string;
    fingerprint?: string;
    deviceName?: string;
  };

  if (!body.key?.trim()) {
    return Response.json({ error: "라이선스 키를 입력해주세요.", code: "INVALID_KEY" }, { status: 400 });
  }
  if (!body.fingerprint?.trim()) {
    return Response.json({ error: "기기 정보를 확인할 수 없습니다." }, { status: 400 });
  }

  const result = await activateLicense(body.key, body.fingerprint.trim(), body.deviceName);

  if ("error" in result) {
    return Response.json(
      { error: ERROR_MESSAGES[result.error], code: result.error },
      { status: 400 }
    );
  }

  return Response.json(result);
}
