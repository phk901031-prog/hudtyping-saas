// src/app/(dashboard)/layout.tsx
// `(dashboard)` 라우트 그룹 전체에 적용되는 보호 레이아웃.
// 이 그룹에 들어가는 모든 페이지(현재는 /dashboard, 곧 /search, /workspace, /admin 추가 예정)는
// 자동으로 다음 검사를 통과해야 렌더링된다:
//
//   1. 로그인 여부 → 비로그인이면 /sign-in
//   2. DB row 존재 → 없으면 JIT로 생성 (status='pending')
//   3. 승인 상태 → 'pending' 또는 'rejected'면 /pending로 보냄
//
// 결과적으로 이 layout 아래의 페이지는 "로그인 + 승인된 사용자"만 도달한다.

import { redirect } from "next/navigation";
import { getOrCreateCurrentUser } from "@/features/users/service";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getOrCreateCurrentUser();

  // 1) 비로그인
  if (!user) {
    redirect("/sign-in");
  }

  // 2) 승인 안 된 상태 (pending, rejected) → 승인 대기 페이지로
  if (user.status !== "approved") {
    redirect("/pending");
  }

  // 3) 통과 — 자식 페이지 렌더링
  return <>{children}</>;
}
