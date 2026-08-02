// src/app/(dashboard)/dashboard/page.tsx
// 승인된 사용자가 처음 도달하는 메인 대시보드.
// 사용자 role에 따라 admin 카드 추가 표시.

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { DashboardCard } from "@/components/dashboard/dashboard-card";

export default async function DashboardPage() {
  // (dashboard) layout에서 이미 검증했으므로 여기선 단순 조회
  const user = await getOrCreateCurrentUser();
  const isAdmin = user?.role === "admin";

  return (
    <main className="relative flex flex-1 flex-col items-center justify-center gap-10 px-5 py-20 sm:px-8">
      <header className="absolute top-4 left-4 right-4 flex items-center justify-between">
        <Link
          href="/"
          aria-label="메인 화면으로"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground transition group"
        >
          <span className="keycap w-7 h-7 text-xs">H</span>
          <span className="font-medium">← 메인 화면</span>
        </Link>
        <UserButton />
      </header>

      <div className="flex w-full max-w-4xl flex-col gap-8 text-center">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-bold text-accent">낱말지기 워크스페이스</p>
          <h1 className="font-display text-3xl sm:text-4xl">환영합니다</h1>
          <p className="text-lg text-muted">필요한 작업을 선택하세요.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashboardCard href="/search" eyebrow="SEARCH" title="우리말샘 검색" description="뜻풀이와 예문을 웹에서도 빠르게 확인합니다." />
          <DashboardCard href="/api-keys" eyebrow="CONNECT" title="프로그램 연결" description="일회용 연결 코드로 낱말지기 앱을 안전하게 연결합니다." />
          <DashboardCard href="/stats" eyebrow="STATS" title="내 검색 통계" description="사용량, 최근 검색어와 자주 찾은 단어를 확인합니다." />
          <DashboardCard href="/help" eyebrow="GUIDE" title="사용 가이드" description="설치부터 단축키와 문제 해결 방법까지 살펴봅니다." />

          {/* admin만 보이는 카드 */}
          {isAdmin && (
            <DashboardCard href="/admin" eyebrow="ADMIN" title="관리자" description="회원 승인, 운영 사전과 전체 통계를 관리합니다." tone="admin" />
          )}
        </div>
      </div>
    </main>
  );
}
