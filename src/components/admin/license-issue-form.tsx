// src/components/admin/license-issue-form.tsx
// 새 라이선스 발급 폼 — 클라이언트 컴포넌트. 발급 성공 시 평문 키를 1회 표시(복사용).

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { LicensePlan } from "@/infrastructure/db/schema";

const PLAN_OPTIONS: Array<{ value: LicensePlan; label: string }> = [
  { value: "trial", label: "체험판 (기간제)" },
  { value: "annual", label: "연간판" },
  { value: "lifetime", label: "평생판" },
];

export function LicenseIssueForm() {
  const router = useRouter();
  const [plan, setPlan] = useState<LicensePlan>("trial");
  const [durationDays, setDurationDays] = useState("7");
  const [issuedToEmail, setIssuedToEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [maxActivations, setMaxActivations] = useState("1");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issuedKey, setIssuedKey] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setIssuedKey(null);

    try {
      const res = await fetch("/api/admin/licenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan,
          durationDays: plan === "lifetime" ? undefined : parseInt(durationDays, 10),
          issuedToEmail: issuedToEmail.trim() || undefined,
          notes: notes.trim() || undefined,
          maxActivations: parseInt(maxActivations, 10) || 1,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `요청 실패 (${res.status})`);

      setIssuedKey(data.key);
      setIssuedToEmail("");
      setNotes("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <h2 className="text-base font-bold">새 라이선스 발급</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">플랜</span>
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as LicensePlan)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          >
            {PLAN_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {plan !== "lifetime" && (
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              기간 (일) — 활성화 시점부터 계산됨
            </span>
            <input
              type="number"
              min={1}
              max={3650}
              value={durationDays}
              onChange={(e) => setDurationDays(e.target.value)}
              className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        )}

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">발급 대상 이메일 (선택)</span>
          <input
            type="email"
            value={issuedToEmail}
            onChange={(e) => setIssuedToEmail(e.target.value)}
            placeholder="user@example.com"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">동시 활성화 대수</span>
          <input
            type="number"
            min={1}
            max={10}
            value={maxActivations}
            onChange={(e) => setMaxActivations(e.target.value)}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-600 dark:text-zinc-400">메모 (선택)</span>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="예: 8월 홍보 이벤트 체험판"
            className="rounded-md border border-zinc-300 bg-white px-2 py-1.5 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
        >
          {busy ? "발급 중…" : "발급"}
        </button>
        {error && <span className="text-xs text-red-600">{error}</span>}
      </div>

      {issuedKey && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 text-sm dark:border-emerald-700 dark:bg-emerald-950/30">
          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
            발급 완료 — 이 키를 지금 복사해두세요 (다시 표시되지 않습니다)
          </p>
          <code className="mt-1 block select-all rounded bg-white px-2 py-1 text-base font-bold tracking-wide dark:bg-zinc-950">
            {issuedKey}
          </code>
        </div>
      )}
    </form>
  );
}
