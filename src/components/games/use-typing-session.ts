"use client";

import { useCallback, useState } from "react";
import type { TypingMode } from "@/features/typing-game/content";
import type { SubmitOutcome } from "@/features/typing-game/result";

export type GameStatus = "idle" | "loading" | "playing" | "submitting" | "finished" | "error";

interface SessionState {
  sessionId: string;
  body: string;
}

type FinishedResult = Extract<SubmitOutcome, { ok: true }>;

export function useTypingSession(mode: TypingMode) {
  const [status, setStatus] = useState<GameStatus>("idle");
  const [session, setSession] = useState<SessionState | null>(null);
  const [result, setResult] = useState<FinishedResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/games/typing/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        sessionId?: string;
        body?: string;
        error?: string;
      };
      if (!res.ok || !data.sessionId || typeof data.body !== "string") {
        setError(data.error ?? "지문을 불러오지 못했어요.");
        setStatus("error");
        return;
      }
      setSession({ sessionId: data.sessionId, body: data.body });
      setStatus("playing");
    } catch {
      setError("네트워크 오류가 발생했어요.");
      setStatus("error");
    }
  }, [mode]);

  const submit = useCallback(
    async (typedText: string) => {
      if (!session) return;
      setStatus("submitting");
      try {
        const res = await fetch("/api/games/typing/result", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId: session.sessionId, typedText }),
        });
        const data = (await res.json().catch(() => ({}))) as
          | FinishedResult
          | { error: string; code?: string };

        if (res.ok && "ok" in data && data.ok) {
          setResult(data);
          setStatus("finished");
          return;
        }

        setError("error" in data ? data.error : "제출에 실패했어요.");
        setStatus("error");
      } catch {
        setError("네트워크 오류가 발생했어요.");
        setStatus("error");
      }
    },
    [session]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setSession(null);
    setResult(null);
    setError(null);
  }, []);

  return { status, session, result, error, start, submit, reset };
}
