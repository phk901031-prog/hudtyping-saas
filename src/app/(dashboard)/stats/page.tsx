// src/app/(dashboard)/stats/page.tsx
// 내 검색 통계 페이지 — 서버 컴포넌트(RSC)에서 직접 DB 집계.
//
// 표시 섹션:
//   1) 요약 카드 (총 검색 횟수 / 캐시 적중률 / 첫 검색일)
//   2) 최근 검색어 10건 (시간순)
//   3) 가장 많이 검색한 단어 top 10
//
// (dashboard) layout이 인증/승인을 보장하므로 여기서 따로 검사 안 함.
// 단, 본인 데이터만 보여줘야 하므로 user.clerkId로 WHERE 조건.

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getMyStats } from "@/features/search/service";
import { getOrCreateCurrentUser } from "@/features/users/service";

export default async function StatsPage() {
  // (dashboard) layout이 이미 검증했지만 user 객체 재사용 위해 다시 호출
  const user = await getOrCreateCurrentUser();
  if (!user) return null; // 도달 불가 (layout이 redirect)

  // 통계는 service에서 한 번에 가져옴 (요약 + 최근 + 인기 묶음)
  const { total, cacheHits, firstSearch, recent, popular } = await getMyStats(
    user.clerkId
  );
  const cacheHitRate = total > 0 ? (cacheHits / total) * 100 : 0;
  const summary = { firstSearch };

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-3xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← 대시보드
        </Link>
        <UserButton />
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">내 검색 통계</h1>
        <p className="text-sm text-zinc-500">
          웹 검색과 로컬 HUD에서 한 모든 검색이 합산돼요.
        </p>
      </div>

      {/* 요약 카드들 */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard label="총 검색 횟수" value={total.toLocaleString()} />
        <SummaryCard
          label="캐시 적중률"
          value={total > 0 ? `${cacheHitRate.toFixed(1)}%` : "—"}
          hint={total > 0 ? `${cacheHits.toLocaleString()}건 적중` : undefined}
        />
        <SummaryCard
          label="첫 검색일"
          value={
            summary?.firstSearch
              ? formatDateOnly(summary.firstSearch)
              : "—"
          }
        />
      </section>

      {/* 검색 기록이 없을 때 */}
      {total === 0 && (
        <p className="text-sm text-zinc-500 text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          아직 검색 기록이 없어요.{" "}
          <Link href="/search" className="underline">
            검색 페이지
          </Link>
          에서 단어를 찾아보거나, 로컬 HUD를 연결해보세요.
        </p>
      )}

      {/* 최근 검색어 */}
      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">최근 검색어</h2>
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {recent.map((row, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-medium">{row.query}</span>
                <span className="flex items-center gap-3 text-xs text-zinc-500">
                  <span
                    className={
                      row.cacheHit ? "text-green-600" : "text-amber-600"
                    }
                  >
                    {row.cacheHit ? "캐시 ✓" : "새로 조회"}
                  </span>
                  <span>{formatDateTime(row.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 인기 검색어 */}
      {popular.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">자주 찾은 단어 top {popular.length}</h2>
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {popular.map((row, i) => (
              <li
                key={i}
                className="flex items-center justify-between px-4 py-3 text-sm"
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

// ────────────────────────────────────────────────────────────────────
// 보조 컴포넌트 + 포맷 유틸
// ────────────────────────────────────────────────────────────────────

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </div>
  );
}

function formatDateTime(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateOnly(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
