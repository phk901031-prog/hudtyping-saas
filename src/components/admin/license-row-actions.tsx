// src/components/admin/license-row-actions.tsx
// 라이선스 1건의 회수/회수해제 버튼 + 활성화 목록 펼쳐보기 — 클라이언트 컴포넌트.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Activation {
  id: number;
  fingerprint: string;
  deviceName: string | null;
  activatedAt: string;
  lastSeenAt: string | null;
  deactivatedAt: string | null;
}

export function LicenseRowActions({
  licenseKey,
  revoked,
}: {
  licenseKey: string;
  revoked: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activations, setActivations] = useState<Activation[] | null>(null);

  async function toggleRevoke() {
    const confirmMsg = revoked ? "이 라이선스 회수를 해제할까요?" : "이 라이선스를 회수할까요?";
    if (!confirm(confirmMsg)) return;

    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseKey)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ revoked: !revoked }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `요청 실패 (${res.status})`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActivations() {
    if (activations !== null) {
      setActivations(null);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/licenses/${encodeURIComponent(licenseKey)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `요청 실패 (${res.status})`);
      setActivations(data.activations);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  async function forceDeactivate(id: number) {
    if (!confirm("이 기기의 활성화 슬롯을 강제로 해제할까요?")) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/licenses/activations/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `요청 실패 (${res.status})`);
      }
      setActivations(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex gap-1.5">
        <button
          type="button"
          disabled={busy}
          onClick={toggleActivations}
          className="text-xs px-3 py-1 rounded border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:hover:bg-zinc-900"
        >
          {activations !== null ? "닫기" : "활성화 목록"}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={toggleRevoke}
          className={
            "text-xs px-3 py-1 rounded border disabled:opacity-50 " +
            (revoked
              ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
              : "border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30")
          }
        >
          {revoked ? "회수 해제" : "회수"}
        </button>
      </div>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {activations && (
        <div className="w-full min-w-[280px] rounded-md border border-zinc-200 bg-zinc-50 p-2 text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {activations.length === 0 ? (
            <p className="text-zinc-500">아직 활성화된 기기가 없어요.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {activations.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {a.deviceName || "이름 없음"}{" "}
                      {a.deactivatedAt && (
                        <span className="text-zinc-400">(해제됨)</span>
                      )}
                    </p>
                    <p className="truncate text-zinc-500">
                      {a.fingerprint.slice(0, 16)}… · {new Date(a.activatedAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                  {!a.deactivatedAt && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => forceDeactivate(a.id)}
                      className="shrink-0 rounded border border-rose-300 px-2 py-0.5 text-rose-700 hover:bg-rose-50 disabled:opacity-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/30"
                    >
                      해제
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
