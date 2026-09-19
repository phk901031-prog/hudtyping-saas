import { NATMALGI_ONLINE } from "@/config/product";

/**
 * 히어로에서 실제 검색 흐름을 보여주는 정적 시연.
 * 이전엔 격자 배경·스캔라인·떠다니는 패널·검색어 사이클링 애니메이션이 겹겹이
 * 쌓여 있었으나(2026-09-19 재설계), 실제 HUD 화면을 찍은 스크린샷처럼 저모션으로
 * 단순화. 깜빡이는 커서 하나만 남긴다.
 */
export function NatmalgiDemo() {
  return (
    <figure aria-labelledby="natmalgi-demo-title" className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-ink p-4 text-white shadow-lg sm:p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-accent" />

        <div className="rounded-lg border border-white/10 bg-[#0a1519] p-4">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-xs font-semibold text-white/62">문서 작성 중</p>
              <p className="mt-1 text-sm font-bold">커서 앞 검색 시연</p>
            </div>
            <span className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 font-mono text-xs font-bold text-white/85">
              Insert
            </span>
          </div>

          <div className="ko-copy max-w-[72%] space-y-3 text-sm leading-7 text-white/76 sm:max-w-[62%]">
            <p>참석자 의견은 다음 회의에서 다시 검토하기로 하였으며</p>
            <p>
              <span className="rounded bg-white/10 px-1.5 py-0.5">회의 의견 정리</span>
              <span className="typing-caret ml-1 inline-block h-5 w-[2px] translate-y-1 bg-accent" />
              에 따라 후속 조치를 진행한다.
            </p>
          </div>

          <div className="mt-5 rounded-lg border border-white/14 bg-[#041012] p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="text-xs font-bold text-white/58">낱말지기 온라인</span>
              <span className="rounded bg-accent/22 px-2 py-0.5 text-[11px] font-bold text-[#f3cbb8]">
                커서 앞 검색
              </span>
            </div>

            <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
              <p className="text-[11px] font-bold tracking-[0.08em] text-white/58">검색어 확장</p>
              <p className="mt-1 text-xl font-bold">회의 의견 정리</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                <span className="block h-full w-full rounded-full bg-accent" />
              </div>
            </div>

            <div className="mt-4 min-h-[96px]">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-bold text-white">정리</p>
                <span className="text-[10px] text-white/58">명사</span>
              </div>
              <p className="ko-copy mt-2 text-sm leading-6 text-white/78">
                일정한 기준에 따라 내용을 가지런히 바로잡음.
              </p>
              <span className="mt-3 inline-flex rounded border border-white/12 px-2 py-1 text-[10px] font-semibold text-white/64">
                뜻풀이를 누르면 예문 보기
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/62">
              <span>1회 → 2회 → 3회 어절 확장</span>
              <span>23 / {NATMALGI_ONLINE.monthlySearchLimit}회</span>
            </div>
          </div>
        </div>
      </div>
      <figcaption id="natmalgi-demo-title" className="ko-copy px-1 text-center text-xs leading-5 text-muted">
        기능 이해를 위한 화면 시연입니다. 실제 창 크기와 표시는 사용자 설정에 따라 달라질 수 있습니다.
      </figcaption>
    </figure>
  );
}
