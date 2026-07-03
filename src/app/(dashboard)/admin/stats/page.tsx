import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getGlobalStats } from "@/features/admin/stats";

export default async function AdminStatsPage() {
  const {
    userCounts,
    searchSummary,
    popular,
    daily,
    hourly,
    versionSummary,
    dictionarySummary,
    recentSearches,
  } = await getGlobalStats();

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
  const failureRate =
    searchSummary.total > 0
      ? (searchSummary.failures / searchSummary.total) * 100
      : 0;
  const maxDaily = Math.max(...daily.map((d) => d.cnt), 1);
  const topTen = popular.slice(0, 10);
  const remainingPopular = popular.slice(10);

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          관리자 홈
        </Link>
        <UserButton />
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">서비스 통계</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              검색 안정성 대시보드
            </h1>
          </div>
          <Link
            href="/admin/users"
            className="w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            사용자 사용 현황
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="총 검색 시도" value={`${searchSummary.total.toLocaleString()}건`} />
          <MetricCard
            label="검색 사용자"
            value={`${searchSummary.uniqueUsers.toLocaleString()}명`}
            hint={`전체 가입자 ${totalUsers.toLocaleString()}명`}
          />
          <MetricCard
            label="실패율"
            value={searchSummary.total > 0 ? `${failureRate.toFixed(1)}%` : "0%"}
            hint={`${searchSummary.failures.toLocaleString()}건 실패`}
            tone={failureRate >= 5 ? "red" : failureRate > 0 ? "amber" : "green"}
          />
          <MetricCard
            label="평균 응답"
            value={`${searchSummary.avgResponseMs.toLocaleString()}ms`}
            hint={`5초 이상 ${searchSummary.slowSearches.toLocaleString()}건`}
            tone={searchSummary.avgResponseMs >= 3000 ? "red" : searchSummary.avgResponseMs >= 1200 ? "amber" : "green"}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="캐시 적중률"
            value={searchSummary.total > 0 ? `${cacheHitRate.toFixed(1)}%` : "0%"}
            hint={`${searchSummary.cacheHits.toLocaleString()}건 즉시 응답`}
            tone={cacheHitRate >= 60 ? "green" : "amber"}
          />
          <MetricCard
            label="사전 캐시"
            value={`${dictionarySummary.total.toLocaleString()}개`}
            hint={`누적 사용 ${dictionarySummary.totalHits.toLocaleString()}회`}
          />
          <MetricCard
            label="성공 검색"
            value={`${searchSummary.success.toLocaleString()}건`}
          />
          <MetricCard
            label="느린 검색"
            value={`${searchSummary.slowSearches.toLocaleString()}건`}
            hint="응답 5초 이상"
            tone={searchSummary.slowSearches > 0 ? "amber" : "green"}
          />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.8fr)]">
        <Panel title="최근 30일 검색량" caption="일자별 검색 시도와 실패 건수">
          <DailyChart daily={daily} maxDaily={maxDaily} />
        </Panel>

        <Panel title="최근 검색" caption="상태, 응답시간, 앱 버전까지 확인">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {recentSearches.length === 0 ? (
              <li className="py-8 text-center text-sm text-zinc-500">
                아직 검색 기록이 없습니다.
              </li>
            ) : (
              recentSearches.map((row, index) => (
                <li
                  key={`${row.clerkId}-${row.createdAt.toISOString()}-${index}`}
                  className="flex items-center justify-between gap-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{row.query}</p>
                    <p className="truncate text-xs text-zinc-500">
                      {shortUserId(row.clerkId)} · v{row.appVersion ?? "legacy/web"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <StatusPill
                      ok={row.status === "success"}
                      label={
                        row.status === "success"
                          ? row.cacheHit
                            ? "캐시"
                            : "신규"
                          : row.errorCode ?? "실패"
                      }
                    />
                    <span className="text-xs text-zinc-500">
                      {row.responseMs ? `${row.responseMs.toLocaleString()}ms · ` : ""}
                      {formatTime(row.createdAt)}
                    </span>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <Panel title="시간대 분포" caption="최근 30일 · 한국 시간 · 4시간 단위">
          <HourlyChart hourly={hourly} />
        </Panel>

        <Panel title="앱 버전별 사용" caption="최근 30일 기준">
          <VersionTable rows={versionSummary} />
        </Panel>
      </section>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Panel title="인기 검색어 TOP 10" caption="성공 검색 기준">
          {topTen.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">
              아직 검색어 데이터가 없습니다.
            </p>
          ) : (
            <PopularList rows={topTen} start={1} />
          )}
        </Panel>

        {remainingPopular.length > 0 && (
          <Panel title="인기 검색어 TOP 50" caption="11위부터 50위까지">
            <PopularList rows={remainingPopular} start={11} compact />
          </Panel>
        )}
      </section>
    </main>
  );
}

function Panel({
  title,
  caption,
  children,
}: {
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mb-4 flex flex-col gap-1">
        <h2 className="text-base font-bold">{title}</h2>
        <p className="text-xs text-zinc-500">{caption}</p>
      </div>
      {children}
    </section>
  );
}

function DailyChart({
  daily,
  maxDaily,
}: {
  daily: Array<{ day: string; cnt: number; failures: number }>;
  maxDaily: number;
}) {
  const today = new Date();
  const days: Array<{ day: string; cnt: number; failures: number }> = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() - i);
    const day = date.toISOString().slice(0, 10);
    const found = daily.find((row) => row.day === day);
    days.push({
      day,
      cnt: found?.cnt ?? 0,
      failures: found?.failures ?? 0,
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex h-48 items-end gap-1">
        {days.map((day) => {
          const failureHeight =
            day.cnt > 0 ? Math.max((day.failures / day.cnt) * 100, day.failures > 0 ? 8 : 0) : 0;
          return (
            <div
              key={day.day}
              className="flex h-full min-w-0 flex-1 items-end"
              title={`${day.day}: ${day.cnt.toLocaleString()}건 / 실패 ${day.failures.toLocaleString()}건`}
            >
              <div
                className="relative w-full overflow-hidden rounded-t bg-accent/80 transition-colors hover:bg-accent"
                style={{
                  height: maxDaily > 0 ? `${(day.cnt / maxDaily) * 100}%` : "0%",
                  minHeight: day.cnt > 0 ? "4px" : "0",
                }}
              >
                {day.failures > 0 && (
                  <span
                    className="absolute inset-x-0 bottom-0 bg-rose-500"
                    style={{ height: `${failureHeight}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-6 gap-2 text-[11px] text-zinc-500">
        {days.filter((_, index) => index % 5 === 0).map((day) => (
          <span key={day.day} className="truncate text-center">
            {day.day.slice(5)}
          </span>
        ))}
      </div>
    </div>
  );
}

function HourlyChart({
  hourly,
}: {
  hourly: Array<{ slot: number; cnt: number }>;
}) {
  const labels = ["0-4시", "4-8시", "8-12시", "12-16시", "16-20시", "20-24시"];
  const slots = labels.map((_, index) => ({
    slot: index,
    cnt: hourly.find((row) => row.slot === index)?.cnt ?? 0,
  }));
  const max = Math.max(...slots.map((slot) => slot.cnt), 1);

  return (
    <div className="grid gap-3">
      {slots.map((slot, index) => (
        <div
          key={slot.slot}
          className="grid grid-cols-[64px_minmax(0,1fr)_56px] items-center gap-3 text-sm"
        >
          <span className="text-xs font-medium text-zinc-500">{labels[index]}</span>
          <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
            <div
              className="h-full rounded-full bg-accent"
              style={{
                width: `${(slot.cnt / max) * 100}%`,
                minWidth: slot.cnt > 0 ? "6px" : "0",
              }}
            />
          </div>
          <span className="text-right text-xs font-bold">
            {slot.cnt.toLocaleString()}건
          </span>
        </div>
      ))}
    </div>
  );
}

function VersionTable({
  rows,
}: {
  rows: Array<{
    appVersion: string;
    cnt: number;
    failures: number;
    avgResponseMs: number;
  }>;
}) {
  if (rows.length === 0) {
    return <p className="py-8 text-center text-sm text-zinc-500">버전 데이터가 없습니다.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-100 dark:divide-zinc-900">
      {rows.map((row) => {
        const failureRate = row.cnt > 0 ? (row.failures / row.cnt) * 100 : 0;
        return (
          <li key={row.appVersion} className="grid grid-cols-[1fr_auto] gap-3 py-3">
            <div>
              <p className="text-sm font-bold">v{row.appVersion}</p>
              <p className="text-xs text-zinc-500">
                실패율 {failureRate.toFixed(1)}% · 평균 {row.avgResponseMs.toLocaleString()}ms
              </p>
            </div>
            <span className="text-sm font-bold">{row.cnt.toLocaleString()}건</span>
          </li>
        );
      })}
    </ul>
  );
}

function PopularList({
  rows,
  start,
  compact,
}: {
  rows: Array<{ query: string; cnt: number }>;
  start: number;
  compact?: boolean;
}) {
  return (
    <ol className={compact ? "grid gap-x-5 sm:grid-cols-2" : "grid gap-2 sm:grid-cols-2"}>
      {rows.map((row, index) => (
        <li
          key={row.query}
          className={
            compact
              ? "flex items-center justify-between gap-3 border-b border-zinc-100 py-2 text-sm dark:border-zinc-900"
              : "flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-3 py-2 dark:border-zinc-900"
          }
        >
          <span className="flex min-w-0 items-center gap-2">
            <span className="w-7 shrink-0 font-mono text-xs text-zinc-400">
              {start + index}
            </span>
            <span className="truncate font-medium">{row.query}</span>
          </span>
          <span className="shrink-0 text-xs text-zinc-500">
            {row.cnt.toLocaleString()}건
          </span>
        </li>
      ))}
    </ol>
  );
}

function MetricCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "green" | "amber" | "red";
}) {
  const toneClass =
    tone === "green"
      ? "text-emerald-700 dark:text-emerald-300"
      : tone === "amber"
        ? "text-amber-700 dark:text-amber-300"
        : tone === "red"
          ? "text-rose-700 dark:text-rose-300"
          : "";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${toneClass}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function StatusPill({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span
      className={
        ok
          ? "rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
          : "rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
      }
    >
      {label}
    </span>
  );
}

function shortUserId(clerkId: string) {
  return clerkId.length > 16
    ? `${clerkId.slice(0, 10)}...${clerkId.slice(-4)}`
    : clerkId;
}

function formatTime(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
