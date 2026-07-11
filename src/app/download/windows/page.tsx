"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

const DOWNLOAD_URL =
  "https://github.com/phk901031-prog/hudtyping-saas/releases/download/v0.2.19/hudtyping-Setup-0.2.19.exe";

export default function WindowsDownloadPage() {
  // StrictMode(dev) 또는 다른 이유로 effect가 두 번 실행되어도 다운로드는 1회만 시작.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const link = document.createElement("a");
    link.href = DOWNLOAD_URL;
    link.rel = "noopener noreferrer";
    // <a> 클릭은 브라우저에 통상 다운로드로 취급됨(Content-Disposition 헤더 있음).
    link.click();
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-1 items-center justify-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-xl rounded-xl border border-border bg-card p-7 text-center shadow-[0_18px_48px_rgba(17,29,36,0.08)]">
        <span className="keycap mx-auto h-12 w-12 text-base">H</span>
        <p className="mt-5 text-sm font-bold text-accent">Windows v0.2.19</p>
        <h1 className="mt-2 font-display text-3xl">다운로드를 시작합니다</h1>
        <p className="mt-4 leading-7 text-muted">
          설치 파일 다운로드가 자동으로 시작됩니다. 브라우저가 다운로드를 막으면
          아래 버튼을 눌러 다시 받을 수 있습니다.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center justify-center rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:opacity-90"
          >
            설치 파일 다시 받기
          </a>
          <Link
            href="/install-help"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
          >
            설치 문제 해결
          </Link>
        </div>

        <p className="mt-5 text-xs leading-6 text-muted">
          파일은 GitHub Release에 보관되어 있지만, 사용 안내와 설치 흐름은
          HUDTyping 사이트에서 계속 확인할 수 있습니다.
        </p>
      </section>
    </main>
  );
}
