import { activateDesktopConnection } from "@/features/desktop-connections/service";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    code?: string;
    deviceName?: string;
  };

  if (!body.code?.trim()) {
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
