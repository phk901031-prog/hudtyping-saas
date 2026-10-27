import { activateLicense } from "@/features/licenses/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_KEY: "속플레이어용 라이선스 키가 아니거나 존재하지 않습니다.",
  REVOKED: "회수된 라이선스입니다. 관리자에게 문의해주세요.",
  EXPIRED: "사용기간이 만료된 라이선스입니다. 관리자에게 문의해주세요.",
  SLOT_FULL: "이미 다른 PC에서 활성화 중입니다. 관리자에게 문의해주세요.",
};

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit({
    scope: "sog-license-activate",
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
  const fingerprint = body.fingerprint?.trim().toLowerCase();
  if (!fingerprint || !/^[a-f0-9]{64}$/.test(fingerprint)) {
    return Response.json({ error: "기기 정보를 확인할 수 없습니다." }, { status: 400 });
  }
  const deviceName = body.deviceName?.trim();
  if (deviceName && deviceName.length > 100) {
    return Response.json({ error: "기기 이름이 너무 깁니다." }, { status: 400 });
  }

  const result = await activateLicense(
    body.key,
    fingerprint,
    deviceName,
    "sog_player"
  );
  if ("error" in result) {
    return Response.json(
      { error: ERROR_MESSAGES[result.error], code: result.error },
      { status: 400 }
    );
  }
  return Response.json({ ...result, serverTime: new Date().toISOString() });
}
