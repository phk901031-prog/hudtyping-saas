// src/app/(dashboard)/search/page.tsx
// 우리말샘 검색 페이지. 클라이언트 컴포넌트(검색 입력 + 결과 갱신이 인터랙티브해야 함).
// (dashboard) 그룹 안에 있으므로 layout이 자동으로 인증/승인 검사를 한다.

"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { WordExamples } from "@/components/search/word-examples";

// 서버에서 반환하는 응답 모양 (lib/dictionary-api.ts의 SearchResult + cache 메타)
interface Sense {
  definition: string;
  pos: string;
  cat: string;
  origin: string;
  link: string;
  senseNo: string;
  targetCode: string;
}
interface DictItem {
  word: string;
  senses: Sense[];
}
interface ApiResult {
  query: string;
  total: number;
  items: DictItem[];
  cache: "hit" | "miss";
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ApiResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`
      );
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `요청 실패 (${res.status})`);
      }
      const data = (await res.json()) as ApiResult;
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-5 py-8 sm:px-8">
      {/* 헤더: 홈 링크 + 사용자 버튼 */}
      <header className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
          ← 대시보드
        </Link>
        <UserButton />
      </header>

      <div>
        <p className="text-sm font-bold text-accent">사전 검색</p>
        <h1 className="mt-1 font-display text-3xl">우리말샘 검색</h1>
        <p className="mt-2 text-sm text-muted">뜻풀이를 확인하고 필요한 항목의 예문을 바로 펼쳐보세요.</p>
      </div>

      {/* 검색 폼 */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="검색어 입력 후 Enter"
          autoFocus
          aria-label="우리말샘 검색어"
          className="min-w-0 flex-1 rounded-lg border border-border bg-card px-5 py-3 text-base outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-lg bg-foreground px-6 py-3 text-sm font-bold text-background transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-50"
        >
          {loading ? "검색 중…" : "검색"}
        </button>
      </form>

      {/* 상태 표시 */}
      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {result && (
        <section className="flex flex-col gap-4">
          <p className="text-sm text-muted">“{result.query}” 총 {result.total}건</p>

          {result.items.length === 0 ? (
            <p className="text-zinc-500 text-sm">결과가 없어요.</p>
          ) : (
            result.items.map((item, idx) => (
              <article
                key={idx}
                className="feature-card flex flex-col gap-3 rounded-xl border border-border bg-card p-5"
              >
                <h2 className="text-xl font-semibold">
                  {item.word}
                  {item.senses[0]?.origin && (
                    <span className="ml-2 text-sm text-zinc-500 font-normal">
                      ({item.senses[0].origin})
                    </span>
                  )}
                </h2>

                <ol className="flex flex-col gap-2 list-decimal pl-5">
                  {item.senses.map((sense, i) => (
                    <li key={`${sense.targetCode}-${i}`} className="text-sm leading-6">
                      <span className="inline-flex gap-1.5 items-center mr-2 align-middle">
                        {sense.pos && (
                          <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs">
                            {sense.pos}
                          </span>
                        )}
                        {sense.cat && (
                          <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-500">
                            {sense.cat}
                          </span>
                        )}
                      </span>
                      {sense.definition}
                      {/^\d+$/.test(sense.targetCode) && (
                        <WordExamples targetCode={sense.targetCode} />
                      )}
                    </li>
                  ))}
                </ol>
              </article>
            ))
          )}
        </section>
      )}
    </main>
  );
}
