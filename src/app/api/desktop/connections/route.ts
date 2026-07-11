import { getOrCreateCurrentUser } from "@/features/users/service";
import { createDesktopConnectionCode } from "@/features/desktop-connections/service";
import { checkRateLimit } from "@/features/security/rate-limit";

export async function POST() {
  const user = await getOrCreateCurrentUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (user.status !== "approved") {
    return Response.json(
      { error: "관리자 승인 후 프로그램을 연결할 수 있습니다." },
      { status: 403 }
    );
  }

  const rateLimit = await checkRateLimit({
    scope: "connection-create",
    subject: user.clerkId,
    limit: 10,
  });
  if (!rateLimit.allowed) {
    return Response.json(
      { error: "연결 코드를 너무 자주 발급했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const connection = await createDesktopConnectionCode(user);
  return Response.json(connection, { status: 201 });
}
