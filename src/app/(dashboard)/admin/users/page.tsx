// src/app/(dashboard)/admin/users/page.tsx
// 회원 관리 페이지 — RSC.
// 상단에 status 필터(쿼리 스트링), 본문은 회원 row 목록 + 액션 버튼.

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
  // admin layout에서 이미 검증했지만 안전장치
  if (!me) return null;

  const params = await searchParams;
  const filter =
    params.status && ["pending", "approved", "rejected"].includes(params.status)
      ? (params.status as UserStatus)
      : undefined;

  const users = await listUsersWithActivity({ status: filter });

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
              {/* 이름/이메일 영역을 Link로 — 클릭하면 상세 페이지 (검색 기록 포함) */}
              <Link
                href={`/admin/users/${encodeURIComponent(u.clerkId)}`}
                className="flex flex-col gap-0.5 min-w-0 flex-1 hover:opacity-70 transition"
              >
                <span className="font-medium flex items-baseline gap-2 flex-wrap">
                  {/* 성명 우선 표시. 없으면 이메일만. */}
                  {(u.lastName || u.firstName) && (
                    <span className="truncate">
                      {[u.lastName, u.firstName].filter(Boolean).join(" ")}
                    </span>
                  )}
                  <span className="text-xs text-zinc-500 truncate">{u.email}</span>
                  <span className="text-xs text-accent">상세 →</span>
                </span>
                <span className="text-xs text-zinc-500 flex gap-2 items-center flex-wrap">
                  <StatusBadge status={u.status} />
                  <RoleBadge role={u.role} />
                  <span>
                    · 이번달{" "}
                    <span
                      className={
                        u.role !== "admin" &&
                        u.monthlyCount >= u.monthlyLimit * 0.8
                          ? "text-amber-600 font-medium"
                          : "text-zinc-700 dark:text-zinc-300 font-medium"
                      }
                    >
                      {u.monthlyCount.toLocaleString()}
                    </span>
                    {u.role === "admin"
                      ? "회"
                      : ` / ${u.monthlyLimit.toLocaleString()}회`}
                  </span>
                  <span>· 가입 {formatDate(u.createdAt)}</span>
                </span>
                {/* 마지막 검색 — 한 줄 인라인 미리보기 */}
                <span className="text-xs text-zinc-500 flex gap-1.5 items-center min-w-0">
                  {u.lastSearchAt && u.lastQuery ? (
                    <>
                      <span className="shrink-0">최근:</span>
                      <span className="font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        &ldquo;{u.lastQuery}&rdquo;
                      </span>
                      <span className="shrink-0 text-zinc-400">
                        · {formatRelative(u.lastSearchAt)}
                      </span>
                    </>
                  ) : (
                    <span className="text-zinc-400">아직 검색 없음</span>
                  )}
                </span>
              </Link>
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

/** "방금 전" / "5분 전" / "3시간 전" / "어제" / "2026.05.20" */
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
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
