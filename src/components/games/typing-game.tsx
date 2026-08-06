"use client";

import Link from "next/link";
import {
  Clock3,
  Gauge,
  Keyboard,
  Medal,
  RefreshCw,
  ShieldCheck,
  Target,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type {
  TypingGameEntryInput,
  TypingGameResultSummary,
  TypingLeaderboard,
} from "@/features/typing-game/service";

interface Prompt {
  id: string;
  text: string;
}

interface SessionResponse {
  sessionId: string;
  prompts: Prompt[];
  countdownMs: number;
  durationMs: number;
  rankingEligible: boolean;
}

type GamePhase = "idle" | "loading" | "countdown" | "running" | "submitting" | "finished";

export function TypingGame({
  signedIn,
  approved,
  initialWeekly,
  initialMonthly,
}: {
  signedIn: boolean;
  approved: boolean;
  initialWeekly: TypingLeaderboard;
  initialMonthly: TypingLeaderboard;
}) {
  const [phase, setPhase] = useState<GamePhase>("idle");
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [typed, setTyped] = useState("");
  const [remainingMs, setRemainingMs] = useState(30_000);
  const [countdown, setCountdown] = useState(3);
  const [completedCount, setCompletedCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [completedChars, setCompletedChars] = useState(0);
  const [result, setResult] = useState<TypingGameResultSummary | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [rankingPeriod, setRankingPeriod] = useState<"weekly" | "monthly">("weekly");
  const [leaderboards, setLeaderboards] = useState({
    weekly: initialWeekly,
    monthly: initialMonthly,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const sessionRef = useRef<SessionResponse | null>(null);
  const promptIndexRef = useRef(0);
  const typedRef = useRef("");
  const measuredValueRef = useRef("");
  const completedEntriesRef = useRef<TypingGameEntryInput[]>([]);
  const errorCountRef = useRef(0);
  const inputCharsRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const finishingRef = useRef(false);

  const activePrompt = session?.prompts[promptIndex] ?? null;
  const currentCorrectChars = useMemo(() => {
    if (!activePrompt) return 0;
    const target = Array.from(activePrompt.text.normalize("NFC"));
    return Array.from(typed.normalize("NFC")).reduce(
      (count, character, index) => count + (character === target[index] ? 1 : 0),
      0
    );
  }, [activePrompt, typed]);
  const liveCorrectChars = completedChars + currentCorrectChars;
  const elapsedMs = Math.max(1, 30_000 - remainingMs);
  const liveCpm = phase === "running" ? Math.round((liveCorrectChars * 60_000) / elapsedMs) : 0;
  const liveAccuracy =
    liveCorrectChars + errorCount > 0
      ? (liveCorrectChars / (liveCorrectChars + errorCount)) * 100
      : 100;

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (endTimerRef.current) clearTimeout(endTimerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    intervalRef.current = null;
    endTimerRef.current = null;
    countdownRef.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const refreshRankings = useCallback(async () => {
    const [weeklyResponse, monthlyResponse] = await Promise.all([
      fetch("/api/games/typing/leaderboard?period=weekly", { cache: "no-store" }),
      fetch("/api/games/typing/leaderboard?period=monthly", { cache: "no-store" }),
    ]);
    if (weeklyResponse.ok && monthlyResponse.ok) {
      const [weekly, monthly] = (await Promise.all([
        weeklyResponse.json(),
        monthlyResponse.json(),
      ])) as [TypingLeaderboard, TypingLeaderboard];
      setLeaderboards({ weekly, monthly });
    }
  }, []);

  const finishGame = useCallback(async () => {
    if (finishingRef.current || !sessionRef.current) return;
    finishingRef.current = true;
    clearTimers();
    setRemainingMs(0);
    setPhase("submitting");

    const entries = [...completedEntriesRef.current];
    if (typedRef.current) {
      const currentPrompt = sessionRef.current.prompts[promptIndexRef.current];
      if (currentPrompt) {
        entries.push({ promptId: currentPrompt.id, typed: typedRef.current });
      }
    }

    try {
      const response = await fetch("/api/games/typing/result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: sessionRef.current.sessionId,
          entries,
          errorCount: errorCountRef.current,
          inputChars: inputCharsRef.current,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as
        | TypingGameResultSummary
        | { error?: string };
      if (!response.ok || !("score" in body)) {
        throw new Error("error" in body ? body.error : "결과를 저장하지 못했습니다.");
      }
      setResult(body);
      setPhase("finished");
      if (body.ranked) void refreshRankings();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "결과를 저장하지 못했습니다.");
      setPhase("finished");
    }
  }, [clearTimers, refreshRankings]);

  const beginRun = useCallback((durationMs: number) => {
    startedAtRef.current = performance.now();
    setRemainingMs(durationMs);
    setPhase("running");
    requestAnimationFrame(() => inputRef.current?.focus());

    intervalRef.current = setInterval(() => {
      const elapsed = performance.now() - startedAtRef.current;
      setRemainingMs(Math.max(0, durationMs - elapsed));
    }, 50);
    endTimerRef.current = setTimeout(() => void finishGame(), durationMs);
  }, [finishGame]);

  const startGame = useCallback(async () => {
    clearTimers();
    finishingRef.current = false;
    setMessage(null);
    setResult(null);
    setPhase("loading");
    setTyped("");
    setPromptIndex(0);
    setCompletedCount(0);
    setErrorCount(0);
    setCompletedChars(0);
    typedRef.current = "";
    measuredValueRef.current = "";
    promptIndexRef.current = 0;
    completedEntriesRef.current = [];
    errorCountRef.current = 0;
    inputCharsRef.current = 0;

    try {
      const response = await fetch("/api/games/typing/session", { method: "POST" });
      const body = (await response.json().catch(() => ({}))) as
        | SessionResponse
        | { error?: string };
      if (!response.ok || !("sessionId" in body)) {
        throw new Error("error" in body ? body.error : "게임을 시작하지 못했습니다.");
      }

      sessionRef.current = body;
      setSession(body);
      const seconds = Math.ceil(body.countdownMs / 1_000);
      setCountdown(seconds);
      setPhase("countdown");

      let next = seconds;
      countdownRef.current = setInterval(() => {
        next -= 1;
        if (next <= 0) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          countdownRef.current = null;
          beginRun(body.durationMs);
          return;
        }
        setCountdown(next);
      }, 1_000);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "게임을 시작하지 못했습니다.");
      setPhase("idle");
    }
  }, [beginRun, clearTimers]);

  function processValue(nextValue: string) {
    if (phase !== "running" || !activePrompt) return;
    const normalized = nextValue.normalize("NFC");
    const previous = measuredValueRef.current.normalize("NFC");
    const nextChars = Array.from(normalized);
    const previousChars = Array.from(previous);
    const targetChars = Array.from(activePrompt.text.normalize("NFC"));

    if (nextChars.length > previousChars.length) {
      const added = nextChars.length - previousChars.length;
      let newErrors = 0;
      for (let index = previousChars.length; index < nextChars.length; index++) {
        if (nextChars[index] !== targetChars[index]) newErrors += 1;
      }
      inputCharsRef.current += added;
      if (newErrors > 0) {
        errorCountRef.current += newErrors;
        setErrorCount(errorCountRef.current);
      }
    }

    measuredValueRef.current = normalized;
    typedRef.current = normalized;
    setTyped(normalized);

    if (normalized === activePrompt.text) {
      completedEntriesRef.current.push({
        promptId: activePrompt.id,
        typed: activePrompt.text,
      });
      setCompletedChars((value) => value + Array.from(activePrompt.text).length);
      const nextIndex = promptIndexRef.current + 1;
      promptIndexRef.current = nextIndex;
      setPromptIndex(nextIndex);
      setCompletedCount(completedEntriesRef.current.length);
      typedRef.current = "";
      measuredValueRef.current = "";
      setTyped("");
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  const leaderboard = leaderboards[rankingPeriod];

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
      <section className="overflow-hidden rounded-3xl border border-border bg-card shadow-[0_22px_70px_rgba(6,24,39,0.08)]">
        <div className="border-b border-border bg-ink px-5 py-5 text-white sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8fff4]">30 second sprint</p>
              <h2 className="mt-1 font-display text-2xl">30초 연속 보고 치기</h2>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 font-mono text-lg font-bold">
              <Clock3 size={17} />
              {(remainingMs / 1_000).toFixed(1)}
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-8">
          <div className="grid grid-cols-3 gap-3">
            <Metric label="타수" value={`${liveCpm}`} suffix="CPM" icon={Gauge} />
            <Metric label="정확도" value={liveAccuracy.toFixed(1)} suffix="%" icon={Target} />
            <Metric label="완료" value={`${completedCount}`} suffix="문장" icon={Keyboard} />
          </div>

          <div className="relative mt-7 min-h-[280px] rounded-2xl border border-border bg-panel p-5 sm:p-8">
            {(phase === "idle" || phase === "loading") && (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <Keyboard className="text-accent" size={34} strokeWidth={1.8} />
                <h3 className="mt-4 font-display text-2xl">준비되면 시작하세요</h3>
                <p className="ko-copy mt-2 max-w-md text-sm leading-6 text-muted">
                  문장을 정확히 입력하면 다음 문장으로 이어집니다. 온점이 보이는 문장은 온점까지 입력해야 합니다.
                </p>
                <button
                  type="button"
                  onClick={() => void startGame()}
                  disabled={phase === "loading"}
                  className="mt-6 inline-flex min-w-40 items-center justify-center rounded-lg bg-accent px-6 py-3 font-bold text-white transition hover:bg-accent-hover disabled:cursor-wait disabled:opacity-60"
                >
                  {phase === "loading" ? "문장 준비 중" : "30초 시작"}
                </button>
              </div>
            )}

            {phase === "countdown" && (
              <div className="flex min-h-[220px] items-center justify-center">
                <span className="font-display text-8xl text-accent">{countdown}</span>
              </div>
            )}

            {(phase === "running" || phase === "submitting") && activePrompt && (
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted">
                  문장 {promptIndex + 1}
                </p>
                <PromptText target={activePrompt.text} typed={typed} />
                <input
                  ref={inputRef}
                  value={typed}
                  onChange={(event) => {
                    setTyped(event.target.value);
                    typedRef.current = event.target.value;
                    const nativeEvent = event.nativeEvent as InputEvent;
                    if (!nativeEvent.isComposing) processValue(event.target.value);
                  }}
                  onCompositionEnd={(event) => processValue(event.currentTarget.value)}
                  onPaste={(event) => {
                    event.preventDefault();
                    setMessage("붙여넣기는 사용할 수 없습니다.");
                  }}
                  onDrop={(event) => event.preventDefault()}
                  onBlur={() => {
                    if (phase === "running") requestAnimationFrame(() => inputRef.current?.focus());
                  }}
                  disabled={phase !== "running"}
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  maxLength={activePrompt.text.length + 30}
                  aria-label="표시된 문장 입력"
                  className="mt-7 w-full rounded-xl border-2 border-border bg-card px-4 py-4 text-lg outline-none transition focus:border-accent"
                  placeholder="여기에 입력하세요"
                />
                <div className="mt-5 space-y-2 opacity-55">
                  {session?.prompts.slice(promptIndex + 1, promptIndex + 3).map((prompt) => (
                    <p key={prompt.id} className="truncate text-sm text-muted">{prompt.text}</p>
                  ))}
                </div>
              </div>
            )}

            {phase === "finished" && (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center">
                <Medal size={38} className="text-signal" strokeWidth={1.8} />
                {result ? (
                  <>
                    <p className="mt-3 text-sm font-bold text-muted">종합점수</p>
                    <p className="font-display text-5xl text-foreground">{result.score.toLocaleString()}</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
                      <ResultPill label="타수" value={`${result.cpm} CPM`} />
                      <ResultPill label="정확도" value={`${result.accuracy.toFixed(1)}%`} />
                      <ResultPill label="오타" value={`${result.errorCount}회`} />
                    </div>
                    <p className="ko-copy mt-4 text-sm text-muted">
                      {result.ranked
                        ? "이번 기록이 순위표에 반영됐습니다."
                        : result.suspicious
                          ? "비정상 입력으로 판단되어 연습 기록으로만 처리됐습니다."
                          : "연습 기록으로 완료됐습니다. 로그인하고 승인받으면 순위에 참여할 수 있습니다."}
                    </p>
                  </>
                ) : (
                  <p className="mt-4 text-sm text-danger">{message ?? "결과를 불러오지 못했습니다."}</p>
                )}
                <button
                  type="button"
                  onClick={() => void startGame()}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 font-bold text-white transition hover:bg-accent-hover"
                >
                  <RefreshCw size={16} /> 다시 하기
                </button>
              </div>
            )}
          </div>

          {message && phase !== "finished" && (
            <p className="mt-4 rounded-lg bg-danger/10 px-4 py-3 text-sm text-danger">{message}</p>
          )}

          <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-muted">
            <ShieldCheck size={15} className="mt-0.5 shrink-0 text-success" />
            <p>문장은 PlaySteno용으로 직접 작성했습니다. 키 입력 원문은 저장하지 않고 결과 요약만 기록합니다.</p>
          </div>
        </div>
      </section>

      <aside className="rounded-3xl border border-border bg-card p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Leaderboard</p>
            <h2 className="mt-1 font-display text-2xl">타자 순위</h2>
          </div>
          <Medal className="text-signal" size={24} />
        </div>

        <div className="mt-5 grid grid-cols-2 rounded-lg bg-panel p-1">
          {(["weekly", "monthly"] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setRankingPeriod(period)}
              className={`rounded-md px-3 py-2 text-sm font-bold transition ${
                rankingPeriod === period ? "bg-card text-foreground shadow-sm" : "text-muted"
              }`}
            >
              {period === "weekly" ? "주간" : "월간"}
            </button>
          ))}
        </div>

        <p className="mt-4 text-xs text-muted">{leaderboard.label} · 사용자별 최고 기록</p>
        <LeaderboardRows leaderboard={leaderboard} />

        {!signedIn && (
          <div className="mt-6 rounded-xl border border-accent/25 bg-accent-soft p-4 text-sm leading-6">
            연습은 바로 할 수 있습니다. 순위에 기록하려면 <Link href="/sign-up" className="font-bold text-accent underline">무료 가입</Link>이 필요합니다.
          </div>
        )}
        {signedIn && !approved && (
          <div className="mt-6 rounded-xl border border-warning/25 bg-warning/10 p-4 text-sm leading-6 text-warning">
            계정 승인 후 공식 순위에 기록됩니다. 지금은 연습 모드로 이용할 수 있습니다.
          </div>
        )}

        <div className="mt-6 border-t border-border pt-5 text-xs leading-5 text-muted">
          <p>종합점수는 타수에 정확도의 제곱을 반영합니다.</p>
          <p className="mt-1 font-mono">점수 = CPM × 정확도²</p>
        </div>
      </aside>
    </div>
  );
}

function PromptText({ target, typed }: { target: string; typed: string }) {
  const targetChars = Array.from(target);
  const typedChars = Array.from(typed.normalize("NFC"));
  return (
    <p className="ko-copy mt-5 text-2xl font-semibold leading-[1.75] sm:text-3xl">
      {targetChars.map((character, index) => {
        const entered = typedChars[index];
        const className =
          entered === undefined
            ? "text-foreground"
            : entered === character
              ? "text-success"
              : "rounded bg-danger/15 text-danger";
        return (
          <span key={`${character}-${index}`} className={className}>
            {character}
          </span>
        );
      })}
    </p>
  );
}

function Metric({
  label,
  value,
  suffix,
  icon: Icon,
}: {
  label: string;
  value: string;
  suffix: string;
  icon: typeof Gauge;
}) {
  return (
    <div className="rounded-xl border border-border bg-panel p-3 sm:p-4">
      <div className="flex items-center gap-1.5 text-xs font-bold text-muted"><Icon size={13} />{label}</div>
      <p className="mt-1 font-mono text-lg font-bold sm:text-2xl">{value}<span className="ml-1 text-[10px] font-medium text-muted sm:text-xs">{suffix}</span></p>
    </div>
  );
}

function ResultPill({ label, value }: { label: string; value: string }) {
  return <span className="rounded-full border border-border bg-card px-3 py-1.5"><span className="text-muted">{label}</span> <strong>{value}</strong></span>;
}

function LeaderboardRows({ leaderboard }: { leaderboard: TypingLeaderboard }) {
  if (leaderboard.rows.length === 0) {
    return <p className="mt-5 rounded-xl border border-dashed border-border py-9 text-center text-sm text-muted">첫 기록의 주인공이 되어 보세요.</p>;
  }
  return (
    <ol className="mt-4 divide-y divide-border">
      {leaderboard.rows.slice(0, 10).map((row) => (
        <li key={`${leaderboard.period}-${row.player}`} className="grid grid-cols-[28px_minmax(0,1fr)_auto] items-center gap-2 py-3 text-sm">
          <span className={`font-mono font-bold ${row.rank <= 3 ? "text-signal" : "text-muted"}`}>{row.rank}</span>
          <span className="truncate font-medium">{row.player}</span>
          <span className="text-right">
            <strong className="font-mono">{row.score}</strong>
            <span className="ml-1 block text-[10px] text-muted sm:inline">{row.cpm} CPM · {row.accuracy.toFixed(1)}%</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
