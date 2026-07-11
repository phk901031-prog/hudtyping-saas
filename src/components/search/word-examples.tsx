"use client";

import { useState } from "react";

interface WordDetailExample {
  text: string;
  source?: string;
}

interface WordDetailResponse {
  senses?: Array<{ examples: WordDetailExample[] }>;
  error?: string;
}

export function WordExamples({ targetCode }: { targetCode: string }) {
  const [open, setOpen] = useState(false);
  const [examples, setExamples] = useState<WordDetailExample[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (open) {
      setOpen(false);
      return;
    }

    setOpen(true);
    if (examples !== null || loading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/word/${encodeURIComponent(targetCode)}`);
      const body = (await response.json().catch(() => ({}))) as WordDetailResponse;
      if (!response.ok) throw new Error(body.error ?? `예문 조회 실패 (${response.status})`);
      setExamples(body.senses?.flatMap((sense) => sense.examples) ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "예문을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="rounded-md border border-border px-2.5 py-1.5 text-xs font-bold text-accent transition hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? "예문 닫기" : "예문 보기"}
      </button>

      {open && (
        <div className="mt-3 rounded-lg border border-border bg-panel p-4" aria-live="polite">
          {loading && <p className="text-sm text-muted">예문을 불러오는 중…</p>}
          {error && <p className="text-sm text-danger">{error}</p>}
          {!loading && !error && examples?.length === 0 && (
            <p className="text-sm text-muted">등록된 예문이 없습니다.</p>
          )}
          {examples && examples.length > 0 && (
            <ul className="space-y-3">
              {examples.map((example, index) => (
                <li key={`${example.text}-${index}`} className="text-sm leading-6">
                  <p>{example.text.replace(/[{}]/g, "")}</p>
                  {example.source && <p className="mt-1 text-xs text-muted">출처: {example.source}</p>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

