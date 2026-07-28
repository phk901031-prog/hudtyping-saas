// src/app/error.tsx
// 런타임 에러 발생 시 자동 표시 (Next.js error boundary).
// 클라이언트 컴포넌트여야 함 — error/reset prop이 클라이언트 객체.

"use client";

import Link from "next/link";
import { useEffect } from "react";
import { OPENCHAT } from "@/config/community";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 운영 환경에서는 외부 에러 추적기(Sentry 등)로 보낼 자리.
    // 지금은 콘솔만 — Vercel Function logs에 남음.
    console.error("[error.tsx]", error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 gap-6 text-center bg-background text-foreground">
      <span className="font-display text-5xl text-accent">⚠</span>
      <h1 className="font-display text-2xl sm:text-3xl">
        문제가 생겼어요
      </h1>
      <p className="text-muted leading-relaxed max-w-md">
        잠시 후 다시 시도해주세요. 같은 문제가 반복되면 카카오톡{" "}
        <a
          href={OPENCHAT.url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-accent underline"
        >
          오픈톡방
        </a>
        에 알려주세요.
      </p>
      {error.digest && (
        <code className="text-xs text-muted bg-muted-bg px-3 py-1 rounded">
          오류 코드: {error.digest}
        </code>
      )}
      <div className="flex flex-col sm:flex-row gap-2 mt-2">
        <button
          type="button"
          onClick={reset}
          className="px-6 py-3 rounded-full bg-foreground text-background text-sm font-medium hover:opacity-90 transition"
        >
          다시 시도
        </button>
        <Link
          href="/"
          className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-muted-bg transition"
        >
          홈으로
        </Link>
      </div>
    </main>
  );
}
