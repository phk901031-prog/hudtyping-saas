// src/app/not-found.tsx
// 404 페이지 — Next.js가 매칭되는 라우트를 못 찾을 때 자동 표시.

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-6 text-center bg-background text-foreground">
      <span className="font-display text-6xl text-accent">404</span>
      <h1 className="font-display text-2xl sm:text-3xl">
        찾는 페이지가 없어요
      </h1>
      <p className="text-muted leading-relaxed max-w-md">
        주소가 바뀌었거나, 잘못 입력됐을 수 있어요. 홈에서 다시 둘러봐 주세요.
      </p>
      <Link
        href="/"
        className="mt-2 px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}
