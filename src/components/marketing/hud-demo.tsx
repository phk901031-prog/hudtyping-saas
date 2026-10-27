"use client";

// src/components/marketing/hud-demo.tsx
// 홈페이지 브라우저 체험판 — 회의록에서 헷갈리는 띄어쓰기를 낱말지기 HUD 로 확인하는 흐름을 흉내 낸다.
//
// - 단어를 누르면 그 단어 뒤에 커서가 놓이고, F3(또는 화면의 F3 버튼)을 누르면 HUD 가 뜬다.
// - HUD 는 실제 앱처럼 우리말샘 표제어를 표기 그대로(음 소거 / 가해^학생 / 회의-록) 보여준다.
// - 문서 아래 판정 카드는 그 표기를 어떻게 읽는지 풀어 주는 체험판 전용 설명이다.
// - 실제 앱처럼 연타하면 앞 어절까지 검색 범위가 넓어진다 (감사 → 국정 감사).
// - 검색 결과는 scripts/generate-demo-dictionary.mjs 로 미리 받아 둔 정적 JSON 만 쓴다.
//   방문자 수와 상관없이 우리말샘·Redis·DB 호출이 없다.

import { useCallback, useEffect, useRef, useState } from "react";
import dictionary from "@/features/demo/demo-dictionary.json";

type Entry = { word: string; origin: string; pos: string; definition: string };
type Result = { entries: Entry[]; related: string[] };
const DICT = dictionary as Record<string, Result>;

// 문서 조각: 검색 가능한 단어는 queries 를 가진다.
// queries[0] = 1회 누름, queries[1] = 2회 누름(앞 어절 포함)...
// stem = 커서가 놓이는 위치까지의 글자, rest = 커서 뒤 조사·어미
// prefix = 2회 누름 때 함께 선택되는 앞 어절 (국정 감사의 "국정 ")
// spaced = 표제어가 없을 때 안내할 띄어 쓴 표기 (사실확인 → 사실 확인)
type Target = { id: string; prefix?: string; stem: string; rest: string; queries: string[]; spaced?: string };
type Segment = { text: string } | Target;

const DOCUMENT: Segment[][] = [
  [
    { text: "위원장: 회의를 시작하겠습니다. 발언하지 않는 위원은 " },
    { id: "eumsogeo", stem: "음소거", rest: "해 주시기 바랍니다.", queries: ["음소거"] },
  ],
  [
    { text: "오늘 안건은 " },
    { id: "gahae", stem: "가해학생", rest: " 분리 조치에 관한 건입니다.", queries: ["가해학생"] },
  ],
  [
    { text: "증인 진술은 " },
    { id: "sasil", stem: "사실확인", rest: " 후 ", queries: ["사실확인"], spaced: "사실 확인" },
    { id: "hoeuirok", stem: "회의록", rest: "에 싣겠습니다.", queries: ["회의록"] },
  ],
  [
    { text: "이번 " },
    { id: "gamsa", prefix: "국정 ", stem: "감사", rest: "에서 지적된 사항입니다.", queries: ["감사", "국정 감사"] },
  ],
];

const TARGETS = DOCUMENT.flat().filter((s): s is Target => "id" in s);
const HOTKEY = "F3";
// 실제 앱과 같은 방식: 마지막 누름 뒤 잠깐 기다렸다가 한 번만 검색
const EXPANSION_DEBOUNCE_MS = 320;

// 표제어 표기 → 띄어쓰기 판정
//   공백 = 띄어 씀, ^ = 띄어 씀 원칙·붙여 씀 허용, 그 외 = 붙여 씀('-' 는 구성 경계 표시일 뿐)
//   표제어가 없으면 = 한 단어가 아니므로 단어마다 띄어 씀 (한글 맞춤법 제2항)
type Verdict = {
  kind: "space" | "allowed" | "attached" | "none";
  label: string;
  forms: string[]; // 맞는 표기 (첫 번째가 원칙)
  explain: string;
};

function judge(typed: string, result: Result, spaced?: string): Verdict {
  const entry = result.entries[0];
  if (!entry) {
    return {
      kind: "none",
      label: "검색되지 않음 → 띄어 씀",
      forms: [spaced ?? typed],
      explain:
        "우리말샘에 한 단어로 올라 있지 않은 말입니다. 사전에 없는 말은 단어마다 띄어 쓰는 것이 원칙입니다(한글 맞춤법 제2항). 이 말이 들어간 표제어에서도 따로 띄어 쓰여 있습니다.",
    };
  }
  const word = entry.word;
  if (word.includes("^")) {
    return {
      kind: "allowed",
      label: "띄어 씀 원칙 · 붙여 씀 허용",
      forms: [word.replace(/\^/g, " "), word.replace(/\^/g, "")],
      explain: "표제어의 ^ 표시는 띄어 쓰는 것이 원칙이고, 붙여 써도 된다는 뜻입니다.",
    };
  }
  if (word.includes(" ")) {
    return {
      kind: "space",
      label: "띄어 씀",
      forms: [word],
      explain: "표제어가 띄어 쓰여 있습니다. 붙여 쓰지 않고 이대로 띄어 씁니다.",
    };
  }
  return {
    kind: "attached",
    label: "붙여 씀 · 한 단어",
    forms: [word.replace(/-/g, "")],
    explain: word.includes("-")
      ? "한 단어로 올라 있습니다. 표제어의 - 표시는 단어의 짜임을 보여 줄 뿐이고 붙여 씁니다."
      : "한 단어로 올라 있으므로 붙여 씁니다.",
  };
}

// 조사 고르기: 마지막 글자 받침 유무 (과/와, 으로/로 — ㄹ 받침은 '로')
function josa(word: string, withBatchim: string, without: string): string {
  const code = (word.at(-1) ?? "").charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return without;
  const jong = code % 28;
  if (without === "로" && jong === 8) return without;
  return jong ? withBatchim : without;
}

const VERDICT_STYLE: Record<Verdict["kind"], string> = {
  space: "bg-danger/12 text-danger",
  none: "bg-danger/12 text-danger",
  allowed: "bg-accent-soft text-accent",
  attached: "bg-success/15 text-success",
};

export function HudDemo() {
  const [caretId, setCaretId] = useState("eumsogeo");
  const [result, setResult] = useState<{ query: string; data: Result; target: Target } | null>(null);
  const [checked, setChecked] = useState<Record<string, boolean>>({}); // 확인한 단어 → 문서 표기가 맞는지
  const [pressCount, setPressCount] = useState(0); // 연타 누적 (표시용)
  const [selectedLevel, setSelectedLevel] = useState(0); // 선택 하이라이트 범위
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef(0);
  const docRef = useRef<HTMLDivElement>(null);

  const target = TARGETS.find((t) => t.id === caretId) ?? TARGETS[0];
  const verdict = result ? judge(result.query, result.data, result.target.spaced) : null;
  const typedOk = verdict ? verdict.forms.includes(result!.query) : false;

  const press = useCallback(() => {
    pendingRef.current += 1;
    const level = Math.min(pendingRef.current, target.queries.length);
    setPressCount(pendingRef.current);
    setSelectedLevel(level);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const query = target.queries[level - 1];
      const data = DICT[query] ?? { entries: [], related: [] };
      setResult({ query, data, target });
      // 문서 표기 검사는 가장 넓게 확인한 범위 기준으로 기록 (밑줄 표시용)
      if (level === target.queries.length) {
        const v = judge(query, data, target.spaced);
        setChecked((prev) => ({ ...prev, [target.id]: v.forms.includes(query) }));
      }
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
          aria-label={`체험용 문서. 단어를 고른 뒤 ${HOTKEY} 키를 누르면 띄어쓰기를 확인할 수 있습니다.`}
          onKeyDown={onKeyDown}
          className="px-5 py-6 outline-none focus-visible:ring-2 focus-visible:ring-accent/40 sm:px-8 sm:py-8"
        >
          <div className="space-y-4 text-[17px] leading-9 text-foreground sm:text-lg">
            {DOCUMENT.map((para, pi) => (
              <p key={pi} className="ko-copy">
                {para.map((seg, si) => {
                  if ("text" in seg) return <span key={si}>{seg.text}</span>;
                  const isCaret = seg.id === caretId;
                  const ok = checked[seg.id];
                  // 확인 전: 점선 밑줄 / 확인 후: 고칠 곳은 빨간 물결, 맞으면 초록 실선
                  const mark =
                    ok === undefined
                      ? "decoration-accent/30 decoration-dotted"
                      : ok
                        ? "decoration-success/60"
                        : "decoration-danger decoration-wavy";
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
                            : `underline underline-offset-[6px] hover:bg-accent-soft ${mark}`
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

          {/* 판정 카드 — HUD 의 표제어 표기를 풀어 읽어 주는 체험판 설명 */}
          {result && verdict ? (
            <div className="mt-6 rounded-lg border border-border bg-panel px-4 py-4 sm:px-5" aria-live="polite">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${VERDICT_STYLE[verdict.kind]}`}>
                  {verdict.label}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">표기 읽는 법</span>
              </div>
              <p className="ko-heading mt-3 text-2xl font-black tracking-[-0.02em]">
                {verdict.forms.map((form, i) => (
                  <span key={form}>
                    {i > 0 && <span className="mx-2 text-base font-medium text-muted">또는</span>}
                    {form}
                  </span>
                ))}
              </p>
              <p className="ko-copy mt-2 text-sm leading-6 text-muted">{verdict.explain}</p>
              <p className="ko-copy mt-3 border-t border-dashed border-border pt-3 text-sm leading-6">
                문서 표기 <strong>&lsquo;{result.query}&rsquo;</strong>{" "}
                {typedOk ? (
                  <span className="font-bold text-success">→ 맞게 썼습니다.</span>
                ) : (
                  <span className="font-bold text-danger">→ &lsquo;{verdict.forms[0]}&rsquo;{josa(verdict.forms[0], "으로", "로")} 고쳐야 합니다.</span>
                )}
              </p>
            </div>
          ) : (
            <p className="ko-copy mt-6 text-sm leading-6 text-muted">
              {target.queries.length > 1 ? (
                <>
                  <strong className="text-foreground">{target.stem}</strong> 뒤에서 {HOTKEY}를 빠르게 두 번 누르면
                  앞 어절까지 넓혀 <strong className="text-foreground">{target.queries[1]}</strong>를 확인합니다.
                </>
              ) : (
                <>붙여 쓸지 띄어 쓸지 헷갈리는 단어 뒤에서 {HOTKEY}를 눌러 보세요.</>
              )}
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

        {/* HUD — 실제 앱처럼 우리말샘 표제어를 표기 그대로 보여주는 작은 어두운 창 */}
        <aside className="border-t border-border bg-ink p-5 text-white md:border-l md:border-t-0">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
            <span>낱말지기 HUD</span>
            <span className={result ? "text-accent" : ""}>{result ? "● 결과" : "대기 중"}</span>
          </div>

          {result ? (
            <div className="mt-4 space-y-5">
              <p className="text-[11px] text-white/45">&ldquo;{result.query}&rdquo; 검색 결과</p>
              {result.data.entries.map((entry, i) => (
                <div key={`${entry.origin}-${i}`} className={i > 0 ? "border-t border-white/10 pt-4" : ""}>
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <strong className="text-xl">{entry.word}</strong>
                    {entry.origin && <span className="text-sm text-white/55">{entry.origin}</span>}
                  </div>
                  <p className="ko-copy mt-2 text-sm leading-6 text-white/75">
                    {entry.pos && <span className="mr-1.5 text-[11px] text-white/45">「{entry.pos}」</span>}
                    {entry.definition}
                  </p>
                </div>
              ))}
              {result.data.entries.length === 0 && (
                <div>
                  <p className="ko-copy text-sm leading-6 text-white/75">
                    &lsquo;{result.query}&rsquo;{josa(result.query, "과", "와")} 똑같은 표제어는 없습니다. 이 말이 들어간 표제어:
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    {result.data.related.map((w) => (
                      <li key={w} className="text-[15px] font-bold text-white/90">{w}</li>
                    ))}
                  </ul>
                </div>
              )}
              <p className="font-mono text-[10px] text-white/35">출처 · 국립국어원 우리말샘</p>
            </div>
          ) : (
            <p className="ko-copy mt-4 text-sm leading-6 text-white/50">
              문서에서 <span className="text-white/80">{target.stem}</span> 뒤에 커서가 있습니다.
              <br />
              {HOTKEY}를 누르면 여기에 우리말샘 표제어가 뜹니다.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
