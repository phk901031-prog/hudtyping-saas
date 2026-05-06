// src/app/(dashboard)/admin/stats/page.tsx
// 전체 통계 페이지 — RSC.

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getGlobalStats } from "@/features/admin/service";

export default async function AdminStatsPage() {
  const { userCounts, searchSummary, popular, daily } = await getGlobalStats();

  // 사용자 status 별 카운트 매핑
  const usersByStatus = Object.fromEntries(
    userCounts.map((row) => [row.status, row.cnt])
  ) as Record<string, number>;
  const totalUsers =
    (usersByStatus.pending ?? 0) +
    (usersByStatus.approved ?? 0) +
    (usersByStatus.rejected ?? 0);

  const cacheHitRate =
    searchSummary.total > 0
      ? (searchSummary.cacheHits / searchSummary.total) * 100
      : 0;

  // 일별 그래프 정규화 (최댓값 기준 비율)
  const maxDaily = Math.max(...daily.map((d) => d.cnt), 1);

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-4xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
          ← 관리자
        </Link>
        <UserButton />
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">전체 통계</h1>
        <p className="text-sm text-zinc-500">서비스 사용 현황 (실시간)</p>
      </div>

      {/* 사용자 요약 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">사용자</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard label="전체" value={totalUsers.toLocaleString()} />
          <SummaryCard
            label="승인 대기"
            value={(usersByStatus.pending ?? 0).toLocaleString()}
            tone="amber"
          />
          <SummaryCard
            label="승인됨"
            value={(usersByStatus.approved ?? 0).toLocaleString()}
            tone="green"
          />
          <SummaryCard
            label="거절됨"
            value={(usersByStatus.rejected ?? 0).toLocaleString()}
            tone="red"
          />
        </div>
      </section>

      {/* 검색 요약 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">검색</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryCard
            label="총 검색"
            value={searchSummary.total.toLocaleString()}
          />
          <SummaryCard
            label="캐시 적중률"
            value={
              searchSummary.total > 0 ? `${cacheHitRate.toFixed(1)}%` : "—"
            }
            hint={`${searchSummary.cacheHits.toLocaleString()}건 적중`}
          />
          <SummaryCard
            label="검색한 사용자"
            value={searchSummary.uniqueUsers.toLocaleString()}
          />
        </div>
      </section>

      {/* 일별 그래프 (최근 30일) */}
      {daily.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">일별 검색량 (최근 30일)</h2>
          <div className="border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-end gap-1 h-40">
            {daily.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col justify-end items-center gap-1 group min-w-0"
                title={`${d.day}: ${d.cnt}건`}
              >
                <div
                  className="w-full bg-foreground/80 hover:bg-foreground transition rounded-sm"
                  style={{
                    height: `${(d.cnt / maxDaily) * 100}%`,
                    minHeight: d.cnt > 0 ? "2px" : "0",
                  }}
                />
                <span className="text-[8px] text-zinc-500 truncate w-full text-center">
                  {d.day.slice(5)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 인기 검색어 */}
      {popular.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            인기 검색어 top {popular.length}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 divide-y sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4">
            {popular.map((row, i) => (
              <li
                key={row.query}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="flex items-center gap-3">
                  <span className="text-zinc-400 font-mono text-xs w-6">
                    #{i + 1}
                  </span>
                  <span className="font-medium">{row.query}</span>
                </span>
                <span className="text-xs text-zinc-500">
                  {row.cnt.toLocaleString()}회
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

// ─── 보조 컴포넌트 ───────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "amber" | "green" | "red";
}) {
  const toneClass =
    tone === "amber"
      ? "text-amber-600"
      : tone === "green"
        ? "text-green-600"
        : tone === "red"
          ? "text-red-600"
          : "";
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-2xl font-bold ${toneClass}`}>{value}</span>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </div>
  );
}
