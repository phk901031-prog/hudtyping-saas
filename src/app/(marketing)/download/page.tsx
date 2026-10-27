import Link from "next/link";
import type { Metadata } from "next";
import { OPENCHAT } from "@/config/community";

export const metadata: Metadata = {
  title: "Windows 프로그램 — PlaySteno",
  description: "낱말지기와 속플레이어 Windows 프로그램 설치 안내.",
  alternates: { canonical: "/download" },
};

export default function DownloadPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-muted">Windows tools</p>
      <h1 className="ko-heading mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">설치할 프로그램을 선택하세요.</h1>
      <p className="ko-copy mt-5 max-w-2xl text-[15px] leading-7 text-muted">두 제품은 설치와 등록 방식이 다릅니다. 필요한 작업에 맞는 제품을 확인한 뒤 진행해주세요.</p>

      <div className="mt-12 grid gap-5 md:grid-cols-2">
        <article className="rounded-2xl border border-border bg-card p-7 sm:p-8">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-accent">Word keeper</p>
          <h2 className="ko-heading mt-4 text-2xl font-black">낱말지기</h2>
          <p className="ko-copy mt-3 min-h-20 text-sm leading-6 text-muted">가입 승인 후 일회용 연결 코드를 발급해 Windows 앱과 계정을 연결합니다.</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <Link href="/download/windows" className="editorial-button">설치 파일 받기</Link>
            <Link href="/wordkeeper" className="text-sm font-bold text-accent underline underline-offset-4 self-center">제품 설명 →</Link>
          </div>
        </article>

        <article className="sog-theme rounded-2xl border border-white/10 bg-[var(--sog-bg)] p-7 text-[var(--sog-text)] sm:p-8">
          <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">SOG Player</p>
          <h2 className="ko-heading mt-4 text-2xl font-black">속플레이어</h2>
          <p className="ko-copy mt-3 min-h-20 text-sm leading-6 text-white/55">최초 실행 시 관리자가 전달한 라이선스 키를 등록합니다. 설치 파일과 라이선스 발급은 카카오톡으로 문의해주세요.</p>
          <div className="mt-7 flex flex-wrap gap-4">
            <a href={OPENCHAT.url} target="_blank" rel="noopener noreferrer" className="sog-button">설치·라이선스 문의</a>
            <Link href="/sog-player" className="self-center text-sm font-bold text-[var(--sog-accent)] underline underline-offset-4">제품 설명 →</Link>
          </div>
        </article>
      </div>
    </main>
  );
}
