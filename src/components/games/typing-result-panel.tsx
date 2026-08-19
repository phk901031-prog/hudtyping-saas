"use client";

import { useEffect } from "react";
import Link from "next/link";

interface Props {
  netSpeed: number;
  accuracyBasisPoints: number;
  errorCount: number;
  suspicious: boolean;
  saved: boolean;
  prevBest: number | null;
  signedIn: boolean;
  onRetry: () => void;
}

export function TypingResultPanel({
  netSpeed,
  accuracyBasisPoints,
  errorCount,
  suspicious,
  saved,
  prevBest,
  signedIn,
  onRetry,
}: Props) {
  const diff = prevBest !== null ? netSpeed - prevBest : null;

  // 스페이스/엔터로 바로 다시 하기 — 마우스로 버튼 클릭하러 손 옮길 필요 없게.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" || event.code === "Enter") {
        event.preventDefault();
        onRetry();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onRetry]);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card px-6 py-8 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">결과</p>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">{netSpeed}</p>
          <p className="text-xs text-muted">타/분</p>
        </div>
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">
            {(accuracyBasisPoints / 100).toFixed(1)}%
          </p>
          <p className="text-xs text-muted">정확도</p>
        </div>
        <div>
          <p className="font-mono text-3xl font-bold text-foreground">{errorCount}</p>
          <p className="text-xs text-muted">오타</p>
        </div>
      </div>

      {diff !== null && (
        <p className={`text-sm font-bold ${diff >= 0 ? "text-success" : "text-muted"}`}>
          이전 최고 대비 {diff >= 0 ? "+" : ""}
          {diff}타/분
        </p>
      )}

      {!signedIn && (
        <p className="ko-copy text-sm text-muted">
          로그인하면 기록이 저장되고 리더보드에 등록돼요.{" "}
          <Link href="/sign-in" className="font-bold text-accent hover:underline">
            로그인
          </Link>
        </p>
      )}
      {signedIn && !saved && (
        <p className="text-sm text-muted">이번 기록은 저장되지 않았어요.</p>
      )}
      {signedIn && saved && suspicious && (
        <p className="ko-copy text-sm text-warning">
          기록이 비정상적으로 빨라 리더보드 반영은 보류됐어요.
        </p>
      )}

      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover"
        >
          다시 하기
        </button>
        <p className="text-xs text-muted">스페이스바나 엔터를 눌러도 바로 다시 할 수 있어요.</p>
      </div>
    </div>
  );
}
