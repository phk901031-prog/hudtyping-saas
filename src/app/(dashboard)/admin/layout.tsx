// src/app/(dashboard)/admin/layout.tsx
// admin 라우트 그룹 보호 — role='admin'만 통과.
//
// (dashboard) layout이 이미 인증/승인 검사를 했으므로 여기서는 role만 추가 검사.

import { redirect } from "next/navigation";
import { getOrCreateCurrentUser } from "@/features/users/service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateCurrentUser();
  if (!user) redirect("/sign-in");
  if (user.role !== "admin") redirect("/dashboard");
  return <>{children}</>;
}
