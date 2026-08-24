"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { WINDOWS_RELEASE } from "@/config/release";
import { OPENCHAT } from "@/config/community";

export default function WindowsDownloadPage() {
  // StrictMode(dev) 또는 다른 이유로 effect가 두 번 실행되어도 다운로드는 1회만 시작.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const link = document.createElement("a");
    link.href = WINDOWS_RELEASE.downloadUrl;
    link.rel = "noopener noreferrer";
    link.click();
  }, []);

  return (
    <main className="flex-1 bg-background px-5 py-12 text-foreground sm:px-8">
      {/* 상단: 다운로드 시작 알림 */}
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-border bg-card p-8 text-center shadow-[0_18px_48px_rgba(17,29,36,0.06)]">
        <span className="keycap mx-auto h-12 w-12 text-base">H</span>
        <p className="mt-5 text-sm font-bold text-accent">
          Windows v{WINDOWS_RELEASE.version}
        </p>
        <h1 className="mt-2 font-display text-3xl">다운로드를 시작합니다</h1>
        <p className="mt-4 leading-7 text-muted">
          설치 파일 다운로드가 자동으로 시작됩니다. 시작되지 않으면 아래{" "}
          <strong>설치 파일 다시 받기</strong> 를 눌러주세요.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href={WINDOWS_RELEASE.downloadUrl}
            className="inline-flex items-center justify-center rounded-md bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:opacity-90"
          >
            설치 파일 다시 받기
          </a>
          <Link
            href="/install-help"
            className="inline-flex items-center justify-center rounded-md border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
          >
            자세한 설치 도움말
          </Link>
        </div>
      </section>

      {/* 설치 흐름 안내 */}
      <section className="mx-auto mt-12 w-full max-w-4xl">
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">설치 안내</p>
          <h2 className="font-display text-3xl sm:text-4xl">
            설치는 3단계면 됩니다
          </h2>
          <p className="max-w-2xl text-base leading-7 text-muted">
            현재 코드 서명이 적용되지 않아 Windows가 게시자를 확인할 수 없다는 경고를
            표시할 수 있습니다. 공식 다운로드 주소와 파일명을 확인한 뒤 진행하세요.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <InstallStep
            index="1"
            title="다운로드 파일 열기"
            body="다운로드가 끝나면 브라우저 우하단 파일을 클릭하거나 다운로드 폴더의 설치 파일을 실행합니다."
          >
            <BrowserBarMock />
          </InstallStep>

          <InstallStep
            index="2"
            title="추가 정보 클릭"
            body="파란 화면이 뜨면 상단의 '추가 정보' 텍스트를 누르세요. 숨겨진 실행 버튼이 나타납니다."
          >
            <SmartScreenMock highlight="more-info" />
          </InstallStep>

          <InstallStep
            index="3"
            title="실행 → 설치"
            body="새로 나타난 '실행' 버튼을 누르면 설치 마법사가 열립니다. 이후엔 안내대로 진행하면 됩니다."
          >
            <SmartScreenMock highlight="run" />
          </InstallStep>
        </div>
      </section>

      {/* 왜 경고가 뜨는지 설명 */}
      <section className="mx-auto mt-14 w-full max-w-4xl">
        <div className="rounded-2xl border border-border bg-panel p-8">
          <div className="flex items-start gap-4">
            <span
              aria-hidden="true"
              className="mt-1 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-2xl"
            >
              🛡
            </span>
            <div className="flex flex-col gap-3">
              <h3 className="font-display text-xl">
                왜 &ldquo;검증되지 않은 파일&rdquo; 경고가 뜨나요?
              </h3>
              <p className="text-[15px] leading-7 text-muted [word-break:keep-all]">
                코드 서명은 Windows가 파일의 배포 주체와 서명 이후 변경 여부를 확인하는
                수단입니다. 낱말지기 온라인은 아직 코드 서명을 적용하지 않아 게시자를
                확인할 수 없다는 경고가 표시될 수 있습니다.
              </p>
              <p className="text-[15px] leading-7 text-muted [word-break:keep-all]">
                설치 파일은 공식 GitHub Releases에서만 받으세요. 다운로드 주소나 파일명이
                다르거나 백신이 구체적인 위협을 탐지하면 실행하지 말고 문의해 주세요.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href="/install-help"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-muted-bg"
                >
                  자세한 설치 도움말 →
                </Link>
                <a
                  href={OPENCHAT.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-4 py-2 text-sm font-bold transition hover:bg-muted-bg"
                >
                  공지·문의 채널 →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-6 text-muted">
        파일은 GitHub Releases에 보관됩니다. 사용 안내와 설치 흐름은 PlaySteno에서
        계속 확인하실 수 있습니다.
      </p>
    </main>
  );
}

// ─────────────────────────────────────────────────────────
// 헬퍼
// ─────────────────────────────────────────────────────────

function InstallStep({
  index,
  title,
  body,
  children,
}: {
  index: string;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-2xl font-bold text-accent">{index}</span>
        <h3 className="font-display text-lg leading-tight">{title}</h3>
      </div>
      <div className="rounded-lg border border-border bg-panel p-3">
        {children}
      </div>
      <p className="text-sm leading-6 text-muted [word-break:keep-all]">
        {body}
      </p>
    </article>
  );
}

/** Chrome 하단 다운로드 바 목업 */
function BrowserBarMock() {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-zinc-300/60 bg-white px-3 py-2 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex min-w-0 items-center gap-2">
        <span aria-hidden="true" className="text-lg">📦</span>
        <div className="min-w-0">
          <p className="truncate text-[11px] font-bold text-zinc-800 dark:text-zinc-100">
            hudtyping-Setup-{WINDOWS_RELEASE.version}.exe
          </p>
          <p className="text-[10px] text-zinc-500">다운로드 완료</p>
        </div>
      </div>
      <span className="shrink-0 rounded bg-accent px-2 py-1 text-[10px] font-bold text-white">
        열기
      </span>
    </div>
  );
}

/** SmartScreen 파란 다이얼로그 목업. highlight 로 강조 위치 */
function SmartScreenMock({
  highlight,
}: {
  highlight: "more-info" | "run";
}) {
  return (
    <div className="flex flex-col gap-2 rounded-md bg-[#0067b8] p-3 text-white shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-white/70">
        Windows에서 PC 보호
      </p>
      <p className="text-[11px] leading-5 text-white/90">
        인식되지 않은 앱의 시작을 차단했습니다.
      </p>
      {highlight === "more-info" ? (
        <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-sm border border-yellow-300 bg-yellow-300/20 px-2 py-1 text-[10px] font-bold text-yellow-100">
          ← 추가 정보
        </span>
      ) : (
        <div className="mt-1 flex gap-2">
          <span className="rounded-sm border border-yellow-300 bg-yellow-300 px-2.5 py-1 text-[10px] font-bold text-[#0067b8]">
            실행
          </span>
          <span className="rounded-sm border border-white/30 px-2.5 py-1 text-[10px] font-bold text-white/70">
            실행 안 함
          </span>
        </div>
      )}
    </div>
  );
}
