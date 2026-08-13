// src/app/(marketing)/play/typing/page.tsx
// Play Steno · 속기 타자 게임 — 임시 자리표시자.
// Phase C~E 에서 실제 게임 (kingoftyping 이식) 붙일 위치. 지금은 준비 중 안내만.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, Keyboard } from "lucide-react";

export const metadata: Metadata = {
  title: "속기 타자 게임 (준비 중) | Play Steno",
  description:
    "속기 문장으로 타자 속도와 정확도를 겨루는 게임. 곧 공개됩니다.",
};

export default function PlayTypingPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-6 py-16 sm:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={16} /> PlaySteno 홈
      </Link>

      <div className="flex flex-col items-center gap-6 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center sm:py-20">
        <Keyboard size={44} className="text-accent" />
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            Play Steno
          </p>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">
            속기 타자 게임을 준비하고 있어요.
          </h1>
          <p className="ko-copy mx-auto max-w-md text-sm leading-7 text-muted">
            속기 실무에 가까운 문장으로 타자 속도와 정확도를 겨루는 게임입니다.
            <br />
            비회원도 바로 플레이할 수 있도록 준비 중입니다.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-5 py-2.5 text-sm font-bold text-foreground transition hover:border-accent hover:text-accent"
        >
          PlaySteno 홈으로
        </Link>
      </div>
    </main>
  );
}
