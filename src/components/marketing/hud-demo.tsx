"use client";

// src/components/marketing/hud-demo.tsx
// 홈페이지 브라우저 체험판 — 한글 문서 위에 낱말지기 HUD 가 뜨는 흐름을 그대로 흉내 낸다.
//
// - 단어를 누르면 그 단어 뒤에 커서가 놓이고, F3(또는 화면의 F3 버튼)을 누르면 HUD 가 뜬다.
// - 실제 앱처럼 연타하면 앞 어절까지 검색 범위가 넓어진다 (감사 → 국정 감사).
// - 뜻풀이는 scripts/generate-demo-dictionary.mjs 로 미리 받아 둔 정적 JSON 만 쓴다.
//   방문자 수와 상관없이 우리말샘·Redis·DB 호출이 없다.

import { useCallback, useEffect, useRef, useState } from "react";
import dictionary from "@/features/demo/demo-dictionary.json";

type Entry = { word: string; origin: string; senses: { pos: string; definition: string }[] };
const DICT = dictionary as Record<string, Entry[]>;

// 문서 조각: 검색 가능한 단어는 queries 를 가진다.
// queries[0] = 1회 누름, queries[1] = 2회 누름(앞 어절 포함)...
// stem = 커서가 놓이는 위치까지의 글자, rest = 커서 뒤 조사·어미
// prefix = 2회 누름 때 함께 선택되는 앞 어절 (국정 감사의 "국정 ")
type Segment =
  | { text: string }
  | { id: string; prefix?: string; stem: string; rest: string; queries: string[] };

const DOCUMENT: Segment[][] = [
  [
    { text: "다음 " },
    { id: "hoeui", stem: "회의", rest: "에서 ", queries: ["회의"] },
    { id: "angeon", stem: "안건", rest: "을 다시 ", queries: ["안건"] },
    { id: "jeongni", stem: "정리", rest: "합니다.", queries: ["정리"] },
  ],
  [
    { id: "wiwonjang", stem: "위원장", rest: "은 ", queries: ["위원장"] },
    { id: "jirui", stem: "질의", rest: " 시간을 5분으로 ", queries: ["질의"] },
    { id: "jehan", stem: "제한", rest: "하였습니다.", queries: ["제한"] },
  ],
  [
    { id: "jeungin", stem: "증인", rest: "의 ", queries: ["증인"] },
    { id: "dapbyeon", stem: "답변", rest: "을 ", queries: ["답변"] },
    { id: "jaecha", stem: "재차", rest: " ", queries: ["재차"] },
    { id: "hwagin", stem: "확인", rest: "해 달라고 ", queries: ["확인"] },
    { id: "yocheong", stem: "요청", rest: "했습니다.", queries: ["요청"] },
  ],
  [
    { text: "이번 " },
    { id: "gamsa", prefix: "국정 ", stem: "감사", rest: "에서 지적된 사항입니다.", queries: ["감사", "국정 감사"] },
  ],
];

const TARGETS = DOCUMENT.flat().filter((s): s is Extract<Segment, { id: string }> => "id" in s);
const HOTKEY = "F3";
// 실제 앱과 같은 방식: 마지막 누름 뒤 잠깐 기다렸다가 한 번만 검색
const EXPANSION_DEBOUNCE_MS = 320;

export function HudDemo() {
  const [caretId, setCaretId] = useState("jeongni");
  const [result, setResult] = useState<{ query: string; entries: Entry[] } | null>(null);
  const [pressCount, setPressCount] = useState(0); // 연타 누적 (표시용)
  const [selectedLevel, setSelectedLevel] = useState(0); // 선택 하이라이트 범위
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(0);
  const docRef = useRef<HTMLDivElement>(null);

  const target = TARGETS.find((t) => t.id === caretId) ?? TARGETS[0];

  const press = useCallback(() => {
    pendingRef.current += 1;
    const level = Math.min(pendingRef.current, target.queries.length);
    setPressCount(pendingRef.current);
    setSelectedLevel(level);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const query = target.queries[level - 1];
      setResult({ query, entries: DICT[query] ?? [] });
      pendingRef.current = 0;
      setPressCount(0);
    }, EXPANSION_DEBOUNCE_MS);
  }, [target]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // 단어를 누르면 커서 이동 + 이전 결과·선택 초기화
  const moveCaret = (id: string) => {
    setCaretId(id);
    setResult(null);
    setSelectedLevel(0);
    pendingRef.current = 0;
    docRef.current?.focus({ preventScroll: true });
  };

  // 문서에 포커스가 있을 때만 F3 를 가로챈다 (브라우저 찾기 기능과 충돌 방지)
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === HOTKEY) {
      e.preventDefault();
      press();
      return;
    }
    // 좌우 화살표로 다음·이전 단어로 커서 이동
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const idx = TARGETS.findIndex((t) => t.id === caretId);
      const next = TARGETS[(idx + (e.key === "ArrowRight" ? 1 : -1) + TARGETS.length) % TARGETS.length];
      moveCaret(next.id);
    }
    if (e.key === "Escape") setResult(null);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-28px_rgba(34,29,23,0.35)]">
      {/* 워드프로세서 창 제목줄 */}
      <div className="flex items-center gap-2 border-b border-border bg-panel px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
          <span className="size-2.5 rounded-full bg-border" />
        </span>
        <span className="ml-2 truncate font-mono text-[11px] text-muted">회의록_정기회의.hwp</span>
        <span className="ml-auto hidden font-mono text-[10px] uppercase tracking-[0.14em] text-accent sm:inline">
          체험판
        </span>
      </div>

      <div className="relative grid min-h-[22rem] md:grid-cols-[minmax(0,1fr)_17rem]">
        {/* 문서 본문 */}
        <div
          ref={docRef}
          tabIndex={0}
          role="application"
          aria-label={`체험용 문서. 단어를 고른 뒤 ${HOTKEY} 키를 누르면 뜻풀이가 표시됩니다.`}
          onKeyDown={onKeyDown}
          className="px-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-8 sm:py-8"
        >
          <div className="space-y-4 text-[17px] leading-9 text-foreground sm:text-lg">
            {DOCUMENT.map((para, pi) => (
              <p key={pi} className="ko-copy">
                {para.map((seg, si) => {
                  if ("text" in seg) return <span key={si}>{seg.text}</span>;
                  const isCaret = seg.id === caretId;
                  return (
                    <span key={si}>
                      {seg.prefix && (
                        // 2회 누름이면 앞 어절도 선택된 것처럼 하이라이트
                        <span className={isCaret && selectedLevel > 1 ? "rounded-[3px] bg-accent/20" : ""}>
                          {seg.prefix}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => moveCaret(seg.id)}
                        className={`rounded-[3px] px-[1px] transition-colors ${
                          isCaret && selectedLevel > 0
                            ? "bg-accent/20"
                            : "underline decoration-accent/30 decoration-dotted underline-offset-[6px] hover:bg-accent-soft"
                        }`}
                      >
                        {seg.stem}
                      </button>
                      {isCaret && (
                        <span
                          aria-hidden="true"
                          className="mx-[1px] inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-accent"
                        />
                      )}
                      {seg.rest}
                    </span>
                  );
                })}
              </p>
            ))}
          </div>

          {/* 연타 확장이 가능한 단어에서만 안내 */}
          {target.queries.length > 1 && (
            <p className="mt-5 text-xs leading-5 text-muted">
              <strong className="text-foreground">{target.stem}</strong> 뒤에서 {HOTKEY}를 빠르게 두 번 누르면
              앞 어절까지 넓혀 <strong className="text-foreground">{target.queries[1]}</strong>를 찾습니다.
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-dashed border-border pt-5">
            <button
              type="button"
              onClick={press}
              className={`keycap h-11 min-w-14 px-3 text-sm shadow-[0_3px_0_var(--border)] transition active:translate-y-[2px] active:shadow-none ${
                result ? "" : "border-accent text-accent"
              }`}
              aria-label={`${HOTKEY} 키 누르기`}
            >
              {HOTKEY}
            </button>
            <p className="ko-copy text-sm leading-6 text-muted">
              {pressCount > 1
                ? `${pressCount}번 눌렀습니다 — 범위를 넓혀 찾는 중`
                : result
                  ? "다른 단어를 눌러 커서를 옮겨 보세요."
                  : `밑줄 친 단어를 누르고 ${HOTKEY}를 눌러 보세요. 키보드 ${HOTKEY}도 됩니다.`}
            </p>
          </div>
        </div>

        {/* HUD — 실제 앱처럼 화면 가장자리에 붙는 작은 어두운 창 */}
        <aside
          aria-live="polite"
          className="border-t border-border bg-ink p-5 text-white md:border-l md:border-t-0"
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
            <span>낱말지기 HUD</span>
            <span className={result ? "text-accent" : ""}>{result ? "● 결과" : "대기 중"}</span>
          </div>

          {result ? (
            <div className="mt-4 space-y-5">
              {result.entries.map((entry, i) => (
                <div key={`${entry.origin}-${i}`} className={i > 0 ? "border-t border-white/10 pt-4" : ""}>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <strong className="text-xl">{entry.word}</strong>
                    {entry.origin && <span className="text-sm text-white/55">{entry.origin}</span>}
                  </div>
                  <ol className="mt-2 space-y-2">
                    {entry.senses.map((s, j) => (
                      <li key={j} className="ko-copy text-sm leading-6 text-white/80">
                        {s.pos && <span className="mr-1.5 text-[11px] text-white/45">「{s.pos}」</span>}
                        {s.definition}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              <p className="font-mono text-[10px] text-white/35">출처 · 국립국어원 우리말샘</p>
            </div>
          ) : (
            <p className="ko-copy mt-4 text-sm leading-6 text-white/50">
              문서에서 <span className="text-white/80">{target.stem}</span> 뒤에 커서가 있습니다.
              <br />
              {HOTKEY}를 누르면 여기에 뜻풀이가 뜹니다.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
