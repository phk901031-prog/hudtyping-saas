// src/components/logout-button.tsx
// 로그아웃 버튼 — 클라이언트 컴포넌트.
//
// Clerk 7의 `<SignOutButton>`은 children으로 단일 element만 허용해서
// 우리처럼 자유롭게 스타일링한 button을 감싸려고 하면 제약이 거슬린다.
// 대신 `useClerk()`의 `signOut()`을 직접 호출하는 게 Clerk 7의 권장 패턴이고,
// 마크업도 우리가 100% 통제할 수 있어 더 깔끔하다.

"use client";

import { useClerk } from "@clerk/nextjs";

export function LogoutButton() {
  const { signOut } = useClerk();

  return (
    <button
      type="button"
      onClick={() => signOut({ redirectUrl: "/" })}
      className="rounded-full border border-zinc-300 dark:border-zinc-700 px-6 py-2 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900 transition mx-auto cursor-pointer"
    >
      로그아웃
    </button>
  );
}
