// 포털 홈 카테고리 밴드용 다크 미리보기 패널 3종.
// natmalgi-demo.tsx 의 다크(bg-ink)+screen-grid+scan-line 톤과 애니메이션(query-cycle,
// search-progress)을 그대로 재사용해서, 실제 낱말지기 페이지로 넘어갔을 때와 같은
// 움직임이 느껴지도록 한다 — 제네릭 정적 아이콘 카드가 아니라 살아있는 화면처럼.

import type { ReactNode } from "react";

function PanelShell({
  accentClass,
  children,
}: {
  accentClass: string;
  children: ReactNode;
}) {
  return (
    <div
      aria-hidden="true"
      className="hud-stage tech-shell relative min-h-[220px] overflow-hidden rounded-xl border border-white/12 bg-ink p-4 text-white shadow-[0_20px_60px_rgba(5,18,26,0.35)]"
    >
      <div className={`absolute inset-x-0 top-0 h-1 ${accentClass}`} />
      <div className="screen-grid absolute inset-0 opacity-20" />
      <div className="scan-line absolute inset-x-6 top-8 h-10 rounded-full opacity-40" />
      <div className="relative flex h-full flex-col rounded-lg border border-white/10 bg-[#0a1519]/96 p-4">
        {children}
      </div>
    </div>
  );
}

export function WorkStenoMockup() {
  return (
    <PanelShell accentClass="bg-accent">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="text-xs font-bold text-white/58">낱말지기 온라인</p>
        <span className="key-press rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white/85">
          Insert
        </span>
      </div>

      <div className="mt-3">
        <p className="text-[10px] font-bold tracking-[0.08em] text-white/58">검색어 확장</p>
        <div className="query-cycle mt-1 h-6 overflow-hidden text-lg font-bold">
          <span className="cycle-item cycle-item-1">정리</span>
          <span className="cycle-item cycle-item-2">의견 정리</span>
          <span className="cycle-item cycle-item-3">회의 의견 정리</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="search-progress block h-full rounded-full bg-accent" />
        </div>
      </div>

      <div className="mt-3 flex-1">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-base font-bold text-white">정리</p>
          <span className="text-[10px] text-white/58">명사</span>
        </div>
        <p className="ko-copy mt-2 text-xs leading-6 text-white/78">
          일정한 기준에 따라 내용을 가지런히 바로잡음.
        </p>
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[10px] text-white/62">
        <span className="inline-flex items-center gap-1.5">
          <span className="status-led" />
          한글 문서 위에서 즉시
        </span>
      </div>
    </PanelShell>
  );
}

export function PlayStenoMockup() {
  return (
    <PanelShell accentClass="bg-signal">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="text-xs font-bold text-white/58">속기 타자 게임 · 단문</p>
        <span className="key-press rounded-md border border-white/15 bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white/85">
          진행 중
        </span>
      </div>
      <div className="mt-3 flex-1 font-mono text-sm leading-7">
        <span className="text-white/85">오늘도 </span>
        <span className="text-success">회의록을</span>{" "}
        <span className="rounded bg-danger/40 px-0.5 text-white">저장</span>{" "}
        <span className="text-white/30">하고 퇴근한다.</span>
        <span className="typing-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-signal" />
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/78">
        <span className="font-mono font-bold text-white">212타/분</span>
        <span className="font-mono text-white/58">정확도 97%</span>
      </div>
    </PanelShell>
  );
}

// 보고치기 페이스메이커처럼 문장이 점점 길게 노출되는 걸 흉내낸다 —
// query-cycle/cycle-item(natmalgi-demo 에서 검색어 확장에 쓰던 것과 동일 메커니즘)을
// "짧은 조각 → 중간 → 전체 문장" 3단계로 재사용.
export function StudyStenoMockup() {
  return (
    <PanelShell accentClass="bg-success">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <p className="text-xs font-bold text-white/58">보고치기 연습</p>
        <span className="rounded bg-success/22 px-2 py-0.5 text-[10px] font-bold text-[#bdf5cf]">
          190자 / 분
        </span>
      </div>
      <div className="query-cycle mt-3 min-h-[3.25rem] flex-1 text-xs leading-6 text-white/78">
        <span className="cycle-item cycle-item-1 ko-copy">소식통들에 따르면</span>
        <span className="cycle-item cycle-item-2 ko-copy">
          소식통들에 따르면 삼성전자는 지난달 4나노 공정으로
        </span>
        <span className="cycle-item cycle-item-3 ko-copy">
          소식통들에 따르면 삼성전자는 지난달 4나노 공정으로 생산되는 반도체
          가격을 인상했다.
        </span>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-[48%] rounded-full bg-success" />
        </div>
        <div className="mt-2 flex items-center justify-between text-[10px] text-white/58">
          <span>오자 · 탈자 · 첨자로 채점</span>
          <span>대한상공회의소 채점기준</span>
        </div>
      </div>
    </PanelShell>
  );
}
