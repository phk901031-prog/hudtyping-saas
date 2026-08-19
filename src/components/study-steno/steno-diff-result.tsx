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
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-card px-6 py-6 sm:grid-cols-3">
        <ScoreTile label="정확도" value={`${result.accuracy}%`} accent />
        <ScoreTile label="합격 기준" value={result.passed ? "합격 (90% 이상)" : "미달"} warn={!result.passed} />
        <ScoreTile
          label="오자 · 탈자 · 첨자"
          value={`${result.ojaCount} · ${result.taljaCount} · ${result.cheomjaCount}`}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 text-xs">
        <LegendItem swatchClassName="bg-red-300" label="오자 (잘못 침)" />
        <LegendItem swatchClassName="bg-yellow-300" label="탈자 (빠뜨림)" />
        <LegendItem swatchClassName="bg-green-300" label="첨자 (더 침)" />
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

function ScoreTile({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  const toneClass = warn ? "text-danger" : accent ? "text-accent" : "text-foreground";
  return (
    <div>
      <p className={`font-mono text-xl font-bold ${toneClass}`}>{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function LegendItem({ swatchClassName, label }: { swatchClassName: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block h-3 w-3 rounded ${swatchClassName}`} />
      <span className="text-muted">{label}</span>
    </span>
  );
}
