// src/app/(dashboard)/admin/users/page.tsx
// 회원 관리 페이지 — RSC.
// 상단에 status 필터(쿼리 스트링), 본문은 회원 row 목록 + 액션 버튼.

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { listUsers } from "@/features/admin/service";
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
  // admin layout에서 이미 검증했지만 안전장치
  if (!me) return null;

  const params = await searchParams;
  const filter =
    params.status && ["pending", "approved", "rejected"].includes(params.status)
      ? (params.status as UserStatus)
      : undefined;

  const users = await listUsers({ status: filter });

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-4xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <Link href="/admin" className="text-sm text-zinc-500 hover:underline">
          ← 관리자
        </Link>
        <UserButton />
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">회원 관리</h1>
        <p className="text-sm text-zinc-500">
          가입자 {users.length}명 표시 중 ({filter ?? "전체"})
        </p>
      </div>

      {/* 필터 탭 */}
      <nav className="flex gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        {FILTER_OPTIONS.map((opt) => {
          const active =
            (opt.value === "all" && !filter) || opt.value === filter;
          const href =
            opt.value === "all" ? "/admin/users" : `/admin/users?status=${opt.value}`;
          return (
            <Link
              key={opt.value}
              href={href}
              className={
                "text-sm px-3 py-1 rounded-full transition " +
                (active
                  ? "bg-foreground text-background"
                  : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900")
              }
            >
              {opt.label}
            </Link>
          );
        })}
      </nav>

      {/* 목록 */}
      {users.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
          해당하는 회원이 없어요.
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
          {users.map((u) => (
            <li
              key={u.clerkId}
              className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="font-medium truncate">{u.email}</span>
                <span className="text-xs text-zinc-500 flex gap-2 items-center flex-wrap">
                  <StatusBadge status={u.status} />
                  <RoleBadge role={u.role} />
                  <span>
                    · 한도{" "}
                    {u.role === "admin"
                      ? "무제한"
                      : `${u.monthlyLimit.toLocaleString()}회/월`}
                  </span>
                  <span>· 가입 {formatDate(u.createdAt)}</span>
                </span>
              </div>
              <UserActionButtons
                clerkId={u.clerkId}
                currentStatus={u.status}
                currentRole={u.role}
                currentMonthlyLimit={u.monthlyLimit}
                isSelf={u.clerkId === me.clerkId}
              />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const colors: Record<UserStatus, string> = {
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
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

function RoleBadge({ role }: { role: "user" | "admin" }) {
  if (role === "admin") {
    return (
      <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
        admin
      </span>
    );
  }
  return null;
}

function formatDate(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
