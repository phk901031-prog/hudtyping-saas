// src/app/(marketing)/page.tsx
// PlaySteno 포털 홈 — 3-카테고리(Work/Play/Study) 진입 페이지.
// 각 카테고리를 색으로 구분하고, 지금 있는 기능 + 앞으로 추가될 기능을 함께 보여줘서
// "속기의 모든 것이 모이는 곳"이라는 확장성이 드러나도록 한다.
// 낱말지기 랜딩 상세는 /work/natmalgi 로, Play 는 /play/typing, Study 는 /study/bogochigi 로.

import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  Headphones,
  Keyboard,
  Sparkles,
  Wrench,
  Zap,
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

type Tone = "accent" | "signal" | "success";

interface SubItem {
  label: string;
  href?: string; // 없으면 "준비 중"
  icon: LucideIcon;
}

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">
            PlaySteno · 속기사의 놀이터
          </p>
          <h1 className="ko-heading font-display text-3xl leading-tight sm:text-4xl lg:text-5xl">
            속기의 모든 것이 여기 모입니다.
          </h1>
          <p className="ko-copy mx-auto max-w-2xl text-sm leading-7 text-muted sm:text-base sm:leading-8">
            실무 도구, 게임, 공부까지 — 필요한 곳을 골라 들어오세요. 각 카테고리는
            계속 채워지고 있습니다.
          </p>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <PortalCard
            tone="accent"
            eyebrow="Work Steno"
            title="속기 실무 도구"
            body="한글 문서 위에서 우리말샘 뜻풀이 · 예문을 바로 확인하는 Windows HUD."
            icon={Wrench}
            href="/work/natmalgi"
            cta="낱말지기 자세히 보기"
            subItems={[
              { label: "낱말지기", href: "/work/natmalgi", icon: Wrench },
              { label: "AI 속기 툴", icon: Sparkles },
            ]}
          />
          <PortalCard
            tone="signal"
            eyebrow="Play Steno"
            title="속기 타자 게임"
            body="속기 문장으로 타자 속도와 정확도를 겨루는 게임. 가입 없이 바로 플레이."
            icon={Keyboard}
            href="/play/typing"
            cta="지금 플레이"
            subItems={[
              { label: "단문·장문 타자전", href: "/play/typing", icon: Zap },
              { label: "미니게임", icon: Sparkles },
            ]}
          />
          <PortalCard
            tone="success"
            eyebrow="Study Steno"
            title="속기 시험 준비"
            body="원하는 글을 붙여넣고 원하는 속도로 보고치기 연습. 한글속기 채점기준으로 채점."
            icon={BookOpen}
            href="/study/bogochigi"
            cta="보고치기 연습하러 가기"
            subItems={[
              { label: "보고치기", href: "/study/bogochigi", icon: BookOpen },
              { label: "듣고치기", icon: Headphones },
              { label: "약어 연습", icon: Sparkles },
            ]}
          />
        </div>
      </section>
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════
// PortalCard — 3-카테고리 진입 카드
// ═════════════════════════════════════════════════════════════════

const TONE_CLASSES: Record<
  Tone,
  { border: string; wash: string; iconBadge: string; text: string; chipActive: string }
> = {
  accent: {
    border: "border-accent/35 hover:border-accent",
    wash: "bg-accent/[0.05] hover:bg-accent/[0.09]",
    iconBadge: "bg-accent/15 text-accent",
    text: "text-accent",
    chipActive: "border-accent/40 bg-accent/10 text-accent",
  },
  signal: {
    border: "border-signal/35 hover:border-signal",
    wash: "bg-signal/[0.05] hover:bg-signal/[0.09]",
    iconBadge: "bg-signal/15 text-signal",
    text: "text-signal",
    chipActive: "border-signal/40 bg-signal/10 text-signal",
  },
  success: {
    border: "border-success/35 hover:border-success",
    wash: "bg-success/[0.05] hover:bg-success/[0.09]",
    iconBadge: "bg-success/15 text-success",
    text: "text-success",
    chipActive: "border-success/40 bg-success/10 text-success",
  },
};

function PortalCard({
  tone,
  eyebrow,
  title,
  body,
  icon: Icon,
  href,
  cta,
  subItems,
}: {
  tone: Tone;
  eyebrow: string;
  title: string;
  body: string;
  icon: LucideIcon;
  href: string;
  cta: string;
  subItems: SubItem[];
}) {
  const t = TONE_CLASSES[tone];

  return (
    <div className={`group relative flex flex-col gap-5 rounded-2xl border p-6 transition sm:p-7 ${t.border} ${t.wash}`}>
      <div className="flex items-center justify-between">
        <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${t.text}`}>{eyebrow}</p>
        <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${t.iconBadge}`}>
          <Icon size={20} />
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-display text-2xl">{title}</p>
        <p className="ko-copy text-sm leading-6 text-muted">{body}</p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {subItems.map((item) => (
          <li key={item.label}>
            {item.href ? (
              <Link
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold transition ${t.chipActive}`}
              >
                <item.icon size={12} />
                {item.label}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1 text-xs font-bold text-muted">
                <item.icon size={12} />
                {item.label}
                <span className="text-[10px] font-normal">· 준비 중</span>
              </span>
            )}
          </li>
        ))}
      </ul>

      <Link
        href={href}
        className="mt-auto flex items-center gap-1.5 text-sm font-bold text-foreground"
      >
        <span className={t.text}>{cta}</span>
        <ArrowRight size={16} className={`${t.text} transition group-hover:translate-x-0.5`} />
      </Link>
    </div>
  );
}
