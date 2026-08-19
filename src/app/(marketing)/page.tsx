// src/app/(marketing)/page.tsx
// PlaySteno 포털 홈 — 3-카테고리(Work/Play/Study)를 색으로 구분한 가로 밴드로 배치.
// 각 밴드 안 세부 항목은 실제 사용 가능한 크기의 버튼으로 — 라이브 항목은 진하게
// 채운 색, 준비 중 항목은 점선 테두리로 구분해서 지금 있는 것과 앞으로 채워질 것이
// 한눈에 보이도록 한다.
// 낱말지기 랜딩 상세는 /work/natmalgi 로, Play 는 /play/typing, Study 는 /study/bogochigi 로.

import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BookOpen,
  CloudRain,
  Headphones,
  ListChecks,
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

interface CategoryItem {
  label: string;
  href?: string; // 없으면 "준비 중"
  icon: LucideIcon;
}

interface Category {
  tone: Tone;
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  items: CategoryItem[];
}

const CATEGORIES: Category[] = [
  {
    tone: "accent",
    eyebrow: "Work Steno",
    title: "속기 실무 도구",
    icon: Wrench,
    items: [
      { label: "낱말지기", href: "/work/natmalgi", icon: Wrench },
      { label: "AI 속기 툴", icon: Sparkles },
    ],
  },
  {
    tone: "signal",
    eyebrow: "Play Steno",
    title: "속기 타자 게임",
    icon: Zap,
    items: [
      { label: "단문 타자전", href: "/play/typing", icon: Zap },
      { label: "장문 타자전", href: "/play/typing", icon: Zap },
      { label: "산성비", icon: CloudRain },
    ],
  },
  {
    tone: "success",
    eyebrow: "Study Steno",
    title: "속기 공부",
    icon: BookOpen,
    items: [
      { label: "듣고치기", icon: Headphones },
      { label: "보고치기", href: "/study/bogochigi", icon: BookOpen },
      { label: "약어 연습", icon: Sparkles },
      { label: "학습 관리", icon: ListChecks },
    ],
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <section className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-3 text-center">
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

        <div className="mt-10 flex flex-col gap-5">
          {CATEGORIES.map((category) => (
            <CategoryBand key={category.eyebrow} category={category} />
          ))}
        </div>
      </section>
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════
// CategoryBand — 카테고리 하나를 가로로 꽉 채우는 색 밴드
// ═════════════════════════════════════════════════════════════════

const TONE_CLASSES: Record<
  Tone,
  {
    border: string;
    wash: string;
    iconBadge: string;
    text: string;
    pillLive: string;
    pillLiveHover: string;
  }
> = {
  accent: {
    border: "border-accent/30",
    wash: "bg-accent/[0.05]",
    iconBadge: "bg-accent/15 text-accent",
    text: "text-accent",
    pillLive: "bg-accent text-white",
    pillLiveHover: "hover:bg-accent-hover",
  },
  signal: {
    border: "border-signal/30",
    wash: "bg-signal/[0.05]",
    iconBadge: "bg-signal/15 text-signal",
    text: "text-signal",
    pillLive: "bg-signal text-white",
    pillLiveHover: "hover:brightness-110",
  },
  success: {
    border: "border-success/30",
    wash: "bg-success/[0.05]",
    iconBadge: "bg-success/15 text-success",
    text: "text-success",
    pillLive: "bg-success text-white",
    pillLiveHover: "hover:brightness-110",
  },
};

function CategoryBand({ category }: { category: Category }) {
  const t = TONE_CLASSES[category.tone];
  const Icon = category.icon;

  return (
    <div className={`rounded-2xl border p-6 sm:p-8 ${t.border} ${t.wash}`}>
      <div className="flex items-center gap-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${t.iconBadge}`}>
          <Icon size={24} />
        </span>
        <div>
          <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${t.text}`}>
            {category.eyebrow}
          </p>
          <p className="font-display text-2xl sm:text-3xl">{category.title}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {category.items.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`group inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition ${t.pillLive} ${t.pillLiveHover}`}
            >
              <item.icon size={18} />
              {item.label}
              <ArrowRight size={16} className="opacity-70 transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-5 py-3 text-base font-bold text-muted"
            >
              <item.icon size={18} />
              {item.label}
              <span className="text-xs font-normal">준비 중</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}
