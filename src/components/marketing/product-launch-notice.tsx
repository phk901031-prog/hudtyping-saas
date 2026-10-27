"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const NOTICE_KEY = "playsteno-product-notice-sog-player-v1";

export function ProductLaunchNotice() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const dismiss = useCallback(() => {
    window.localStorage.setItem(NOTICE_KEY, "dismissed");
    setOpen(false);
  }, []);

  useEffect(() => {
    if (window.localStorage.getItem(NOTICE_KEY)) return;
    const timer = window.setTimeout(() => setOpen(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dismiss, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-5" onMouseDown={dismiss}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-notice-title"
        className="sog-theme w-full max-w-xl rounded-t-3xl border border-white/10 bg-[var(--sog-bg)] p-6 text-[var(--sog-text)] shadow-2xl sm:rounded-3xl sm:p-8"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">New product</p>
          <button ref={closeButtonRef} type="button" onClick={dismiss} className="-m-2 rounded-full p-2 text-xl text-white/60 transition hover:text-white" aria-label="새 제품 안내 닫기">
            ×
          </button>
        </div>
        <h2 id="product-notice-title" className="ko-heading mt-5 text-3xl font-black tracking-[-0.035em] sm:text-4xl">
          새로운 기록 도구,
          <br />속플레이어를 만나보세요.
        </h2>
        <p className="ko-copy mt-5 text-[15px] leading-7 text-white/65">
          여러 녹음을 같은 현장 시점으로 맞추고, 화자 기준점과 문서의 별표 구간을 작업 중 바로 확인할 수 있습니다.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href="/sog-player#film" onClick={dismiss} className="sog-button">2분 38초 영상 보기</Link>
          <Link href="/sog-player" onClick={dismiss} className="inline-flex items-center px-2 text-sm font-bold text-white underline decoration-white/25 underline-offset-4">
            자세히 알아보기 →
          </Link>
        </div>
        <p className="ko-copy mt-6 border-t border-white/10 pt-5 text-xs leading-5 text-white/45">
          설치 후 라이선스 등록이 필요합니다. 라이선스 발급은 카카오톡으로 문의해주세요.
        </p>
      </section>
    </div>
  );
}
