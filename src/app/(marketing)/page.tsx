// src/app/(marketing)/page.tsx
// PlaySteno 포털 홈 — 3-카테고리 카드만 노출하는 짧은 진입 페이지.
// 낱말지기 랜딩 상세는 /work/natmalgi 로 분리, Play 는 /play/typing (준비 중),
// Study 는 링크 없이 "곧 공개" 자리표시자.

import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Keyboard,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "PlaySteno · 속기사의 놀이터",
  description:
    "속기를 위한 도구 · 게임 · 공부를 한 곳에서. 낱말지기(온라인)를 비롯한 속기사 도구·게임을 이용하세요.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "PlaySteno",
    title: "PlaySteno · 속기사의 놀이터",
    description:
      "속기를 위한 도구 · 게임 · 공부를 한 곳에서. 각 카테고리는 독립적으로 이용할 수 있습니다.",
  },
};

export const revalidate = 3600;

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      {/* ─────────────  PORTAL — 3 카테고리 진입  ───────────── */}
      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            PlaySteno · 속기사의 놀이터
          </p>
          <h1 className="ko-heading font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            속기를 위한 도구 · 게임 · 공부를 한 곳에서.
          </h1>
          <p className="ko-copy mx-auto max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
            필요한 곳을 골라 들어오세요. 각 카테고리는 독립적으로 이용할 수 있습니다.
          </p>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:gap-5">
          <PortalCard
            eyebrow="Work Steno"
            title="낱말지기"
            body="한글 문서 위에서 우리말샘 뜻풀이 · 예문을 바로 확인하는 Windows HUD."
            icon={Wrench}
            href="/work/natmalgi"
            cta="자세히 보기"
          />
          <PortalCard
            eyebrow="Play Steno"
            title="속기 타자 게임"
            body="속기 문장으로 타자 속도와 정확도를 겨루는 게임. 가입 없이 바로 플레이."
            icon={Keyboard}
            href="/play/typing"
            cta="지금 플레이"
            tone="accent"
          />
          <PortalCard
            eyebrow="Study Steno"
            title="속기 공부"
            body="자모 · 약자 학습, 자격증 정보, 연습 도구. 준비 중입니다."
            icon={BookOpen}
            cta="곧 공개"
            disabled
          />
        </div>
      </section>
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════
// PortalCard — 3-카테고리 진입 카드
// ═════════════════════════════════════════════════════════════════

function PortalCard({
  eyebrow,
  title,
  body,
  icon: Icon,
  href,
  cta,
  tone,
  disabled = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  icon: LucideIcon;
  href?: string;
  cta: string;
  tone?: "accent";
  disabled?: boolean;
}) {
  const baseClass =
    "group relative flex flex-col gap-5 rounded-2xl border p-6 transition sm:p-7";
  const enabledClass =
    tone === "accent"
      ? "border-accent/40 bg-accent/[0.04] hover:border-accent hover:bg-accent/[0.08]"
      : "border-border bg-background hover:border-accent/60 hover:bg-card";
  const disabledClass =
    "border-dashed border-border bg-muted-bg/50 opacity-70 cursor-not-allowed";

  const inner = (
    <>
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">
          {eyebrow}
        </p>
        <Icon size={22} className={disabled ? "text-muted" : "text-accent"} />
      </div>
      <div className="flex flex-col gap-2">
        <p className="font-display text-2xl">{title}</p>
        <p className="ko-copy text-sm leading-6 text-muted">{body}</p>
      </div>
      <div className="mt-auto flex items-center gap-1.5 text-sm font-bold">
        {disabled ? (
          <span className="text-muted">{cta}</span>
        ) : (
          <>
            <span className={tone === "accent" ? "text-accent" : "text-foreground"}>
              {cta}
            </span>
            <ArrowRight
              size={16}
              className={
                tone === "accent"
                  ? "text-accent transition group-hover:translate-x-0.5"
                  : "text-foreground transition group-hover:translate-x-0.5"
              }
            />
          </>
        )}
      </div>
    </>
  );

  if (disabled || !href) {
    return <div className={`${baseClass} ${disabledClass}`}>{inner}</div>;
  }

  return (
    <Link href={href} className={`${baseClass} ${enabledClass}`}>
      {inner}
    </Link>
  );
}
