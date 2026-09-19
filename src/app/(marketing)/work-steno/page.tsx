import type { Metadata } from "next";
import Image from "next/image";
import { OPENCHAT } from "@/config/community";

export const metadata: Metadata = {
  title: "WORK STENO | 속기사의 작업 방식에 맞춘 음성인식",
  description: "속기사의 실제 작업 환경과 데이터를 토대로 개발 중인 WORK STENO를 소개합니다.",
  alternates: { canonical: "/work-steno" },
};

const WORK_TYPES = ["일반 녹취", "의회·위원회", "학교폭력위원회", "전화·상담", "현장·인터뷰", "방송·미디어"];

export default function WorkStenoPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
      <section className="max-w-3xl" aria-labelledby="work-steno-title">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">Beta testing · Coming soon</p>
        <h1 id="work-steno-title" className="ko-heading mt-5 text-[2.55rem] font-black leading-[1.1] tracking-[-0.04em] sm:text-[4rem]">
          음성을 받아쓰는 도구가 아니라,
          <br />
          <span className="text-accent">속기사의 일을 아는 도구.</span>
        </h1>
        <p className="ko-copy mt-7 max-w-2xl text-lg leading-8 text-foreground/90 sm:text-xl sm:leading-9">
          클로바노트·다글로 같은 범용 음성 기록 서비스가 다양한 사람의 녹음과 정리를 폭넓게 다룬다면,
          WORK STENO는 속기사가 실제로 원고를 만드는 업무 과정에 초점을 맞춥니다.
        </p>
        <p className="ko-copy mt-4 max-w-2xl text-[15px] leading-7 text-muted">
          업무별 속기사의 실제 작업 환경과 데이터를 토대로 개발하고 있으며, 현재 베타테스터와 함께 기능과
          작업 흐름을 검증하고 있습니다. 출시 일정과 이용 방식은 테스트 결과를 반영해 확정합니다.
        </p>
      </section>

      <figure className="mt-12 sm:mt-16">
        <div className="overflow-hidden rounded-xl border border-[#cfd7e4] bg-[#eef2f7] p-2 shadow-[0_20px_60px_rgba(16,24,40,0.12)] sm:p-4">
          <Image
            src="/marketing/work-steno-new-job.png"
            alt="작업 유형과 참고자료를 설정하는 WORK STENO 새 음성 작업 화면"
            width={1366}
            height={768}
            className="h-auto w-full rounded-md border border-[#d8dee8]"
            priority
          />
        </div>
        <figcaption className="mt-3 text-center text-xs leading-5 text-muted">개발 중인 실제 WORK STENO 데스크톱 화면</figcaption>
      </figure>

      <section className="editorial-section" aria-labelledby="difference-title">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">Why Work Steno</p>
        <h2 id="difference-title" className="ko-heading mt-4 max-w-2xl text-3xl font-black leading-tight tracking-[-0.03em] sm:text-4xl">
          음성을 글로 바꾸는 데서 끝나지 않습니다
        </h2>
        <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
          <Feature
            number="01"
            title="업무마다 다른 작업판"
            body="일반, 의회, 학폭위, 통화, 현장, 방송 등 실제 속기 업무에 따라 필요한 설정과 처리 방식을 나눕니다."
          />
          <Feature
            number="02"
            title="자료를 알고 시작하는 인식"
            body="이번 녹음의 참고자료와 반복해서 쓰는 사전 자료를 작업에 연결해 고유명사와 맥락을 더 정확히 다룹니다."
          />
          <Feature
            number="03"
            title="원고가 되기까지의 과정"
            body="화자 구분, 선택형 AI 문맥 교정, 작업 대기열과 중간 산출물 보존까지 실제 납품 과정에 필요한 흐름을 만듭니다."
          />
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="work-types-title">
        <h2 id="work-types-title" className="ko-heading text-2xl font-black tracking-[-0.025em] sm:text-3xl">같은 음성도 업무가 다르면 작업 방식이 다릅니다</h2>
        <div className="mt-7 flex flex-wrap gap-2">
          {WORK_TYPES.map((type) => (
            <span key={type} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-foreground">
              {type}
            </span>
          ))}
          <span className="rounded-full border border-dashed border-accent/60 px-4 py-2 text-sm font-semibold text-accent">사용자 정의</span>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="online-title">
        <div className="overflow-hidden rounded-xl bg-ink px-5 py-8 text-white sm:px-8 sm:py-10">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#e2895f]">Planned online workflow</p>
          <h2 id="online-title" className="ko-heading mt-4 max-w-2xl text-2xl font-black leading-tight tracking-[-0.025em] sm:text-3xl">
            나중에는 온라인에서 내 작업 PC를 호출합니다
          </h2>
          <p className="ko-copy mt-4 max-w-2xl text-[15px] leading-7 text-white/65">
            장소가 달라도 온라인에서 음성과 자료를 등록하면, 연결된 전용 PC가 로컬 음성인식 엔진으로 처리하고
            진행 상태와 결과를 다시 온라인에서 확인하는 흐름을 준비하고 있습니다.
          </p>
          <ol className="mt-8 grid gap-7 border-t border-white/15 pt-7 sm:grid-cols-3">
            <Step number="01" title="온라인에서 작업 접수" body="음성, 업무 유형, 참고자료를 등록합니다." />
            <Step number="02" title="내 PC에서 안전하게 처리" body="연결된 전용 PC가 작업을 받아 변환합니다." />
            <Step number="03" title="상태와 결과 확인" body="대기·진행·완료 상태와 결과를 온라인에서 확인합니다." />
          </ol>
        </div>
      </section>

      <section className="editorial-section" aria-labelledby="beta-title">
        <div className="border-y border-border py-9 sm:py-11">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.16em] text-accent">Now in beta</p>
          <h2 id="beta-title" className="ko-heading mt-3 text-2xl font-black tracking-[-0.025em] sm:text-3xl">현장의 속기사와 함께 확인하고 있습니다</h2>
          <p className="ko-copy mt-4 max-w-2xl text-[15px] leading-7 text-muted">
            지금은 베타테스터가 실제 작업에 사용하며 업무 유형별 흐름, 인식 결과, 자료 적용 방식을 검증하는 단계입니다.
            확정되지 않은 일정이나 요금은 먼저 약속하지 않고, 준비되는 내용부터 공개하겠습니다.
          </p>
          <a href={OPENCHAT.url} target="_blank" rel="noopener noreferrer" className="editorial-button mt-6 inline-flex">
            개발 소식 받기
          </a>
        </div>
      </section>
    </main>
  );
}

function Feature({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <article className="bg-background p-6 sm:p-7">
      <span className="font-mono text-xs font-bold text-accent">{number}</span>
      <h3 className="ko-heading mt-5 text-lg font-bold">{title}</h3>
      <p className="ko-copy mt-3 text-[15px] leading-7 text-muted">{body}</p>
    </article>
  );
}

function Step({ number, title, body }: { number: string; title: string; body: string }) {
  return (
    <li>
      <span className="font-mono text-xs font-bold text-[#e2895f]">{number}</span>
      <h3 className="ko-heading mt-2 text-base font-bold">{title}</h3>
      <p className="ko-copy mt-2 text-sm leading-6 text-white/60">{body}</p>
    </li>
  );
}
