import Link from "next/link";
import type { Metadata } from "next";
import { OPENCHAT } from "@/config/community";

export const metadata: Metadata = {
  title: "처음 사용 가이드 — 속플레이어",
  description: "속플레이어 설치, 라이선스 등록, 단축키 선택과 여러 녹음 연결 방법을 영상으로 확인하세요.",
  alternates: { canonical: "/sog-player/help" },
};

export default function SogPlayerHelpPage() {
  return (
    <main className="sog-theme min-h-full bg-[var(--sog-bg)] text-[var(--sog-text)]">
      <div className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <Link href="/sog-player" className="text-sm font-bold text-[var(--sog-accent)] underline underline-offset-4">← 속플레이어 소개</Link>
        <p className="mt-10 font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">First steps · 03:00</p>
        <h1 className="ko-heading mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">처음 실행부터 실제 작업까지.</h1>
        <p className="ko-copy mt-5 max-w-2xl text-[15px] leading-7 text-white/58">파일 열기, 단축키 선택, 여러 녹음 위치 맞춤과 문서 시간값 사용 방법을 순서대로 확인하세요.</p>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video className="aspect-video w-full bg-black object-contain" controls playsInline preload="metadata" poster="/media/sog-player-guide-poster.png" aria-label="속플레이어 처음 사용 가이드 영상">
            <source src="/media/sog-player-guide.mp4" type="video/mp4" />
            브라우저에서 영상을 재생할 수 없습니다.
          </video>
        </div>

        <ol className="mt-12 divide-y divide-white/10 border-y border-white/10">
          <Step number="01" title="설치와 라이선스 등록" body="카카오톡으로 설치 파일과 라이선스 발급을 문의한 뒤, 최초 실행 화면에 전달받은 키를 등록합니다." />
          <Step number="02" title="단축키 세트 선택" body="처음 실행되는 4단계 안내에서 F키 중심 또는 Ctrl+Alt 조합을 고릅니다. 이후 환경설정에서 모든 키를 바꿀 수 있습니다." />
          <Step number="03" title="녹음 파일 열기" body="여러 파일을 한꺼번에 끌어 놓으면 파일마다 플레이어가 생성됩니다. 녹색 테두리의 메인 플레이어 하나만 재생됩니다." />
          <Step number="04" title="같은 순간 맞추기" body="기준 파일과 다른 파일을 같은 발언에 세운 뒤 목록 창에서 위치 맞춤을 누르면 시간 차이가 저장됩니다." />
          <Step number="05" title="화자와 별표 기록" body="화자 번호로 목소리 기준점을 남기고, 다시 확인할 곳에서는 별 시간값을 문서에 입력합니다." />
        </ol>

        <section className="mt-14 rounded-2xl border border-white/10 bg-[var(--sog-panel)] p-7 sm:p-9">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">License support</p>
          <h2 className="ko-heading mt-3 text-2xl font-black">라이선스 키가 없거나 등록이 되지 않나요?</h2>
          <p className="ko-copy mt-3 text-sm leading-6 text-white/52">“속플레이어 라이선스 발급 문의”라고 남겨주시면 관리자가 확인 후 안내드립니다.</p>
          <a href={OPENCHAT.url} target="_blank" rel="noopener noreferrer" className="sog-button mt-6">카카오톡으로 문의</a>
        </section>
      </div>
    </main>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return <li className="grid gap-3 py-6 sm:grid-cols-[3rem_1fr] sm:gap-5"><span className="font-mono text-xs font-black text-[var(--sog-accent)]">{number}</span><div><h2 className="ko-heading text-lg font-black">{title}</h2><p className="ko-copy mt-2 text-sm leading-6 text-white/52">{body}</p></div></li>;
}
