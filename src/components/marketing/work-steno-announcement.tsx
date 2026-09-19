"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { OPENCHAT } from "@/config/community";

export function WorkStenoAnnouncement() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsOpen(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function close() {
    setIsOpen(false);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink/70 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-steno-dialog-title"
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) close();
      }}
    >
      <div className="max-h-[94dvh] w-full max-w-4xl overflow-y-auto rounded-t-2xl bg-background shadow-2xl sm:rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4 sm:px-7">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            Beta testing · Coming soon
          </p>
          <button
            type="button"
            onClick={close}
            className="grid size-9 place-items-center rounded-full border border-border text-lg text-muted transition hover:border-foreground hover:text-foreground"
            aria-label="팝업 닫기"
          >
            ×
          </button>
        </div>

        <div className="grid md:grid-cols-[1.08fr_0.92fr]">
          <div className="border-b border-border bg-[#eef2f7] p-3 md:border-b-0 md:border-r md:p-5">
            <div className="overflow-hidden rounded-lg border border-[#cfd7e4] bg-white shadow-sm">
              <Image
                src="/marketing/work-steno-new-job.png"
                alt="WORK STENO 새 음성 작업 화면"
                width={1366}
                height={768}
                className="h-auto w-full"
                priority
              />
            </div>
            <p className="mt-2 text-center text-[11px] text-[#65738a]">개발 중인 실제 데스크톱 화면</p>
          </div>

          <div className="flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9">
            <h2 id="work-steno-dialog-title" className="ko-heading text-2xl font-black leading-tight tracking-[-0.03em] sm:text-3xl">
              속기사가 실제로 일하는 방식에 맞춘 음성인식
            </h2>
            <p className="ko-copy mt-4 text-[15px] leading-7 text-muted">
              클로바노트·다글로처럼 폭넓은 사용자를 위한 범용 음성 기록 서비스와 달리, WORK STENO는
              업무별 속기사의 실제 작업 환경과 데이터를 토대로 만들고 있습니다.
            </p>
            <p className="ko-copy mt-3 text-[15px] font-semibold leading-7 text-foreground">
              현재 WORK STENO를 함께 검증할 속기사 베타테스터를 모집하고 있습니다. 참여를 희망하면 카카오톡으로 연락해 주세요.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4">
              <Link href="/work-steno" onClick={close} className="editorial-button">
                내용 보기
              </Link>
              <a
                href={OPENCHAT.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={close}
                className="text-sm font-bold text-accent underline underline-offset-4"
              >
                베타테스터 문의
              </a>
              <button type="button" onClick={close} className="text-sm font-bold text-muted underline underline-offset-4 hover:text-foreground">
                닫기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
