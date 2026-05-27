// src/app/(dashboard)/admin/users/[id]/page.tsx
// 사용자 상세 — 관리자가 "특정 사용자가 뭘 검색했는지" 본다.
//
// (dashboard) + admin layout이 admin 권한을 이미 검증.
// URL의 id는 clerkId.

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
  if (!user) {
    notFound();
  }

  // 검색 활동을 병렬로 가져옴
  const [activity, history] = await Promise.all([
    getUserSearchActivity(clerkId),
    getUserSearchHistory(clerkId, 100),
  ]);

  const cacheHitRate =
    activity.total > 0
      ? (activity.cacheHits / activity.total) * 100
      : 0;
  const displayName = [user.lastName, user.firstName]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-4xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <Link
          href="/admin/users"
          className="text-sm text-zinc-500 hover:underline"
        >
          ← 회원 관리
        </Link>
        <UserButton />
      </header>

      {/* 사용자 헤더 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">
          {displayName || user.email}
        </h1>
        {displayName && (
          <p className="text-sm text-zinc-500">{user.email}</p>
        )}
        <div className="flex gap-2 items-center flex-wrap text-xs text-zinc-500">
          <StatusBadge status={user.status} />
          {user.role === "admin" && (
            <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
              admin
            </span>
          )}
          <span>
            한도{" "}
            {user.role === "admin"
              ? "무제한"
              : `${user.monthlyLimit.toLocaleString()}회/월`}
          </span>
          <span>· 가입 {formatDate(user.createdAt)}</span>
        </div>
      </div>

      {/* 검색 활동 요약 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">검색 활동</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="총 검색"
            value={activity.total.toLocaleString()}
          />
          <SummaryCard
            label="캐시 적중률"
            value={activity.total > 0 ? `${cacheHitRate.toFixed(1)}%` : "—"}
            hint={`${activity.cacheHits.toLocaleString()}건`}
          />
          <SummaryCard
            label="첫 검색"
            value={
              activity.firstSearch ? formatDate(activity.firstSearch) : "—"
            }
          />
          <SummaryCard
            label="최근 검색"
            value={
              activity.lastSearch ? formatDateTime(activity.lastSearch) : "—"
            }
          />
        </div>
      </section>

      {/* 검색 기록이 0이면 빈 상태 */}
      {activity.total === 0 && (
        <p className="text-sm text-zinc-500 text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          이 사용자의 검색 기록이 없습니다.
        </p>
      )}

      {/* 인기 검색어 (이 사용자) */}
      {activity.popular.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            자주 찾은 단어 top {activity.popular.length}
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 divide-y sm:divide-y-0 divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4">
            {activity.popular.map((row, i) => (
              <li
                key={row.query}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className="text-zinc-400 font-mono text-xs w-6 shrink-0">
                    #{i + 1}
                  </span>
                  <span className="font-medium truncate">{row.query}</span>
                </span>
                <span className="text-xs text-zinc-500 shrink-0">
                  {row.cnt.toLocaleString()}회
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 최근 검색 기록 (시간순, 최대 100건) */}
      {history.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold">
            최근 검색 기록 ({history.length}건
            {activity.total > history.length &&
              ` · 전체 ${activity.total.toLocaleString()}건 중`}
            )
          </h2>
          <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
            {history.map((row, i) => (
              <li
                key={`${row.createdAt.toString()}-${i}`}
                className="flex items-center justify-between px-4 py-2 text-sm"
              >
                <span className="font-medium truncate">{row.query}</span>
                <span className="flex items-center gap-3 text-xs text-zinc-500 shrink-0">
                  <span
                    className={
                      row.cacheHit ? "text-green-600" : "text-amber-600"
                    }
                  >
                    {row.cacheHit ? "캐시" : "miss"}
                  </span>
                  <span>{formatDateTime(row.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
          {activity.total > history.length && (
            <p className="text-xs text-zinc-500 text-right">
              ※ 최근 {history.length}건만 표시. 페이지네이션은 추후 추가 예정.
            </p>
          )}
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
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-col gap-1">
      <span className="text-xs text-zinc-500">{label}</span>
      <span className="text-xl font-bold">{value}</span>
      {hint && <span className="text-xs text-zinc-400">{hint}</span>}
    </div>
  );
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
    <span className={`px-1.5 py-0.5 rounded text-[10px] ${colors[status]}`}>
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
