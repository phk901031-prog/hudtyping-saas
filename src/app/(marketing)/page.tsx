import Link from "next/link";
import type { Metadata } from "next";
import { ProductLaunchNotice } from "@/components/marketing/product-launch-notice";

export const metadata: Metadata = {
  title: "PlaySteno — 속기사의 검색과 청취, 기록을 잇는 도구",
  description:
    "문서 위에서 띄어쓰기를 확인하는 낱말지기와 여러 녹음의 화자·별표 구간을 연결하는 속플레이어를 만나보세요.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "PlaySteno",
    title: "PlaySteno — 기록 작업의 흐름을 잇는 도구",
    description: "문서 위에서는 낱말지기, 녹음 작업에서는 속플레이어.",
  },
};

export default function HomePage() {
  return (
    <main>
      <ProductLaunchNotice />

      <section className="mx-auto w-full max-w-6xl px-5 pb-14 pt-14 sm:px-8 sm:pb-20 sm:pt-20">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-muted">
          Tools for stenographers
        </p>
        <h1 className="ko-heading mt-5 max-w-4xl text-[2.65rem] font-black leading-[1.1] tracking-[-0.045em] sm:text-[4.6rem]">
          검색과 청취, 기록의 흐름을
          <br className="hidden sm:block" /> 끊지 않는 도구.
        </h1>
        <p className="ko-copy mt-7 max-w-2xl text-lg leading-8 text-foreground/80 sm:text-xl sm:leading-9">
          문서 위에서는 낱말지기로 표기를 확인하고, 녹음 작업에서는 속플레이어로 화자와 별표 구간을 다시 듣습니다.
          플레이스테노는 속기사의 실제 작업 순서를 기준으로 도구를 만듭니다.
        </p>
      </section>

      <section aria-labelledby="products-title" className="mx-auto w-full max-w-6xl px-5 pb-20 sm:px-8 sm:pb-28">
        <h2 id="products-title" className="sr-only">플레이스테노 제품</h2>
        <div className="grid overflow-hidden rounded-3xl border border-border lg:grid-cols-2">
          <article className="flex min-h-[520px] flex-col bg-card p-7 sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-accent">Word keeper</p>
              <span className="rounded-full border border-border px-3 py-1 font-mono text-[10px] font-bold text-muted">WINDOWS</span>
            </div>
            <div className="mt-16 sm:mt-24">
              <p className="ko-copy text-sm font-bold text-muted">문서 위에서 바로 확인하는 우리말샘 표기</p>
              <h3 className="ko-heading mt-4 text-4xl font-black leading-[1.16] tracking-[-0.04em] sm:text-5xl">
                띄어 쓸까,
                <br />붙여 쓸까.
              </h3>
              <p className="ko-copy mt-5 max-w-md text-[15px] leading-7 text-muted">
                헷갈리는 단어 뒤에서 지정한 키를 누르면 작업 중인 문서 위에 우리말샘 표제어가 나타납니다.
                커서를 옮기지 않고 확인한 뒤 바로 이어서 입력하세요.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-12">
              <Link href="/wordkeeper" className="editorial-button">낱말지기 알아보기</Link>
              <Link href="/wordkeeper#try" className="text-sm font-bold text-accent underline underline-offset-4">
                여기서 체험하기 →
              </Link>
            </div>
          </article>

          <article className="sog-theme flex min-h-[520px] flex-col bg-[var(--sog-bg)] p-7 text-[var(--sog-text)] sm:p-10">
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">SOG Player</p>
              <span className="rounded-full border border-white/15 px-3 py-1 font-mono text-[10px] font-bold text-white/55">WINDOWS · LOCAL</span>
            </div>
            <div className="mt-16 sm:mt-24">
              <p className="ko-copy text-sm font-bold text-white/55">듣던 순간을 문서에 남기고 다시 재생</p>
              <h3 className="ko-heading mt-4 text-4xl font-black leading-[1.16] tracking-[-0.04em] sm:text-5xl">
                별표를 남기고,
                <br />그 순간을 듣습니다.
              </h3>
              <p className="ko-copy mt-5 max-w-md text-[15px] leading-7 text-white/65">
                여러 녹음의 시간을 맞추고 화자 기준점을 기록합니다. 한글 문서에 남긴 별 시간값에서 해당 발언을 바로 듣고,
                다음 별표를 순서대로 검수하세요.
              </p>
            </div>
            <div className="mt-auto flex flex-wrap items-center gap-4 pt-12">
              <Link href="/sog-player" className="sog-button">속플레이어 알아보기</Link>
              <Link href="/sog-player#film" className="text-sm font-bold text-[var(--sog-accent)] underline decoration-white/25 underline-offset-4">
                2분 영상 보기 →
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-panel">
        <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-12 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:items-center md:py-16">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">One workflow</p>
            <h2 className="ko-heading mt-3 text-2xl font-black tracking-[-0.03em] sm:text-3xl">도구보다 작업이 먼저입니다.</h2>
          </div>
          <p className="ko-copy text-[15px] leading-7 text-muted">
            낱말지기는 입력 중인 문서를 떠나지 않게 하고, 속플레이어는 확인해야 할 음성 위치를 잃지 않게 합니다.
            두 제품은 기능을 늘리는 대신 속기사의 반복 동작을 줄이는 데 집중합니다.
          </p>
        </div>
      </section>
    </main>
  );
}
