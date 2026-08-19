"use client";

import { useEffect, useState } from "react";

// 세션(=지문) 생성 전에 3·2·1을 보여준다. 지문 자체가 이 시점엔 아직 서버에서 안 내려온
// 상태라, 카운트다운 중엔 화면에 복사할 텍스트가 아예 없다 — "미리 보고 붙여넣기" 원천 차단.
const STEPS = ["3", "2", "1", "땡"] as const;
const STEP_DURATION_MS = 650;

interface Props {
  onComplete: () => void;
}

export function TypingCountdown({ onComplete }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= STEPS.length) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setIndex((prev) => prev + 1), STEP_DURATION_MS);
    return () => clearTimeout(timer);
  }, [index, onComplete]);

  return (
    <div className="flex h-56 items-center justify-center rounded-xl border border-border bg-card">
      <span
        key={index}
        className="typing-countdown-pulse font-display text-6xl font-bold text-accent"
      >
        {STEPS[index]}
      </span>
    </div>
  );
}
