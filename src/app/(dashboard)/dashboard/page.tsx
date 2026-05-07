// src/app/(dashboard)/dashboard/page.tsx
// 승인된 사용자가 처음 도달하는 메인 대시보드.
// 사용자 role에 따라 admin 카드 추가 표시.

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateCurrentUser } from "@/features/users/service";

export default async function DashboardPage() {
  // (dashboard) layout에서 이미 검증했으므로 여기선 단순 조회
  const user = await getOrCreateCurrentUser();
  const isAdmin = user?.role === "admin";

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-10 relative">
      <header className="absolute top-4 right-4">
        <UserButton />
      </header>

      <div className="max-w-xl text-center flex flex-col gap-8">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            환영해요 👋
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            무엇을 하시겠어요?
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/search"
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-left"
          >
            <span className="text-2xl">🔍</span>
            <span className="font-semibold">우리말샘 검색</span>
            <span className="text-sm text-zinc-500">
              단어를 빠르게 찾아보세요.
            </span>
          </Link>

          <Link
            href="/api-keys"
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-left"
          >
            <span className="text-2xl">🔑</span>
            <span className="font-semibold">API 키</span>
            <span className="text-sm text-zinc-500">
              로컬 HUD 앱 인증용 키 발급/관리
            </span>
          </Link>

          <Link
            href="/stats"
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-left"
          >
            <span className="text-2xl">📊</span>
            <span className="font-semibold">내 검색 통계</span>
            <span className="text-sm text-zinc-500">
              총 검색 횟수, 캐시 적중률, 자주 찾은 단어
            </span>
          </Link>

          <Link
            href="/help"
            className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col gap-2 hover:border-zinc-400 dark:hover:border-zinc-600 transition text-left"
          >
            <span className="text-2xl">📖</span>
            <span className="font-semibold">사용 가이드</span>
            <span className="text-sm text-zinc-500">
              처음 사용하시면 여기부터
            </span>
          </Link>

          {/* admin만 보이는 카드 */}
          {isAdmin && (
            <Link
              href="/admin"
              className="rounded-2xl border border-purple-200 bg-purple-50/50 dark:bg-purple-950/20 dark:border-purple-800 p-6 flex flex-col gap-2 hover:border-purple-400 dark:hover:border-purple-600 transition text-left"
            >
              <span className="text-2xl">🛠</span>
              <span className="font-semibold">관리자</span>
              <span className="text-sm text-zinc-500">
                회원 관리, 전체 통계
              </span>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
