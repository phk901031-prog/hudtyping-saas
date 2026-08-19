"use client";

import { useEffect, useState } from "react";
import type { TypingMode } from "@/features/typing-game/content";
import type { LeaderboardRow } from "@/features/typing-game/leaderboard";
import { computeTypingScore } from "@/features/typing-game/scoring";
import type { GameProfile } from "@/infrastructure/db/schema";
import { useTypingSession } from "./use-typing-session";
import { useTypingInput } from "./use-typing-input";
import { TypingModeTabs } from "./typing-mode-tabs";
import { TypingCountdown } from "./typing-countdown";
import { TypingPrompt } from "./typing-prompt";
import { TypingLiveStats } from "./typing-live-stats";
import { TypingResultPanel } from "./typing-result-panel";
import { TypingLeaderboardPanel } from "./typing-leaderboard-panel";
import { TypingProfileSetup } from "./typing-profile-setup";

interface Props {
  signedIn: boolean;
  initialProfile: GameProfile | null;
  initialLeaderboard: LeaderboardRow[];
}

// 얇은 오케스트레이터 — 상태머신만 소유하고 렌더는 하위 컴포넌트에 위임.
export function TypingPlayClient({ signedIn, initialProfile, initialLeaderboard }: Props) {
  const [mode, setMode] = useState<TypingMode>("short");
  const [profile, setProfile] = useState(initialProfile);
  const { status, session, result, error, start, submit, reset } = useTypingSession(mode);
  const targetLength = session ? Array.from(session.body).length : 0;
  const input = useTypingInput(targetLength);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  // 카운트다운이 끝나기 전엔 세션(=지문)을 아예 서버에 요청하지 않는다 — 지문이 화면에
  // 없으니 미리 복사해둘 수도 없다. 카운트다운이 끝나는 순간 start()를 호출해서
  // 서버의 startedAt과 실제로 지문이 보이는 시점을 최대한 일치시킨다.
  const [countingDown, setCountingDown] = useState(false);

  useEffect(() => {
    if (status !== "playing") return;
    setStartedAt(Date.now());
    setNow(Date.now());
    const interval = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(interval);
    // session?.sessionId 로 새 세션마다 타이머를 다시 시작한다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session?.sessionId]);

  useEffect(() => {
    if (
      status === "playing" &&
      session &&
      targetLength > 0 &&
      input.typedText.length === targetLength
    ) {
      void submit(input.typedText);
    }
  }, [status, session, targetLength, input.typedText, submit]);

  const handleStart = () => {
    input.reset();
    setCountingDown(true);
  };

  const handleCountdownComplete = () => {
    setCountingDown(false);
    void start();
  };

  const handleRetry = () => {
    input.reset();
    reset();
    setCountingDown(true);
  };

  const elapsedMs = startedAt && now ? now - startedAt : 0;
  const liveScore = session
    ? computeTypingScore({ targetBody: session.body, typedText: input.typedText, elapsedMs })
    : null;

  const busy = status === "loading" || status === "submitting";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <TypingModeTabs
          mode={mode}
          onChange={setMode}
          disabled={countingDown || status === "playing" || busy}
        />
        {!countingDown && (status === "idle" || status === "error" || status === "loading") && (
          <button
            type="button"
            onClick={handleStart}
            disabled={status === "loading"}
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "불러오는 중..." : "시작하기"}
          </button>
        )}
      </div>

      {error && !countingDown && <p className="text-sm text-danger">{error}</p>}

      {countingDown && <TypingCountdown onComplete={handleCountdownComplete} />}

      {!countingDown && (status === "playing" || status === "submitting") && session && (
        <div className="flex flex-col gap-4">
          <TypingLiveStats
            elapsedMs={elapsedMs}
            netSpeed={liveScore?.netSpeed ?? 0}
            accuracyBasisPoints={liveScore?.accuracyBasisPoints ?? 0}
          />
          <TypingPrompt target={session.body} typed={input.typedText} />
          <input
            autoFocus
            value={input.rawValue}
            onChange={input.onChange}
            onPaste={(event) => event.preventDefault()}
            onDrop={(event) => event.preventDefault()}
            disabled={status === "submitting"}
            className="w-full rounded-md border border-border bg-background px-4 py-3 text-lg outline-none focus:border-accent disabled:opacity-60"
            placeholder="여기에 입력하세요"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button
            type="button"
            onClick={input.toggleDubeolsikMode}
            className={`self-start text-xs font-bold hover:text-accent ${
              input.dubeolsikMode ? "text-accent" : "text-muted"
            }`}
          >
            {input.dubeolsikMode
              ? "두벌식 자동 변환 켜짐"
              : "영문으로 입력됐다면: 두벌식 자동 변환"}
          </button>
        </div>
      )}

      {status === "finished" && result && (
        <TypingResultPanel
          netSpeed={result.netSpeed}
          accuracyBasisPoints={result.accuracyBasisPoints}
          errorCount={result.errorCount}
          suspicious={result.suspicious}
          saved={result.saved}
          prevBest={result.prevBest}
          signedIn={signedIn}
          onRetry={handleRetry}
        />
      )}

      {signedIn && !profile && <TypingProfileSetup onSaved={setProfile} />}

      <TypingLeaderboardPanel mode={mode} initialRows={initialLeaderboard} initialPeriod="daily" />
    </div>
  );
}
