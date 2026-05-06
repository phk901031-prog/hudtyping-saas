// src/app/(dashboard)/search/page.tsx
// 우리말샘 검색 페이지. 클라이언트 컴포넌트(검색 입력 + 결과 갱신이 인터랙티브해야 함).
// (dashboard) 그룹 안에 있으므로 layout이 자동으로 인증/승인 검사를 한다.

"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

// 서버에서 반환하는 응답 모양 (lib/dictionary-api.ts의 SearchResult + cache 메타)
interface Sense {
  definition: string;
  pos: string;
  cat: string;
  origin: string;
  link: string;
  senseNo: string;
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
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-3xl w-full mx-auto">
      {/* 헤더: 홈 링크 + 사용자 버튼 */}
      <header className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
          ← 대시보드
        </Link>
        <UserButton />
      </header>

      <h1 className="text-2xl font-bold">우리말샘 사전 검색</h1>

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
          className="flex-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent px-5 py-3 text-base outline-none focus:border-zinc-500"
        />
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
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
          {/* 메타 정보: 총 결과 수 + 캐시 적중 표시 (학습/디버그용) */}
          <p className="text-xs text-zinc-500">
            “{result.query}” 총 {result.total}건 ·{" "}
            <span
              className={
                result.cache === "hit" ? "text-green-600" : "text-amber-600"
              }
            >
              캐시 {result.cache === "hit" ? "✓ 적중" : "× 새로 조회"}
            </span>
          </p>

          {result.items.length === 0 ? (
            <p className="text-zinc-500 text-sm">결과가 없어요.</p>
          ) : (
            result.items.map((item, idx) => (
              <article
                key={idx}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col gap-3"
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
                    <li key={i} className="text-sm">
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
