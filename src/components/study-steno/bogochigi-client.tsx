"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_SPEED_CPM, schedulePacing, type PacedWord } from "@/features/study-steno/pacer";
import { scoreKoreanSteno, type StenoScoreResult } from "@/features/study-steno/scoring";
import { BogochigiSetupForm } from "./bogochigi-setup-form";
import { StudyCountdown } from "./study-countdown";
import { BogochigiPacerView } from "./bogochigi-pacer-view";
import { StenoDiffResult } from "./steno-diff-result";

type Phase = "setup" | "countdown" | "pacing" | "finished";

const TICK_MS = 80;

export function BogochigiClient() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [sourceText, setSourceText] = useState("");
  const [speed, setSpeed] = useState(DEFAULT_SPEED_CPM);
  const [words, setWords] = useState<PacedWord[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [result, setResult] = useState<StenoScoreResult | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const handleStart = () => {
    if (!sourceText.trim()) return;
    setPhase("countdown");
  };

  const handleCountdownComplete = () => {
    setWords(schedulePacing(sourceText, speed));
    setVisibleCount(0);
    setTypedText("");
    startedAtRef.current = Date.now();
    setPhase("pacing");
  };

  useEffect(() => {
    if (phase !== "pacing") return;
    const interval = setInterval(() => {
      const elapsed = Date.now() - (startedAtRef.current ?? Date.now());
      let count = 0;
      while (count < words.length && words[count].revealAtMs <= elapsed) count += 1;
      setVisibleCount(count);
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [phase, words]);

  const handleSubmit = () => {
    setResult(scoreKoreanSteno(sourceText, typedText));
    setPhase("finished");
  };

  const handleRetry = () => {
    setPhase("setup");
    setResult(null);
    setTypedText("");
    setVisibleCount(0);
  };

  if (phase === "setup") {
    return (
      <BogochigiSetupForm
        text={sourceText}
        onTextChange={setSourceText}
        speed={speed}
        onSpeedChange={setSpeed}
        onStart={handleStart}
      />
    );
  }

  if (phase === "countdown") {
    return <StudyCountdown onComplete={handleCountdownComplete} />;
  }

  if (phase === "pacing") {
    return (
      <BogochigiPacerView
        words={words}
        visibleCount={visibleCount}
        typedText={typedText}
        onTypedTextChange={setTypedText}
        onSubmit={handleSubmit}
      />
    );
  }

  if (phase === "finished" && result) {
    return <StenoDiffResult result={result} onRetry={handleRetry} />;
  }

  return null;
}
