"use client";

import { useEffect, useState } from "react";

// Play Steno의 카운트다운과 의도적으로 별개 컴포넌트로 둔다 — Study Steno는
// Play Steno 코드를 전혀 참조하지 않게 격리해서, 한쪽을 고치다 다른 쪽에
// 영향이 가는 일을 원천적으로 막는다.
const STEPS = ["3", "2", "1"] as const;
const STEP_DURATION_MS = 650;

interface Props {
  onComplete: () => void;
}

export function StudyCountdown({ onComplete }: Props) {
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
