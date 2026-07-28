// src/components/admin/user-action-buttons.tsx
// 회원 1명 row의 승인/거절/권한변경 버튼들 — 클라이언트 컴포넌트.
//
// PATCH 요청 보내고 router.refresh()로 RSC 다시 렌더링 → 즉시 반영.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Status = "pending" | "approved" | "rejected";
type Role = "user" | "admin";

interface Props {
  clerkId: string;
  currentStatus: Status;
  currentRole: Role;
  currentMonthlyLimit: number;
  currentUnlimitedUntil: Date | null;
  currentUnlimitedPermanent: boolean;
  isSelf: boolean; // 본인이면 admin 해제 버튼 비활성화 (lock-out 방지)
}

export function UserActionButtons({
  clerkId,
  currentStatus,
  currentRole,
  currentMonthlyLimit,
  currentUnlimitedUntil,
  currentUnlimitedPermanent,
  isSelf,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unlimitedOpen, setUnlimitedOpen] = useState(false);

  async function patch(body: unknown) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/users/${encodeURIComponent(clerkId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `요청 실패 (${res.status})`);
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  const hasUnlimitedGrant =
    currentUnlimitedPermanent ||
    (currentUnlimitedUntil !== null &&
      currentUnlimitedUntil.getTime() > Date.now());

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex flex-wrap justify-end gap-1.5">
        {currentStatus !== "approved" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ status: "approved" })}
            className="text-xs px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
          >
            승인
          </button>
        )}
        {currentStatus !== "rejected" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ status: "rejected" })}
            className="text-xs px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
          >
            거절
          </button>
        )}
        {currentStatus === "rejected" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ status: "pending" })}
            className="text-xs px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
          >
            대기로 되돌림
          </button>
        )}
        {currentRole === "user" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (confirm("이 사용자를 관리자로 임명할까요?")) {
                patch({ role: "admin" });
              }
            }}
            className="text-xs px-3 py-1 rounded border border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 disabled:opacity-50 transition"
          >
            관리자로
          </button>
        ) : (
          <button
            type="button"
            disabled={busy || isSelf}
            title={isSelf ? "본인의 관리자 권한은 해제할 수 없어요" : ""}
            onClick={() => {
              if (confirm("관리자 권한을 해제할까요?")) {
                patch({ role: "user" });
              }
            }}
            className="text-xs px-3 py-1 rounded border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
          >
            관리자 해제
          </button>
        )}
        {/* 월 한도 조정 — admin은 어차피 무제한이므로 일반 사용자에게만 의미 */}
        {currentRole === "user" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              const input = prompt(
                `월 검색 한도 (현재 ${currentMonthlyLimit.toLocaleString()}회)`,
                String(currentMonthlyLimit)
              );
              if (input === null) return;
              const n = parseInt(input.trim(), 10);
              if (isNaN(n) || n < 0) {
                alert("0 이상의 정수를 입력해주세요.");
                return;
              }
              patch({ monthlyLimit: n });
            }}
            className="text-xs px-3 py-1 rounded border border-amber-300 text-amber-700 dark:border-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30 disabled:opacity-50 transition"
          >
            한도 조정
          </button>
        )}
        {/* 무제한 부여/변경 — admin 은 이미 무제한이므로 일반 사용자에게만 */}
        {currentRole === "user" && (
          <button
            type="button"
            disabled={busy}
            onClick={() => setUnlimitedOpen(true)}
            className={
              "text-xs px-3 py-1 rounded border transition disabled:opacity-50 " +
              (hasUnlimitedGrant
                ? "border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-950/60"
                : "border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30")
            }
          >
            {hasUnlimitedGrant ? "무제한 변경" : "무제한 부여"}
          </button>
        )}
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {unlimitedOpen && (
        <UnlimitedGrantDialog
          busy={busy}
          currentUntil={currentUnlimitedUntil}
          currentPermanent={currentUnlimitedPermanent}
          onClose={() => setUnlimitedOpen(false)}
          onSubmit={async (payload) => {
            await patch({ unlimited: payload });
            setUnlimitedOpen(false);
          }}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 무제한 부여 다이얼로그
// ─────────────────────────────────────────────────────────────
type GrantMode = "until" | "days" | "permanent";
type GrantPayload =
  | { mode: "until"; until: string }
  | { mode: "permanent" }
  | { mode: "clear" };

function UnlimitedGrantDialog({
  busy,
  currentUntil,
  currentPermanent,
  onClose,
  onSubmit,
}: {
  busy: boolean;
  currentUntil: Date | null;
  currentPermanent: boolean;
  onClose: () => void;
  onSubmit: (payload: GrantPayload) => Promise<void>;
}) {
  // 초깃값: 현재 상태를 반영
  const initialMode: GrantMode = currentPermanent
    ? "permanent"
    : currentUntil
      ? "until"
      : "until";
  const [mode, setMode] = useState<GrantMode>(initialMode);
  const [dateInput, setDateInput] = useState<string>(
    currentUntil ? toDateInputValue(currentUntil) : defaultUntilString(30)
  );
  const [daysInput, setDaysInput] = useState<string>("30");
  const [localError, setLocalError] = useState<string | null>(null);

  async function handleSave() {
    setLocalError(null);
    if (mode === "permanent") {
      await onSubmit({ mode: "permanent" });
      return;
    }
    if (mode === "until") {
      if (!dateInput) {
        setLocalError("만료 날짜를 골라주세요.");
        return;
      }
      // 사용자가 고른 날짜의 KST 23:59:59 를 UTC로 환산
      const iso = endOfKSTDayToUTCISO(dateInput);
      if (!iso) {
        setLocalError("날짜 형식이 잘못됐어요.");
        return;
      }
      await onSubmit({ mode: "until", until: iso });
      return;
    }
    // days
    const n = parseInt(daysInput.trim(), 10);
    if (isNaN(n) || n < 1 || n > 3650) {
      setLocalError("1~3650 사이의 일수를 입력해주세요.");
      return;
    }
    const now = new Date();
    const target = new Date(now.getTime() + n * 24 * 60 * 60 * 1000);
    // 그 날의 KST 23:59:59로 정렬
    const dateStr = toDateInputValue(target);
    const iso = endOfKSTDayToUTCISO(dateStr);
    if (!iso) {
      setLocalError("날짜 계산에 실패했어요.");
      return;
    }
    await onSubmit({ mode: "until", until: iso });
  }

  async function handleClear() {
    if (!confirm("무제한 부여를 해제할까요? 원래 월 한도로 돌아갑니다.")) return;
    await onSubmit({ mode: "clear" });
  }

  return (
    <>
      {/* 백드롭 */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* 다이얼로그 */}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
      >
        <h3 className="text-base font-bold">무제한 부여</h3>
        <p className="mt-1 text-xs text-zinc-500">
          이 사용자는 부여된 기간 동안 월 검색 한도를 무시합니다.
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {/* until */}
          <label className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <input
              type="radio"
              name="unlimited-mode"
              value="until"
              checked={mode === "until"}
              onChange={() => setMode("until")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold">특정 날짜까지</div>
              <p className="text-[11px] text-zinc-500">
                선택한 날의 자정(KST 23:59:59) 에 만료됩니다.
              </p>
              <input
                type="date"
                value={dateInput}
                min={todayDateInputValue()}
                onChange={(e) => setDateInput(e.target.value)}
                disabled={mode !== "until"}
                className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 disabled:opacity-40"
              />
            </div>
          </label>

          {/* days */}
          <label className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <input
              type="radio"
              name="unlimited-mode"
              value="days"
              checked={mode === "days"}
              onChange={() => setMode("days")}
              className="mt-1"
            />
            <div className="flex-1">
              <div className="text-sm font-semibold">며칠간</div>
              <p className="text-[11px] text-zinc-500">
                오늘부터 입력한 일수 뒤 자정에 만료됩니다.
              </p>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={3650}
                  value={daysInput}
                  onChange={(e) => setDaysInput(e.target.value)}
                  disabled={mode !== "days"}
                  className="w-20 rounded-md border border-zinc-300 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 disabled:opacity-40"
                />
                <span className="text-xs text-zinc-500">일</span>
              </div>
            </div>
          </label>

          {/* permanent */}
          <label className="flex items-start gap-2 rounded-lg border border-zinc-200 p-3 cursor-pointer hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900">
            <input
              type="radio"
              name="unlimited-mode"
              value="permanent"
              checked={mode === "permanent"}
              onChange={() => setMode("permanent")}
              className="mt-1"
            />
            <div>
              <div className="text-sm font-semibold">무제한 (기간 없음)</div>
              <p className="text-[11px] text-zinc-500">
                관리자가 해제하기 전까지 계속 무제한 검색.
              </p>
            </div>
          </label>
        </div>

        {localError && (
          <p className="mt-3 text-xs text-red-600">{localError}</p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {(currentPermanent || currentUntil) && (
            <button
              type="button"
              disabled={busy}
              onClick={handleClear}
              className="text-xs px-3 py-2 rounded-md border border-zinc-300 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
            >
              부여 해제
            </button>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="text-xs px-3 py-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
          >
            취소
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={handleSave}
            className="text-xs px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition"
          >
            {busy ? "저장 중…" : "저장"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// 날짜 유틸 — KST(+09:00) 기준 자정 만료 시각 계산
// ─────────────────────────────────────────────────────────────

/** KST 기준 오늘의 date input(YYYY-MM-DD) 값 */
function todayDateInputValue(): string {
  const now = new Date();
  return toDateInputValue(now);
}

/** Date → "YYYY-MM-DD" (KST 기준) */
function toDateInputValue(d: Date): string {
  const kst = new Date(d.getTime() + 9 * 60 * 60 * 1000);
  return kst.toISOString().slice(0, 10);
}

/** 기본값: 오늘부터 N일 뒤의 YYYY-MM-DD (KST) */
function defaultUntilString(days: number): string {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return toDateInputValue(d);
}

/**
 * "YYYY-MM-DD" 를 그 날의 KST 23:59:59 로 취급해 UTC ISO 문자열로 변환.
 * 예: "2026-08-31" → "2026-08-31T14:59:59.000Z" (KST 2026-08-31 23:59:59)
 */
function endOfKSTDayToUTCISO(yyyyMmDd: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(yyyyMmDd)) return null;
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  // KST 23:59:59 == UTC 14:59:59 (당일)
  const utc = new Date(Date.UTC(y, m - 1, d, 14, 59, 59, 0));
  if (Number.isNaN(utc.getTime())) return null;
  return utc.toISOString();
}
