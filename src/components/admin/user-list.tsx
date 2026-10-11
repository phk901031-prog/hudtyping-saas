// src/components/admin/user-list.tsx
// 회원 목록 + 체크박스 일괄 선택 — /admin/users 메인 리스트.
//
// 서버(page.tsx)가 UserWithActivity[]를 미리 조회해 넘기면, 이 클라이언트
// 컴포넌트가 체크박스 선택 상태 + 일괄 한도 적용 툴바를 담당한다.
// 개별 행 액션(승인/거절/한도조정/무제한 등)은 기존 UserActionButtons 그대로.

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserActionButtons } from "@/components/admin/user-action-buttons";
import type { UserWithActivity } from "@/features/admin/users";
import type { UserStatus } from "@/infrastructure/db/schema";

export function UserList({
  users,
  meClerkId,
}: {
  users: UserWithActivity[];
  meClerkId: string;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkInput, setBulkInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // admin은 한도 체크 자체가 스킵이라 일괄 적용 대상에서 제외 — 선택해도 의미 없음.
  const selectable = users.filter((u) => u.role !== "admin");
  const allSelected =
    selectable.length > 0 && selectable.every((u) => selected.has(u.clerkId));

  function toggleOne(clerkId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(clerkId)) next.delete(clerkId);
      else next.add(clerkId);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) =>
      allSelected ? new Set() : new Set(selectable.map((u) => u.clerkId))
    );
  }

  async function applyBulk(monthlyLimit: number | null) {
    if (selected.size === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkIds: [...selected], monthlyLimit }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `요청 실패 (${res.status})`);
      }
      setSelected(new Set());
      setBulkInput("");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  function handleApplyClick() {
    const n = Number.parseInt(bulkInput.trim(), 10);
    if (!Number.isInteger(n) || n < 0) {
      setError("0 이상의 정수를 입력해주세요.");
      return;
    }
    applyBulk(n);
  }

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold">이번 달 사용량 순위</h2>
        <span className="text-xs text-zinc-500">
          검색 수가 많은 사용자부터 표시됩니다.
        </span>
      </div>

      {/* 일괄 선택 툴바 */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleAll}
            disabled={selectable.length === 0}
          />
          전체 선택
        </label>
        <span className="text-zinc-500">
          {selected.size > 0 ? `${selected.size}명 선택됨` : "체크박스로 사용자를 골라 한도를 한 번에 조정할 수 있어요."}
        </span>

        {selected.size > 0 && (
          <div className="flex flex-1 flex-wrap items-center gap-2">
            <input
              type="number"
              min={0}
              placeholder="새 월 한도"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              disabled={busy}
              className="w-28 rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
            <button
              type="button"
              disabled={busy || bulkInput.trim() === ""}
              onClick={handleApplyClick}
              className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-950"
            >
              선택한 {selected.size}명에게 적용
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (confirm(`선택한 ${selected.size}명의 개별 한도를 해제하고 전역 기본값을 따르게 할까요?`)) {
                  applyBulk(null);
                }
              }}
              className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-semibold text-zinc-700 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300"
            >
              선택한 {selected.size}명 기본값으로
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setSelected(new Set())}
              className="text-xs text-zinc-500 underline disabled:opacity-50"
            >
              선택 해제
            </button>
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}

      {users.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-5 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800">
          조건에 맞는 사용자가 없습니다.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
          {users.map((user, index) => {
            const usageRate =
              user.role === "admin" || user.monthlyLimit <= 0
                ? 0
                : Math.min(100, (user.monthlyCount / user.monthlyLimit) * 100);
            const cacheRate =
              user.totalCount > 0 ? (user.cacheHitCount / user.totalCount) * 100 : 0;
            const isLimitRisk =
              user.role !== "admin" && user.monthlyLimit > 0 && usageRate >= 80;

            return (
              <li
                key={user.clerkId}
                className="grid gap-4 border-b border-zinc-100 px-4 py-4 last:border-b-0 dark:border-zinc-900 lg:grid-cols-[auto_minmax(0,1fr)_220px_220px]"
              >
                <div className="flex items-start pt-1.5">
                  <input
                    type="checkbox"
                    checked={selected.has(user.clerkId)}
                    onChange={() => toggleOne(user.clerkId)}
                    disabled={user.role === "admin"}
                    title={user.role === "admin" ? "관리자는 한도 체크 대상이 아니에요" : undefined}
                  />
                </div>

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
                          unlimitedActive={user.unlimitedActive}
                        />
                      </span>
                      <span className="truncate text-sm text-zinc-500">{user.email}</span>
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
                    <span
                      className={isLimitRisk ? "font-bold text-amber-700 dark:text-amber-300" : "font-bold"}
                      title={user.role !== "admin" && user.monthlyLimitIsCustom ? "개별 설정된 한도 (전역 기본값과 다름)" : undefined}
                    >
                      {user.monthlyCount.toLocaleString()}
                      {user.role === "admin"
                        ? "건"
                        : ` / ${user.monthlyLimit.toLocaleString()}건${user.monthlyLimitIsCustom ? "*" : ""}`}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
                    <div
                      className={"h-full rounded-full " + (isLimitRisk ? "bg-amber-500" : "bg-accent")}
                      style={{ width: `${user.role === "admin" ? 100 : usageRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-zinc-500">
                    {user.role === "admin" ? "관리자는 한도 제외" : `${usageRate.toFixed(0)}% 사용`}
                  </span>
                </div>

                <div className="flex items-center justify-start lg:justify-end">
                  <UserActionButtons
                    clerkId={user.clerkId}
                    currentStatus={user.status}
                    currentRole={user.role}
                    currentMonthlyLimit={user.monthlyLimit}
                    currentMonthlyLimitIsCustom={user.monthlyLimitIsCustom}
                    currentUnlimitedUntil={user.unlimitedUntil}
                    currentUnlimitedPermanent={user.unlimitedPermanent}
                    currentUnlimitedActive={user.unlimitedActive}
                    displayName={displayName(user)}
                    isSelf={user.clerkId === meClerkId}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function UnlimitedBadge({
  role,
  unlimitedUntil,
  unlimitedPermanent,
  unlimitedActive,
}: {
  role: "user" | "admin";
  unlimitedUntil: Date | null;
  unlimitedPermanent: boolean;
  unlimitedActive: boolean;
}) {
  if (role === "admin") return null;

  if (unlimitedPermanent) {
    return (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
        무제한
      </span>
    );
  }
  if (unlimitedActive && unlimitedUntil) {
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
  return d.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
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
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
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
