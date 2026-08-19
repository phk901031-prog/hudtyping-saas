"use client";

import type { TypingMode } from "@/features/typing-game/content";

interface Props {
  mode: TypingMode;
  onChange: (mode: TypingMode) => void;
  disabled?: boolean;
}

const LABELS: Record<TypingMode, string> = { short: "단문", long: "장문" };

export function TypingModeTabs({ mode, onChange, disabled }: Props) {
  return (
    <div className="inline-flex rounded-full border border-border bg-card p-1">
      {(Object.keys(LABELS) as TypingMode[]).map((m) => (
        <button
          key={m}
          type="button"
          disabled={disabled}
          onClick={() => onChange(m)}
          className={`rounded-full px-4 py-1.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            mode === m ? "bg-accent text-white" : "text-muted hover:text-foreground"
          }`}
        >
          {LABELS[m]}
        </button>
      ))}
    </div>
  );
}
