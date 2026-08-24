// src/app/trends/page.tsx
// 공개 인기 검색어 페이지. 로그인 없이 누구나 볼 수 있음.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, TrendingUp } from "lucide-react";
import { fetchTrendWindows } from "@/features/trends/service";

export const metadata: Metadata = {
  title: "인기 검색어 — 낱말지기",
  description: "낱말지기 사용자들이 이번 주·이번 달 자주 찾은 우리말샘 검색어 top 30.",
  alternates: { canonical: "/trends" },
};

// 캐시 30분 — 검색 로그가 실시간까지 필요는 없음. 로그인 없이 볼 수 있는 공개
// 페이지라 캐시가 특히 중요하다 — revalidate 없이 매번 DB를 조회하면 누가 이
// 페이지를 반복 새로고침하는 것만으로 컴퓨트 비용이 쌓인다(2026-08-26 Neon
// 한도 초과 사고 이후 재확인된 원칙). 정적 생성 + 30분 재검증으로, 그 시간
// 안에는 몇 번을 접속해도 DB를 안 건드리고 캐시된 페이지만 서빙한다.
export const revalidate = 1800;

export default async function TrendsPage() {
  const { weekly, monthly } = await fetchTrendWindows();

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          메인으로
        </Link>

        <header className="mt-6 flex flex-col gap-3">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.18em] text-accent">
            <TrendingUp size={12} strokeWidth={2.4} />
            Trends
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            인기 검색어
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted">
            낱말지기 사용자들이 자주 찾은 우리말샘 단어 top 30. 사전에 실제
            뜻이 있는 단어만 집계하고, 사용자 개인 정보는 노출하지 않습니다.
          </p>
        </header>

        <section className="mt-12 grid gap-8 lg:grid-cols-2">
          <TrendColumn
            title="이번 주 top 30"
            subtitle={weekly.label}
            rows={weekly.rows}
          />
          <TrendColumn
            title="이번 달 top 30"
            subtitle={monthly.label}
            rows={monthly.rows}
          />
        </section>
      </div>
    </main>
  );
}

function TrendColumn({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: Array<{ query: string; count: number }>;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-5 flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl">{title}</h2>
        <span className="font-mono text-xs text-muted">{subtitle}</span>
      </div>

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          아직 집계할 검색 기록이 부족합니다.
        </p>
      ) : (
        <ol className="flex flex-col divide-y divide-border">
          {rows.map((row, i) => (
            <li
              key={row.query}
              className="flex items-baseline gap-3 py-2.5 text-sm"
            >
              <span className="w-6 shrink-0 font-mono text-xs font-bold text-muted">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {row.query}
              </span>
              <span className="shrink-0 font-mono text-xs text-muted">
                {row.count.toLocaleString()}회
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
