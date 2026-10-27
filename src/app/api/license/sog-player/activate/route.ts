import { activateLicense } from "@/features/licenses/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";
import { getSogLicensePublicKeySpkiBase64 } from "@/infrastructure/licenses/sog-signing";

const ERROR_MESSAGES: Record<string, string> = {
  INVALID_KEY: "속플레이어용 라이선스 키가 아니거나 존재하지 않습니다.",
  REVOKED: "회수된 라이선스입니다. 관리자에게 문의해주세요.",
  EXPIRED: "사용기간이 만료된 라이선스입니다. 관리자에게 문의해주세요.",
  SLOT_FULL: "이미 다른 PC에서 활성화 중입니다. 관리자에게 문의해주세요.",
};

export function GET() {
  try {
    return Response.json(
      {
        algorithm: "ECDSA-P256-SHA256",
        publicKey: getSogLicensePublicKeySpkiBase64(),
      },
      { headers: { "Cache-Control": "public, max-age=3600" } }
    );
  } catch (error) {
    console.error("[sog-license] Signing key is unavailable:", error);
    return Response.json({ error: "라이선스 서비스를 준비하고 있습니다." }, { status: 503 });
  }
}

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

  // 서명 키가 없으면 DB 활성화 상태를 변경하기 전에 중단한다.
  try {
    getSogLicensePublicKeySpkiBase64();
  } catch (error) {
    console.error("[sog-license] Signing key is unavailable:", error);
    return Response.json({ error: "라이선스 서비스를 준비하고 있습니다." }, { status: 503 });
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
