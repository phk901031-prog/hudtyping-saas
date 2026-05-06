// src/app/(auth)/pending/page.tsx
// 승인 대기 페이지.
// 서버 컴포넌트(RSC)에서 다음 분기를 한다:
//   - 비로그인 → "로그인하기" 안내
//   - 로그인 + status='approved' → /dashboard 로 자동 이동 (이미 승인된 사람)
//   - 로그인 + status='pending'/'rejected' → 본 안내 화면

import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { LogoutButton } from "@/components/logout-button";

export default async function PendingPage() {
  const user = await getOrCreateCurrentUser();

  // 비로그인 사용자가 직접 URL 친 경우
  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="max-w-md text-center flex flex-col gap-6">
          <h1 className="text-2xl font-bold">승인 대기 중</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            로그인되어 있지 않아요.
          </p>
          <Link
            href="/sign-in"
            className="rounded-full bg-foreground text-background px-6 py-2 text-sm font-medium hover:opacity-90 transition mx-auto"
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  // 이미 승인된 사용자 → 워크스페이스로 자동 이동
  if (user.status === "approved") {
    redirect("/dashboard");
  }

  // pending 또는 rejected 사용자 → 안내 화면
  // (rejected는 별도 메시지로 분기할 수 있지만 지금은 동일 안내)
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md text-center flex flex-col gap-6">
        <h1 className="text-2xl font-bold">승인 대기 중</h1>
        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
          회원가입이 완료됐어요. 🎉
          <br />
          관리자가 가입을 검토한 뒤 이메일로 알려드릴게요.
          <br />
          <span className="text-sm text-zinc-500">
            (베타 운영 단계라 가입 승인 절차가 있어요.)
          </span>
        </p>
        <LogoutButton />
      </div>
    </main>
  );
}
