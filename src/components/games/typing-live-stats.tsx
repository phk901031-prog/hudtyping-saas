"use client";

interface Props {
  elapsedMs: number;
  netSpeed: number;
  accuracyBasisPoints: number;
}

export function TypingLiveStats({ elapsedMs, netSpeed, accuracyBasisPoints }: Props) {
  return (
    <div className="flex items-center gap-6 font-mono text-sm text-muted">
      <span>{(elapsedMs / 1000).toFixed(1)}초</span>
      <span>{netSpeed}타/분</span>
      <span>{(accuracyBasisPoints / 100).toFixed(1)}%</span>
    </div>
  );
}
