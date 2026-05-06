// src/app/(dashboard)/admin/page.tsx
// 관리자 메인 — 두 하위 페이지 진입점.

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function AdminHomePage() {
  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-3xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← 대시보드
        </Link>
        <UserButton />
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">관리자</h1>
        <p className="text-sm text-zinc-500">
          회원 승인 및 전체 통계를 관리합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/admin/users"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-left"
        >
          <span className="text-2xl">👥</span>
          <span className="font-semibold">회원 관리</span>
          <span className="text-sm text-zinc-500">
            가입자 승인·거절·권한 변경
          </span>
        </Link>

        <Link
          href="/admin/stats"
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-left"
        >
          <span className="text-2xl">📈</span>
          <span className="font-semibold">전체 통계</span>
          <span className="text-sm text-zinc-500">
            가입자·검색량·인기 단어
          </span>
        </Link>
      </div>
    </main>
  );
}
