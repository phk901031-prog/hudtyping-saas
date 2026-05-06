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
  isSelf: boolean; // 본인이면 admin 해제 버튼 비활성화 (lock-out 방지)
}

export function UserActionButtons({
  clerkId,
  currentStatus,
  currentRole,
  isSelf,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function patch(body: { status?: Status; role?: Role }) {
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

  return (
    <div className="flex flex-col gap-1 items-end">
      <div className="flex gap-1.5">
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
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
