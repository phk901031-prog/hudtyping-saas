"use client";

import { useEffect } from "react";
import Link from "next/link";

const DOWNLOAD_URL =
  "https://github.com/phk901031-prog/hudtyping-saas/releases/download/v0.2.13/hudtyping-Setup-0.2.13.exe";

export default function WindowsDownloadPage() {
  useEffect(() => {
    const iframe = document.createElement("iframe");
    iframe.src = DOWNLOAD_URL;
    iframe.hidden = true;
    iframe.title = "HUDTyping Windows installer download";
    document.body.appendChild(iframe);

    return () => {
      iframe.remove();
    };
  }, []);

  return (
    <main className="flex min-h-[calc(100vh-80px)] flex-1 items-center justify-center bg-background px-5 py-12 text-foreground">
      <section className="w-full max-w-xl rounded-xl border border-border bg-card p-7 text-center shadow-[0_18px_48px_rgba(17,29,36,0.08)]">
        <span className="keycap mx-auto h-12 w-12 text-base">H</span>
        <p className="mt-5 text-sm font-bold text-accent">Windows v0.2.13</p>
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
