import { activateDesktopConnection } from "@/features/desktop-connections/service";
import { checkRateLimit, getRequestSubject } from "@/features/security/rate-limit";

export async function POST(req: Request) {
  const rateLimit = await checkRateLimit({
    scope: "connection-activate",
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
    code?: string;
    deviceName?: string;
  };

  if (!body.code?.trim() || body.code.length > 32) {
    return Response.json({ error: "연결 코드를 입력해주세요." }, { status: 400 });
  }

  const result = await activateDesktopConnection(body.code, body.deviceName);
  if (!result) {
    return Response.json(
      { error: "연결 코드가 유효하지 않거나 만료되었습니다." },
      { status: 400 }
    );
  }

  return Response.json({
    token: result.token,
    user: result.user,
  });
}
