import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { listUsersWithActivity } from "@/features/admin/users";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { UserActionButtons } from "@/components/admin/user-action-buttons";
import type { UserStatus } from "@/infrastructure/db/schema";

const FILTER_OPTIONS: Array<{ value: UserStatus | "all"; label: string }> = [
  { value: "all", label: "전체" },
  { value: "pending", label: "승인 대기" },
  { value: "approved", label: "승인됨" },
  { value: "rejected", label: "거절됨" },
];

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const me = await getOrCreateCurrentUser();
  if (!me) return null;

  const params = await searchParams;
  const filter =
    params.status && ["pending", "approved", "rejected"].includes(params.status)
      ? (params.status as UserStatus)
      : undefined;

  const users = await listUsersWithActivity({ status: filter });
  const totalMonthly = users.reduce((sum, user) => sum + user.monthlyCount, 0);
  const activeUsers = users.filter((user) => user.monthlyCount > 0).length;
  const pendingUsers = users.filter((user) => user.status === "pending").length;
  const limitRiskUsers = users.filter(
    (user) =>
      user.role !== "admin" &&
      user.monthlyLimit > 0 &&
      user.monthlyCount / user.monthlyLimit >= 0.8
  ).length;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/admin" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          관리자 홈
        </Link>
        <UserButton />
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-accent">사용자 운영</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              사용자 사용 현황
            </h1>
          </div>
          <Link
            href="/admin/stats"
            className="w-fit rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-900"
          >
            전체 통계 보기
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard label="표시 사용자" value={`${users.length.toLocaleString()}명`} />
          <MetricCard label="이번 달 검색" value={`${totalMonthly.toLocaleString()}건`} />
          <MetricCard label="이번 달 활성" value={`${activeUsers.toLocaleString()}명`} />
          <MetricCard
            label="확인 필요"
            value={`${(pendingUsers + limitRiskUsers).toLocaleString()}명`}
            hint={`승인 대기 ${pendingUsers} · 한도 80% 이상 ${limitRiskUsers}`}
            tone={pendingUsers + limitRiskUsers > 0 ? "amber" : undefined}
          />
        </div>
      </section>

      <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-800">
        {FILTER_OPTIONS.map((option) => {
          const active =
            (option.value === "all" && !filter) || option.value === filter;
          const href =
            option.value === "all"
              ? "/admin/users"
              : `/admin/users?status=${option.value}`;

          return (
            <Link
              key={option.value}
              href={href}
              className={
                "rounded-full px-3 py-1.5 text-sm font-medium transition " +
                (active
                  ? "bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900")
              }
            >
              {option.label}
            </Link>
          );
        })}
      </nav>

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-5 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800">
          조건에 맞는 사용자가 없습니다.
        </div>
      ) : (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-bold">이번 달 사용량 순위</h2>
            <span className="text-xs text-zinc-500">
              검색 수가 많은 사용자부터 표시됩니다.
            </span>
          </div>

          <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {users.map((user, index) => {
              const usageRate =
                user.role === "admin" || user.monthlyLimit <= 0
                  ? 0
                  : Math.min(100, (user.monthlyCount / user.monthlyLimit) * 100);
              const cacheRate =
                user.totalCount > 0
                  ? (user.cacheHitCount / user.totalCount) * 100
                  : 0;
              const isLimitRisk =
                user.role !== "admin" && user.monthlyLimit > 0 && usageRate >= 80;

              return (
                <li
                  key={user.clerkId}
                  className="grid gap-4 border-b border-zinc-100 px-4 py-4 last:border-b-0 dark:border-zinc-900 lg:grid-cols-[minmax(0,1fr)_220px_220px]"
                >
                  <div className="flex min-w-0 gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-sm font-bold text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/users/${encodeURIComponent(user.clerkId)}`}
                        className="group flex min-w-0 flex-col gap-1"
                      >
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="truncate text-base font-bold group-hover:underline">
                            {displayName(user)}
                          </span>
                          <StatusBadge status={user.status} />
                          {user.role === "admin" && <RoleBadge />}
                          <UnlimitedBadge
                            role={user.role}
                            unlimitedUntil={user.unlimitedUntil}
                            unlimitedPermanent={user.unlimitedPermanent}
                          />
                        </span>
                        <span className="truncate text-sm text-zinc-500">
                          {user.email}
                        </span>
                      </Link>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                        <span>전체 {user.totalCount.toLocaleString()}건</span>
                        <span>캐시 {cacheRate.toFixed(0)}%</span>
                        <span>실패 {user.failureCount.toLocaleString()}건</span>
                        <span>평균 {user.avgResponseMs.toLocaleString()}ms</span>
                        <span>버전 v{user.lastAppVersion ?? "legacy/web"}</span>
                        <span>가입 {formatDate(user.createdAt)}</span>
                      </div>

                      <p className="mt-2 truncate text-sm text-zinc-600 dark:text-zinc-400">
                        {user.lastSearchAt && user.lastQuery
                          ? `최근 검색: "${user.lastQuery}" · ${formatRelative(user.lastSearchAt)}`
                          : "아직 검색 기록이 없습니다."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center gap-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold">이번 달</span>
                      <span className={isLimitRisk ? "font-bold text-amber-700 dark:text-amber-300" : "font-bold"}>
                        {user.monthlyCount.toLocaleString()}
                        {user.role === "admin"
                          ? "건"
                          : ` / ${user.monthlyLimit.toLocaleString()}건`}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                      <div
                        className={
                          "h-full rounded-full " +
                          (isLimitRisk ? "bg-amber-500" : "bg-accent")
                        }
                        style={{ width: `${user.role === "admin" ? 100 : usageRate}%` }}
                      />
                    </div>
                    <span className="text-xs text-zinc-500">
                      {user.role === "admin"
                        ? "관리자는 한도 제외"
                        : `${usageRate.toFixed(0)}% 사용`}
                    </span>
                  </div>

                  <div className="flex items-center justify-start lg:justify-end">
                    <UserActionButtons
                      clerkId={user.clerkId}
                      currentStatus={user.status}
                      currentRole={user.role}
                      currentMonthlyLimit={user.monthlyLimit}
                      currentUnlimitedUntil={user.unlimitedUntil}
                      currentUnlimitedPermanent={user.unlimitedPermanent}
                      displayName={displayName(user)}
                      isSelf={user.clerkId === me.clerkId}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
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
  tone?: "amber";
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <p className={tone === "amber" ? "mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300" : "mt-1 text-2xl font-bold"}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-zinc-500">{hint}</p>}
    </div>
  );
}

function UnlimitedBadge({
  role,
  unlimitedUntil,
  unlimitedPermanent,
}: {
  role: "user" | "admin";
  unlimitedUntil: Date | null;
  unlimitedPermanent: boolean;
}) {
  // admin은 이미 무제한이라 배지 중복 필요 없음
  if (role === "admin") return null;

  if (unlimitedPermanent) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        무제한
      </span>
    );
  }
  if (unlimitedUntil && unlimitedUntil.getTime() > Date.now()) {
    return (
      <span
        className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
        title={`${unlimitedUntil.toLocaleString("ko-KR")} 만료`}
      >
        무제한 · {formatShortDate(unlimitedUntil)}까지
      </span>
    );
  }
  return null;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });
}

function StatusBadge({ status }: { status: UserStatus }) {
  const labels: Record<UserStatus, string> = {
    pending: "대기",
    approved: "승인",
    rejected: "거절",
  };
  const colors: Record<UserStatus, string> = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    rejected: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
  };

  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${colors[status]}`}>
      {labels[status]}
    </span>
  );
}

function RoleBadge() {
  return (
    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-bold text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
      관리자
    </span>
  );
}

function displayName(user: { firstName: string | null; lastName: string | null; email: string }) {
  const name = [user.lastName, user.firstName].filter(Boolean).join(" ").trim();
  return name || user.email;
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatRelative(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  const diffMs = Date.now() - date.getTime();
  const min = Math.floor(diffMs / 60_000);
  if (min < 1) return "방금 전";
  if (min < 60) return `${min}분 전`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;
  const day = Math.floor(hour / 24);
  if (day === 1) return "어제";
  if (day < 7) return `${day}일 전`;
  return formatDate(date);
}
