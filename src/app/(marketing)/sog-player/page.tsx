import Link from "next/link";
import type { Metadata } from "next";
import { OPENCHAT } from "@/config/community";
import { SogPlayerOverviewVideo } from "@/components/guides/sog-player-overview-video";

export const metadata: Metadata = {
  title: "속플레이어 — 화자와 별표 구간을 연결하는 속기사용 미디어 플레이어",
  description:
    "여러 녹음의 시간을 맞추고 화자 기준점을 기록하며, 한글 문서에 남긴 별 시간값에서 해당 발언을 바로 듣고 순서대로 검수하는 Windows 로컬 미디어 플레이어.",
  alternates: { canonical: "/sog-player" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/sog-player",
    siteName: "PlaySteno",
    title: "속플레이어 — 별표를 남기고, 그 순간을 듣습니다",
    description: "여러 녹음 정렬부터 화자 기록, 별표 구간 바로 듣기와 순차 검수까지.",
  },
};

const WORKFLOW = [
  { number: "01", title: "녹음을 맞추고", body: "시작 시각이 다른 파일에서 같은 발언을 찾은 뒤 위치 맞춤을 누릅니다." },
  { number: "02", title: "화자를 기록하고", body: "목소리가 확실한 순간 화자 번호를 눌러 회의 전체의 기준점으로 남깁니다." },
  { number: "03", title: "별표를 남기고", body: "다시 확인할 순간을 한글 문서와 마커 창에 동시에 기록합니다." },
  { number: "04", title: "바로 듣고 검수합니다", body: "문서의 별표에서 음성을 재생하고 다음 별표를 순서대로 확인합니다." },
] as const;

export default function SogPlayerPage() {
  return (
    <main className="sog-theme bg-[var(--sog-bg)] text-[var(--sog-text)]">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="sog-grid absolute inset-0 opacity-30" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--sog-accent)]">
            <span>SOG Player</span>
            <span className="text-white/25">·</span>
            <span className="text-white/45">Windows local media tool</span>
          </div>
          <h1 className="ko-heading mt-7 max-w-5xl text-[2.75rem] font-black leading-[1.08] tracking-[-0.05em] sm:text-[5.2rem]">
            듣던 순간을 문서에 남기고,
            <br />별표에서 바로 다시 듣습니다.
          </h1>
          <p className="ko-copy mt-7 max-w-3xl text-lg leading-8 text-white/68 sm:text-xl sm:leading-9">
            녹음기마다 다른 시작 시간을 맞추고, 화자의 목소리를 기록하고, 한글 문서에 남긴 시간값으로 다시 재생합니다.
            듣기와 기록, 검수를 하나의 흐름으로 연결하는 속기사용 로컬 미디어 플레이어입니다.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <a href="#film" className="sog-button">2분 38초로 확인하기</a>
            <a href="#license" className="text-sm font-bold text-white underline decoration-white/25 underline-offset-4">
              설치와 라이선스 안내 ↓
            </a>
          </div>
          <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
            <HeroFact label="녹음 정렬" value="같은 발언 한 번으로" />
            <HeroFact label="문서 연결" value="*** 시간값으로" />
            <HeroFact label="처리 방식" value="사용자 PC 안에서" />
          </div>
        </div>
      </section>

      <section aria-labelledby="workflow-title" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SogHeading eyebrow="The workflow" title="재생 기능이 아니라 작업 흐름을 연결합니다." description="속플레이어의 중심은 여러 파일을 여는 데 있지 않습니다. 찾고, 표시하고, 다시 확인하는 반복 작업을 하나로 잇습니다." />
        <ol className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 md:grid-cols-4">
          {WORKFLOW.map((step) => (
            <li key={step.number} className="bg-[var(--sog-panel)] p-6 sm:p-7">
              <span className="font-mono text-xs font-black text-[var(--sog-accent)]">{step.number}</span>
              <h3 className="ko-heading mt-7 text-xl font-black">{step.title}</h3>
              <p className="ko-copy mt-3 text-sm leading-6 text-white/52">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="film" aria-labelledby="film-title" className="scroll-mt-8 border-y border-white/10 bg-[var(--sog-panel)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:items-start">
            <SogHeading eyebrow="Product film · 02:38" title="원하는 기능부터 바로 확인하세요." description="전체 영상을 보거나 기능 이름을 눌러 해당 장면부터 재생할 수 있습니다." />
            <SogPlayerOverviewVideo />
          </div>
        </div>
      </section>

      <FeatureSection
        number="01"
        eyebrow="Sync recordings"
        title="시작 시각이 달라도 같은 현장 순간으로."
        lead="각 녹음기에서 같은 발언을 한 번 찾아 위치를 맞추면, 이후 다른 파일로 전환해도 같은 현장 시점으로 이동합니다."
        points={["파일마다 독립된 플레이어 생성", "선택한 메인 플레이어 하나만 재생", "파일별 연동을 켜거나 끄기", "기준 녹음 시간으로 별 시간값 기록"]}
      >
        <SyncIllustration />
      </FeatureSection>

      <FeatureSection
        number="02"
        eyebrow="Speaker reference"
        title="목소리가 들리는 순간, 번호만 누르세요."
        lead="화자 1번부터 10번까지 재생을 멈추지 않고 기준점을 남깁니다. 오전·오후처럼 파일이 나뉘어도 한 회의의 기록으로 이어집니다."
        points={["회의 전체에서 화자 기준점 찾기", "같은 화자의 다음 기준점 이어 듣기", "다른 파일이면 메인 플레이어 자동 전환", "확인 후 원래 듣던 위치로 돌아가기"]}
        reverse
      >
        <SpeakerIllustration />
      </FeatureSection>

      <section className="border-y border-white/10 bg-[var(--sog-panel)]">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <SogHeading eyebrow="Star workflow" title="별표 하나가 기록과 음성을 연결합니다." description="작성 중 표시하고, 바로 듣고, 검수할 때 다음 별표로 이동합니다. 세 기능은 같은 시간값을 기준으로 이어집니다." />
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <StarCard number="1" title="별 시간값 입력" shortcut="Ctrl + Alt + T" body="현재 재생 시간을 ***(00:00:00) 형식으로 한글 문서 커서와 마커 창에 함께 기록합니다." />
            <StarCard number="2" title="별 시간값 바로 듣기" shortcut="Ctrl + Alt + G" body="문서의 별 시간값 가까이에 커서를 두면 플레이어가 해당 시간으로 이동해 바로 재생합니다." />
            <StarCard number="3" title="별 구간 순차 검수" shortcut="Ctrl + Alt + ]" body="다음 별표를 자동으로 찾아 문서 위치와 음성을 함께 이동합니다. 마지막 다음에는 첫 별표로 돌아갑니다." />
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 sm:p-7">
            <p className="font-mono text-xs font-bold text-[var(--sog-accent)]">DOCUMENT</p>
            <p className="ko-copy mt-4 text-base leading-8 text-white/70">
              위원장은 추가 검토가 필요하다고 설명했습니다. <mark className="rounded bg-[var(--sog-accent)]/15 px-2 py-1 font-mono text-[var(--sog-accent)]">***(01:13:42)</mark> 이후 참석자 의견을 확인했습니다.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby="details-title" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <SogHeading eyebrow="Built for long work" title="오래 듣는 작업에 필요한 세부 기능." />
        <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          <Detail title="작업 기록 자동 복원" body="마지막 재생 위치, 볼륨, 화자와 별표 기록을 파일별로 기억합니다. 파일 이름이나 폴더가 바뀌어도 내용 지문으로 다시 찾습니다." />
          <Detail title="작업 묶음 저장" body="여러 파일, 시간 차이, 연동 상태와 창 배치를 .sog 파일 하나로 저장하고 다시 엽니다." />
          <Detail title="음정 보존 배속" body="0.5배부터 4.0배까지 재생 속도를 바꿔도 목소리의 기본 음정은 유지합니다." />
          <Detail title="두 단계 앞뒤 이동" body="짧은 이동과 긴 이동을 따로 정하고, 키를 누르고 있는 동안 연속으로 이동할 수 있습니다." />
          <Detail title="화면 알림 HUD" body="한글 문서의 포커스를 가져오지 않고 배속, 화자 기록과 별표 이동 결과만 짧게 알려줍니다." />
          <Detail title="완전 로컬 작업" body="녹음, 문서 연결 정보와 작업 기록은 사용자의 컴퓨터 안에서 처리하고 보관합니다." />
        </div>
      </section>

      <section id="license" aria-labelledby="license-title" className="scroll-mt-8 border-y border-white/10 bg-[var(--sog-panel)]">
        <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[1fr_0.8fr] lg:items-center">
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">Install & license</p>
            <h2 id="license-title" className="ko-heading mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">설치 후 최초 한 번, 라이선스를 등록합니다.</h2>
            <p className="ko-copy mt-5 max-w-2xl text-[15px] leading-7 text-white/60">
              속플레이어는 최초 실행 시 라이선스 키 등록이 필요합니다. 라이선스 발급과 설치 파일 안내는 카카오톡으로 문의해주세요.
              등록할 때만 인터넷이 필요하며, 인증이 끝난 뒤에는 로컬에서 사용할 수 있도록 준비하고 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a href={OPENCHAT.url} target="_blank" rel="noopener noreferrer" className="sog-button">카카오톡으로 라이선스 문의</a>
              <Link href="/sog-player/help" className="inline-flex items-center text-sm font-bold text-white underline decoration-white/25 underline-offset-4">처음 사용 가이드 →</Link>
            </div>
            <p className="ko-copy mt-5 text-xs leading-5 text-white/40">문의할 때 “속플레이어 라이선스 발급 문의”라고 남겨주시면 확인 후 안내드립니다.</p>
          </div>
          <ol className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-black/15 px-6">
            <LicenseStep number="1" text="카카오톡으로 설치와 라이선스 발급 문의" />
            <LicenseStep number="2" text="안내받은 Windows 설치 파일 실행" />
            <LicenseStep number="3" text="최초 실행 화면에 전달받은 키 등록" />
          </ol>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-6 rounded-2xl border border-white/10 p-7 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">Also by PlaySteno</p>
            <h2 className="ko-heading mt-3 text-2xl font-black">문서 위에서 띄어쓰기를 바로 확인하고 싶다면.</h2>
            <p className="ko-copy mt-3 text-sm leading-6 text-white/52">낱말지기는 우리말샘 표제어를 작업 중인 문서 위 작은 창으로 보여줍니다.</p>
          </div>
          <Link href="/wordkeeper" className="text-sm font-bold text-[var(--sog-accent)] underline underline-offset-4">낱말지기 알아보기 →</Link>
        </div>
      </section>
    </main>
  );
}

function HeroFact({ label, value }: { label: string; value: string }) {
  return <div className="bg-[var(--sog-panel)] p-5 sm:p-6"><p className="text-xs text-white/40">{label}</p><p className="ko-heading mt-2 font-bold">{value}</p></div>;
}

function SogHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return <div><p className="font-mono text-[11px] font-black uppercase tracking-[0.16em] text-[var(--sog-accent)]">{eyebrow}</p><h2 className="ko-heading mt-4 text-3xl font-black tracking-[-0.035em] sm:text-4xl">{title}</h2>{description && <p className="ko-copy mt-4 max-w-2xl text-[15px] leading-7 text-white/55">{description}</p>}</div>;
}

function FeatureSection({ number, eyebrow, title, lead, points, reverse = false, children }: { number: string; eyebrow: string; title: string; lead: string; points: readonly string[]; reverse?: boolean; children: React.ReactNode }) {
  return <section className="mx-auto grid w-full max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-2 lg:items-center"><div className={reverse ? "lg:order-2" : ""}><p className="font-mono text-xs font-black text-[var(--sog-accent)]">{number} · {eyebrow}</p><h2 className="ko-heading mt-5 text-3xl font-black tracking-[-0.035em] sm:text-4xl">{title}</h2><p className="ko-copy mt-5 text-[15px] leading-7 text-white/58">{lead}</p><ul className="mt-7 space-y-3">{points.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-white/65"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-[var(--sog-accent)]" />{point}</li>)}</ul></div><div className={reverse ? "lg:order-1" : ""}>{children}</div></section>;
}

function SyncIllustration() {
  return <div className="space-y-3 rounded-2xl border border-white/10 bg-[var(--sog-panel)] p-5 sm:p-7">{[["1", "녹음기 A · 기준", "00:24:18"], ["2", "녹음기 B · +00:57:00", "01:21:18"], ["3", "녹음기 C · -00:02:14", "00:22:04"]].map(([n, label, time], index) => <div key={n} className={`rounded-xl border p-4 ${index === 0 ? "border-[var(--sog-accent)] bg-[var(--sog-accent)]/5" : "border-white/10 bg-black/15"}`}><div className="flex items-center justify-between gap-4"><p className="text-sm font-bold"><span className="mr-3 text-[var(--sog-accent)]">{n}</span>{label}</p><time className="font-mono text-sm text-white/55">{time}</time></div><div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/8"><div className="h-full rounded-full bg-[var(--sog-accent)]" style={{ width: `${64 - index * 8}%` }} /></div></div>)}</div>;
}

function SpeakerIllustration() {
  return <div className="rounded-2xl border border-white/10 bg-[var(--sog-panel)] p-5 sm:p-7"><div className="grid grid-cols-5 gap-2">{Array.from({ length: 10 }, (_, index) => <div key={index} className={`flex aspect-square items-center justify-center rounded-lg border font-mono text-sm font-black ${index === 3 ? "border-[var(--sog-accent)] bg-[var(--sog-accent)] text-[var(--sog-bg)]" : "border-white/10 bg-black/15 text-white/45"}`}>{index + 1}</div>)}</div><div className="mt-6 space-y-2">{["오전.mp3 · 00:18:42", "오후.mp3 · 00:04:16", "오후.mp3 · 01:27:03"].map((item, index) => <div key={item} className="flex items-center justify-between rounded-lg bg-black/15 px-4 py-3 text-sm text-white/58"><span>{item}</span><span className="text-[var(--sog-accent)]">▶{index + 1}</span></div>)}</div></div>;
}

function StarCard({ number, title, shortcut, body }: { number: string; title: string; shortcut: string; body: string }) {
  return <article className="rounded-2xl border border-white/10 bg-black/15 p-6"><div className="flex items-center justify-between gap-4"><span className="flex size-8 items-center justify-center rounded-full bg-[var(--sog-accent)] font-mono text-sm font-black text-[var(--sog-bg)]">{number}</span><span className="font-mono text-[10px] font-bold text-white/35">{shortcut}</span></div><h3 className="ko-heading mt-7 text-xl font-black">{title}</h3><p className="ko-copy mt-3 text-sm leading-6 text-white/52">{body}</p></article>;
}

function Detail({ title, body }: { title: string; body: string }) {
  return <article className="border-t border-white/12 pt-5"><h3 className="ko-heading text-lg font-black">{title}</h3><p className="ko-copy mt-3 text-sm leading-6 text-white/52">{body}</p></article>;
}

function LicenseStep({ number, text }: { number: string; text: string }) {
  return <li className="flex gap-4 py-5"><span className="font-mono text-xs font-black text-[var(--sog-accent)]">{number.padStart(2, "0")}</span><p className="ko-copy text-sm font-bold leading-6 text-white/70">{text}</p></li>;
}
