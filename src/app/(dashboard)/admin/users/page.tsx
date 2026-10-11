import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { listUsersWithActivity } from "@/features/admin/users";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { UserList } from "@/components/admin/user-list";
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

      <UserList users={users} meClerkId={me.clerkId} />
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
