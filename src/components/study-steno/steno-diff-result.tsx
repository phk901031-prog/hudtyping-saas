"use client";

import type { AlignOp, StenoScoreResult } from "@/features/study-steno/scoring";

// 보고치기·듣고치기 등 Study Steno에서 채점을 보여주는 모든 화면이 공유하는
// 결과 컴포넌트. 원문을 기준으로 오자·탈자·첨자를 색으로 구분해서 보여준다.
interface Props {
  result: StenoScoreResult;
  onRetry: () => void;
}

export function StenoDiffResult({ result, onRetry }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card px-6 py-6">
        <div>
          <p className="font-mono text-3xl font-bold text-accent">{result.accuracy}%</p>
          <p className="text-xs text-muted">정확도</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ErrorCountBadge label="오자" count={result.ojaCount} swatchClassName="bg-red-300" />
          <ErrorCountBadge label="탈자" count={result.taljaCount} swatchClassName="bg-yellow-300" />
          <ErrorCountBadge label="첨자" count={result.cheomjaCount} swatchClassName="bg-green-300" />
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card px-5 py-6">
        <p className="ko-copy whitespace-pre-wrap break-keep text-lg leading-9">
          {result.ops.map((op, index) => (
            <DiffSpan key={index} op={op} />
          ))}
        </p>
      </div>

      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-hover"
      >
        새로 연습하기
      </button>
    </div>
  );
}

function DiffSpan({ op }: { op: AlignOp }) {
  switch (op.type) {
    case "match":
      return <span>{op.original}</span>;
    case "substitute":
      return (
        <span
          className="rounded bg-red-300 px-0.5 font-bold text-ink"
          title={`입력: ${op.typed || "∅"}`}
        >
          {op.original}
        </span>
      );
    case "delete":
      return (
        <span className="rounded bg-yellow-300 px-0.5 font-bold text-ink underline decoration-ink/70 decoration-wavy decoration-2">
          {op.original}
        </span>
      );
    case "insert":
      return (
        <span className="mx-0.5 rounded bg-green-300 px-1 align-super text-xs font-bold text-ink">
          {op.typed}
        </span>
      );
  }
}

function ErrorCountBadge({
  label,
  count,
  swatchClassName,
}: {
  label: string;
  count: number;
  swatchClassName: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-bold text-ink ${swatchClassName}`}
    >
      {label} {count}
    </span>
  );
}
