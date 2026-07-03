import Link from "next/link";
import { notFound } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  getUserById,
  getUserSearchActivity,
  getUserSearchHistory,
} from "@/features/admin/users";
import type { UserStatus } from "@/infrastructure/db/schema";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: clerkId } = await params;
  const user = await getUserById(clerkId);
  if (!user) notFound();

  const [activity, history] = await Promise.all([
    getUserSearchActivity(clerkId),
    getUserSearchHistory(clerkId, 100),
  ]);

  const cacheHitRate =
    activity.total > 0 ? (activity.cacheHits / activity.total) * 100 : 0;
  const failureRate =
    activity.total > 0 ? (activity.failures / activity.total) * 100 : 0;
  const displayName = [user.lastName, user.firstName].filter(Boolean).join(" ");

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between">
        <Link href="/admin/users" className="text-sm text-zinc-500 hover:underline">
          ← 회원 관리
        </Link>
        <UserButton />
      </header>

      <section className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">{displayName || user.email}</h1>
            {displayName && <p className="mt-1 text-sm text-zinc-500">{user.email}</p>}
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            <StatusBadge status={user.status} />
            {user.role === "admin" && <span className="rounded bg-purple-100 px-2 py-1 font-bold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">admin</span>}
            <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
              한도 {user.role === "admin" ? "무제한" : `${user.monthlyLimit.toLocaleString()}회`}
            </span>
            <span className="rounded bg-zinc-100 px-2 py-1 dark:bg-zinc-900">
              가입 {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard label="총 검색" value={activity.total.toLocaleString()} />
        <SummaryCard
          label="실패율"
          value={activity.total > 0 ? `${failureRate.toFixed(1)}%` : "0%"}
          hint={`${activity.failures.toLocaleString()}건 실패`}
          tone={failureRate >= 5 ? "red" : failureRate > 0 ? "amber" : "green"}
        />
        <SummaryCard
          label="평균 응답"
          value={`${activity.avgResponseMs.toLocaleString()}ms`}
          hint={`5초 이상 ${activity.slowSearches.toLocaleString()}건`}
          tone={activity.avgResponseMs >= 3000 ? "red" : activity.avgResponseMs >= 1200 ? "amber" : "green"}
        />
        <SummaryCard
          label="최근 버전"
          value={`v${activity.lastAppVersion ?? "legacy/web"}`}
          hint={activity.lastSearch ? formatDateTime(activity.lastSearch) : undefined}
        />
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="캐시 적중률"
          value={activity.total > 0 ? `${cacheHitRate.toFixed(1)}%` : "0%"}
          hint={`${activity.cacheHits.toLocaleString()}건`}
        />
        <SummaryCard
          label="첫 검색"
          value={activity.firstSearch ? formatDate(activity.firstSearch) : "-"}
        />
        <SummaryCard
          label="최근 검색"
          value={activity.lastSearch ? formatDateTime(activity.lastSearch) : "-"}
        />
        <SummaryCard
          label="상태"
          value={user.status === "approved" ? "승인" : user.status === "pending" ? "대기" : "거절"}
        />
      </section>

      {activity.total === 0 && (
        <p className="rounded-xl border border-dashed border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800">
          이 사용자의 검색 기록이 없습니다.
        </p>
      )}

      {activity.popular.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            자주 찾은 단어 top {activity.popular.length}
          </h2>
          <ul className="grid grid-cols-1 gap-x-4 divide-y divide-zinc-200 rounded-xl border border-zinc-200 px-4 dark:divide-zinc-800 dark:border-zinc-800 sm:grid-cols-2 sm:divide-y-0">
            {activity.popular.map((row, i) => (
              <li key={row.query} className="flex items-center justify-between py-2 text-sm">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="w-6 shrink-0 font-mono text-xs text-zinc-400">#{i + 1}</span>
                  <span className="truncate font-medium">{row.query}</span>
                </span>
                <span className="shrink-0 text-xs text-zinc-500">
                  {row.cnt.toLocaleString()}회
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {history.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            최근 검색 기록 ({history.length}건
            {activity.total > history.length &&
              ` · 전체 ${activity.total.toLocaleString()}건 중`}
            )
          </h2>
          <ul className="flex flex-col divide-y divide-zinc-200 overflow-hidden rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {history.map((row, i) => (
              <li
                key={`${row.createdAt.toString()}-${i}`}
                className="grid gap-2 px-4 py-3 text-sm sm:grid-cols-[minmax(0,1fr)_auto]"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{row.query}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    v{row.appVersion ?? "legacy/web"} · {row.responseMs ? `${row.responseMs.toLocaleString()}ms` : "응답시간 없음"}
                  </p>
                </div>
                <span className="flex items-center gap-3 text-xs text-zinc-500 sm:justify-end">
                  <SearchStatus
                    status={row.status}
                    cacheHit={row.cacheHit}
                    errorCode={row.errorCode}
                  />
                  <span>{formatDateTime(row.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

function SummaryCard({
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
    <div className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className={`text-xl font-bold ${toneClass}`}>{value}</span>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </div>
  );
}

function SearchStatus({
  status,
  cacheHit,
  errorCode,
}: {
  status: string;
  cacheHit: boolean;
  errorCode: string | null;
}) {
  if (status === "success") {
    return (
      <span className={cacheHit ? "text-green-600" : "text-amber-600"}>
        {cacheHit ? "캐시" : "신규"}
      </span>
    );
  }

  return <span className="text-rose-600">{errorCode ?? "실패"}</span>;
}

function StatusBadge({ status }: { status: UserStatus }) {
  const colors: Record<UserStatus, string> = {
    pending:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
    approved:
      "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-300",
  };
  const labels: Record<UserStatus, string> = {
    pending: "대기",
    approved: "승인",
    rejected: "거절",
  };
  return (
    <span className={`rounded px-2 py-1 text-xs font-bold ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
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
