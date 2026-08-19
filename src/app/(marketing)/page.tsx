// src/app/(marketing)/page.tsx
// PlaySteno 포털 홈 — 3-카테고리(Work/Play/Study)를 색으로 구분한 가로 밴드로 배치.
// 아이콘은 제네릭 UI 아이콘 대신 로고에 쓰던 키캡 모티프(.keycap, globals.css)를
// 재사용하고, 각 밴드에 실시간 타이핑 느낌의 모노스페이스 미리보기 줄을 넣어
// "타자와 관련된 사이트"라는 게 시각적으로 바로 느껴지게 한다.
// 세 카테고리는 서로 다른 사람을 위한 것이다 — 낱말지기는 현직 속기사 실무 도구,
// Study는 시험 준비생, Play는 누구나 가볍게. 하나로 뭉뚱그려 말하지 않는다.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";

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
}

interface Category {
  tone: Tone;
  eyebrow: string;
  keycapLetter: string;
  title: string;
  audience: string; // 이 카테고리는 누구를 위한 것인지 — 뭉뚱그리지 않고 명확하게
  preview: string; // 모노스페이스 타이핑 미리보기 문구
  items: CategoryItem[];
}

const CATEGORIES: Category[] = [
  {
    tone: "accent",
    eyebrow: "Work Steno",
    keycapLetter: "W",
    title: "속기 실무 도구",
    audience: "현직 속기사가 실무에서 매일 쓰는 도구",
    preview: "우리말샘 검색 중",
    items: [
      { label: "낱말지기", href: "/work/natmalgi" },
      { label: "AI 속기 툴" },
    ],
  },
  {
    tone: "signal",
    eyebrow: "Play Steno",
    keycapLetter: "P",
    title: "속기 타자 게임",
    audience: "쉬는 시간에 가볍게, 타자 실력을 겨루는 놀이",
    preview: "189타 · 정확도 98%",
    items: [
      { label: "단문 타자전", href: "/play/typing" },
      { label: "장문 타자전", href: "/play/typing" },
      { label: "산성비" },
    ],
  },
  {
    tone: "success",
    eyebrow: "Study Steno",
    keycapLetter: "S",
    title: "속기 공부",
    audience: "자격증을 준비하는 이들의 연습장",
    preview: "오늘 5,320자 연습",
    items: [
      { label: "듣고치기" },
      { label: "보고치기", href: "/study/bogochigi" },
      { label: "약어 연습" },
      { label: "학습 관리" },
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
            현직 속기사의 실무 도구부터 시험 준비생의 연습장, 가볍게 즐기는 타자
            게임까지 — 서로 다른 목적을 위한 세 공간입니다.
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
    text: string;
    keycapColorVar: string;
    pillLive: string;
    pillLiveHover: string;
  }
> = {
  accent: {
    border: "border-accent/30",
    wash: "bg-accent/[0.05]",
    text: "text-accent",
    keycapColorVar: "var(--accent)",
    pillLive: "bg-accent text-white",
    pillLiveHover: "hover:bg-accent-hover",
  },
  signal: {
    border: "border-signal/30",
    wash: "bg-signal/[0.05]",
    text: "text-signal",
    keycapColorVar: "var(--signal)",
    pillLive: "bg-signal text-white",
    pillLiveHover: "hover:brightness-110",
  },
  success: {
    border: "border-success/30",
    wash: "bg-success/[0.05]",
    text: "text-success",
    keycapColorVar: "var(--success)",
    pillLive: "bg-success text-white",
    pillLiveHover: "hover:brightness-110",
  },
};

function CategoryBand({ category }: { category: Category }) {
  const t = TONE_CLASSES[category.tone];

  return (
    <div className={`group rounded-2xl border p-6 sm:p-8 ${t.border} ${t.wash}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span
            className="keycap h-14 w-14 shrink-0 text-2xl"
            style={{ color: t.keycapColorVar }}
          >
            {category.keycapLetter}
          </span>
          <div>
            <p className={`text-[11px] font-bold uppercase tracking-[0.18em] ${t.text}`}>
              {category.eyebrow}
            </p>
            <p className="font-display text-2xl sm:text-3xl">{category.title}</p>
            <p className="ko-copy mt-1 text-sm text-muted">{category.audience}</p>
          </div>
        </div>

        <p className="font-mono text-xs text-muted sm:text-sm">
          {category.preview}
          <span className="typing-caret">▌</span>
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {category.items.map((item) =>
          item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-base font-bold transition ${t.pillLive} ${t.pillLiveHover}`}
            >
              {item.label}
              <ArrowRight size={16} className="opacity-70 transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-5 py-3 text-base font-bold text-muted"
            >
              {item.label}
              <span className="text-xs font-normal">준비 중</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}
