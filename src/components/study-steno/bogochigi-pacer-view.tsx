"use client";

import type { PacedWord } from "@/features/study-steno/pacer";

interface Props {
  words: PacedWord[];
  visibleCount: number;
  typedText: string;
  onTypedTextChange: (value: string) => void;
  onSubmit: () => void;
}

export function BogochigiPacerView({
  words,
  visibleCount,
  typedText,
  onTypedTextChange,
  onSubmit,
}: Props) {
  const revealedText = words
    .slice(0, visibleCount)
    .map((word) => word.text + word.trailingSpace)
    .join("");
  const progress = words.length > 0 ? Math.round((visibleCount / words.length) * 100) : 0;
  const fullyRevealed = visibleCount >= words.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted-bg">
        <div
          className="h-full rounded-full bg-accent transition-[width]"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="min-h-40 rounded-xl border border-border bg-card px-5 py-6">
        <p className="ko-copy whitespace-pre-wrap break-keep text-lg leading-9">
          {revealedText}
          {!fullyRevealed && <span className="typing-countdown-pulse text-accent">▌</span>}
        </p>
      </div>

      <textarea
        autoFocus
        value={typedText}
        onChange={(event) => onTypedTextChange(event.target.value)}
        onPaste={(event) => event.preventDefault()}
        onDrop={(event) => event.preventDefault()}
        rows={6}
        placeholder="여기에 따라 입력하세요."
        className="w-full resize-y rounded-md border border-border bg-background px-4 py-3 text-base leading-7 outline-none focus:border-accent"
        autoComplete="off"
        autoCorrect="off"
        spellCheck={false}
      />

      <button
        type="button"
        onClick={onSubmit}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-hover"
      >
        {fullyRevealed ? "채점하기" : "여기까지 채점하기"}
      </button>
    </div>
  );
}
