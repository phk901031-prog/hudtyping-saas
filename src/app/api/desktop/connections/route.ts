import { getOrCreateCurrentUser } from "@/features/users/service";
import { createDesktopConnectionCode } from "@/features/desktop-connections/service";

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

  const connection = await createDesktopConnectionCode(user);
  return Response.json(connection, { status: 201 });
}
