"use client";

import { MAX_SPEED_CPM, MIN_SPEED_CPM, SPEED_STEP } from "@/features/study-steno/pacer";

interface Props {
  text: string;
  onTextChange: (value: string) => void;
  speed: number;
  onSpeedChange: (value: number) => void;
  onStart: () => void;
}

const SPEED_PRESETS = [150, 190, 230, 280, 330];

export function BogochigiSetupForm({ text, onTextChange, speed, onSpeedChange, onStart }: Props) {
  const canStart = text.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-foreground" htmlFor="bogochigi-text">
          연습할 글 붙여넣기
        </label>
        <p className="ko-copy text-xs text-muted">
          뉴스 기사나 사설 등 원하는 글을 붙여넣으세요. 입력하신 글은 서버에 저장되지
          않고 이 연습이 끝나면 사라집니다.
        </p>
        <textarea
          id="bogochigi-text"
          value={text}
          onChange={(event) => onTextChange(event.target.value)}
          rows={8}
          placeholder="여기에 연습할 글을 붙여넣으세요."
          className="w-full resize-y rounded-md border border-border bg-background px-4 py-3 text-sm leading-7 text-foreground outline-none focus:border-accent"
        />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-foreground" htmlFor="bogochigi-speed">
            낭독 속도
          </label>
          <span className="font-mono text-sm text-accent">{speed}자 / 분</span>
        </div>
        <input
          id="bogochigi-speed"
          type="range"
          min={MIN_SPEED_CPM}
          max={MAX_SPEED_CPM}
          step={SPEED_STEP}
          value={speed}
          onChange={(event) => onSpeedChange(Number(event.target.value))}
          className="w-full accent-[var(--accent)]"
        />
        <div className="flex flex-wrap gap-2">
          {SPEED_PRESETS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onSpeedChange(preset)}
              className={`rounded-full border px-3 py-1 text-xs font-bold transition ${
                speed === preset
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted hover:border-accent/60 hover:text-foreground"
              }`}
            >
              {preset}자
            </button>
          ))}
        </div>
        <p className="text-xs text-muted">
          분당 채점 대상 글자수(공백 제외) 기준입니다. 80~400자 사이에서 자유롭게
          설정할 수 있어요.
        </p>
      </div>

      <button
        type="button"
        onClick={onStart}
        disabled={!canStart}
        className="inline-flex items-center justify-center gap-2 self-start rounded-md bg-accent px-6 py-3 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        연습 시작
      </button>
    </div>
  );
}
