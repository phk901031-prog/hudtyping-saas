"use client";

import { useEffect, useState } from "react";
import type { TypingMode } from "@/features/typing-game/content";
import type { LeaderboardPeriod, LeaderboardRow } from "@/features/typing-game/leaderboard";
import { colorClass, borderClass } from "@/features/typing-game/types";

const PERIOD_LABEL: Record<LeaderboardPeriod, string> = {
  daily: "일간",
  weekly: "주간",
  monthly: "월간",
  all: "역대",
};
const PERIODS = Object.keys(PERIOD_LABEL) as LeaderboardPeriod[];

interface Props {
  mode: TypingMode;
  initialRows: LeaderboardRow[];
  initialPeriod: LeaderboardPeriod;
}

export function TypingLeaderboardPanel({ mode, initialRows, initialPeriod }: Props) {
  const [period, setPeriod] = useState<LeaderboardPeriod>(initialPeriod);
  const [rows, setRows] = useState<LeaderboardRow[]>(initialRows);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/games/typing/leaderboard?mode=${mode}&period=${period}`)
      .then((res) => res.json())
      .then((data: { rows?: LeaderboardRow[] }) => {
        if (!cancelled) setRows(data.rows ?? []);
      })
      .catch(() => {
        if (!cancelled) setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, period]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-5 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">리더보드</p>
        <div className="flex gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriod(p)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                period === p ? "bg-accent text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {PERIOD_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <ol className={`flex flex-col gap-1.5 text-sm transition-opacity ${loading ? "opacity-50" : ""}`}>
        {rows.length === 0 && (
          <li className="py-6 text-center text-muted">아직 기록이 없어요.</li>
        )}
        {rows.map((row) => (
          <li
            key={`${row.rank}-${row.nickname}-${row.createdAt}`}
            className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-panel"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="w-6 shrink-0 text-right font-bold text-muted">{row.rank}</span>
              <span
                className={`truncate rounded-full px-2.5 py-0.5 text-xs font-bold ${colorClass(row.nameColor)} ${borderClass(row.borderStyle)}`}
              >
                {row.nickname}
              </span>
            </span>
            <span className="shrink-0 font-mono text-sm text-foreground">
              {row.netSpeed}타/분 · {(row.accuracyBasisPoints / 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
