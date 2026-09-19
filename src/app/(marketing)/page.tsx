// src/app/(marketing)/page.tsx
// 낱말지기 랜딩 페이지 — 홈 그 자체. Play/Study Steno 포털 컨셉은 걷어내고
// 다시 낱말지기 단일 제품 사이트로 되돌림 (2026-08-26). 이전에 /work/natmalgi 에
// 있던 페이지를 그대로 홈으로 옮긴 것 — 히어로 · 시작하기 · 작동방식 · 특징 ·
// 지원 · 업데이트 · FAQ.
//
// 2026-09-19: "AI 스타트업 느낌" 제거 재설계. 남색 풀블리드 배너 3개(히어로·작동방식·
// 최종 CTA)를 전부 크림 배경으로 바꾸고, 어두운 톤은 실제 HUD 화면을 보여주는
// 데모 조각에만 남겼다. 아이콘 배지 기능 그리드는 구분선 기반 텍스트 목록으로,
// FAQ 아코디언은 항상 펼쳐진 정적 Q&A 블록으로 바꿨다.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Sparkles } from "lucide-react";
import { auth } from "@/infrastructure/clerk";
import { WINDOWS_RELEASE } from "@/config/release";
import { NATMALGI_ONLINE } from "@/config/product";
import { OPENCHAT } from "@/config/community";
import { fetchReleases } from "@/features/updates/releases";
import { NatmalgiDemo } from "@/components/marketing/natmalgi-demo";

const DOWNLOAD_URL = "/download/windows";

export const metadata: Metadata = {
  title: "낱말지기 온라인 — 문서 위 우리말샘 HUD",
  description:
    "문서 작업을 멈추지 않고 커서 앞 단어의 우리말샘 뜻풀이와 예문을 확인하는 Windows HUD.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "PlaySteno",
    title: "낱말지기 온라인 — 문서 위 우리말샘 HUD",
    description:
      "낱말지기 온라인으로 문서 작업 중 우리말샘 뜻풀이와 예문을 Windows HUD에서 확인하세요.",
  },
};

// 30분 캐시 — releases 데이터도 이 창 안에서 신선.
export const revalidate = 1800;

export default async function NatmalgiPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  const releases = await fetchReleases().catch(() => []);
  const latestRelease = releases[0] ?? null;

  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      {/* ─────────────  1. HERO  ───────────── */}
      <section id="product" className="scroll-mt-28">
        <div className="mx-auto grid w-full max-w-7xl gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-16 xl:min-h-[680px] xl:grid-cols-[minmax(0,1.05fr)_minmax(520px,0.95fr)] xl:items-center xl:gap-14 xl:py-20">
          <div className="flex max-w-3xl flex-col justify-center gap-7 xl:max-w-none">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success/40 bg-success/10 px-3 py-1 font-bold text-success">
                <span className="status-led" />
                무료 베타 운영 중
              </span>
              <span className="text-muted">·</span>
              <span className="font-mono text-muted">
                Windows v{WINDOWS_RELEASE.version}
              </span>
            </div>

            <h1 className="ko-heading font-display text-4xl font-bold leading-[1.12] tracking-tight sm:text-5xl xl:text-[3.5rem]">
              <span className="block">작업 흐름은 그대로,</span>
              <span className="mt-1 block text-accent">필요한 단어는 바로 확인하세요.</span>
            </h1>

            <p className="ko-copy max-w-xl text-lg leading-8 text-foreground/85">
              커서 앞 단어의 뜻풀이와 예문을 작은 HUD에서 확인합니다.
            </p>

            <p className="ko-copy max-w-xl text-sm leading-7 text-muted">
              한글 문서에서 벗어나지 않고 지정 키를 누르면 우리말샘 검색 결과가 표시됩니다.
              연속으로 누르면 앞 어절까지 검색 범위를 넓힐 수 있습니다.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={DOWNLOAD_URL}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-7 py-4 text-base font-bold text-white transition hover:bg-accent-hover"
              >
                낱말지기 다운로드
                <span aria-hidden="true">↓</span>
              </a>
              {!isSignedIn && (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-card px-7 py-4 text-base font-bold text-foreground transition hover:bg-panel"
                >
                  무료로 시작하기
                </Link>
              )}
              {isSignedIn && (
                <Link
                  href="/api-keys"
                  className="inline-flex items-center justify-center rounded-md border border-border bg-card px-7 py-4 text-base font-bold text-foreground transition hover:bg-panel"
                >
                  연결 코드 발급
                </Link>
              )}
            </div>

            <p className="ko-copy text-sm text-muted">
              {NATMALGI_ONLINE.supportedEnvironment} · 승인 계정 전용 · 월 기본 {NATMALGI_ONLINE.monthlySearchLimit}회
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl xl:max-w-none">
            <NatmalgiDemo />
          </div>
        </div>
      </section>

      {/* ─────────────  2. GETTING STARTED  ───────────── */}
      <section id="start" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionIntro
          eyebrow="시작하기"
          title="3단계로 시작합니다"
          description="가입 승인부터 첫 검색까지 순서대로 안내합니다."
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-3 lg:divide-x lg:divide-border">
          <StartStepCard
            number="01"
            title="가입 승인"
            body="이메일과 실명으로 가입하면 관리자가 승인합니다."
            cta={
              isSignedIn
                ? { label: "대시보드", href: "/dashboard" }
                : { label: "가입 승인 요청", href: "/sign-up" }
            }
          />
          <StartStepCard
            number="02"
            title="Windows 앱 다운로드"
            body="최신 설치 파일을 받아 실행합니다."
            cta={{ label: "다운로드", href: DOWNLOAD_URL }}
          />
          <StartStepCard
            number="03"
            title="연결 코드로 앱 연결"
            body="대시보드에서 10분짜리 코드를 받아 앱 설정에 붙여넣으면 끝."
            cta={{
              label: isSignedIn ? "연결 코드 발급" : "로그인",
              href: isSignedIn ? "/api-keys" : "/sign-in",
            }}
          />
        </div>
      </section>

      {/* ─────────────  3. HOW IT WORKS  ───────────── */}
      <section className="border-y border-border bg-panel">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <SectionIntro
            eyebrow="작동 방식"
            title="한글 문서에서, 키 한 번."
            description="복사할 수 있는 커서 앞 텍스트를 가져와 검색하고, 결과를 작업 화면 위 HUD에 표시합니다."
          />

          <div className="mt-12 grid gap-8 lg:grid-cols-3">
            <HowStep
              index="1"
              title="커서 두기"
              caption="검색할 단어 바로 뒤에 커서를 두고"
            >
              <div className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-muted">
                  HWP
                </p>
                <p className="mt-3 font-mono text-sm text-foreground">
                  회의 안건 정리
                  <span className="typing-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-accent" />
                </p>
              </div>
            </HowStep>
            <HowStep
              index="2"
              title="지정 키 한 번"
              caption="F3 · Insert · Pause · F4 등 원하는 키를 설정에서 자유롭게 지정"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-border bg-card py-6">
                <KeyCap>F3</KeyCap>
                <span className="text-xs text-muted">또는</span>
                <KeyCap>Insert</KeyCap>
                <span className="text-xs text-muted">또는</span>
                <KeyCap dim>내가 정한 키</KeyCap>
              </div>
            </HowStep>
            <HowStep
              index="3"
              title="HUD로 결과 확인"
              caption="작은 창에 뜻·품사·예문이 즉시"
            >
              <div className="rounded-lg border border-white/12 bg-[#041012] p-3">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <span className="text-[10px] font-bold text-white/62">
                    낱말지기
                  </span>
                  <span className="rounded bg-accent/22 px-1.5 py-0.5 text-[9px] font-bold text-[#f3cbb8]">
                    정리
                  </span>
                </div>
                <p className="mt-2 text-sm font-bold text-white">정리</p>
                <p className="mt-1 text-xs leading-5 text-white/70">
                  일정한 기준에 따라 내용을 가지런히 바로잡음.
                </p>
              </div>
            </HowStep>
          </div>
        </div>
      </section>

      {/* ─────────────  4. FEATURES  ───────────── */}
      <section id="features" className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionIntro
          eyebrow="주요 기능"
          title="기록 흐름을 지키는 실용적인 기능"
          description="화면을 전환하거나 검색어를 다시 입력하는 반복을 줄였습니다."
        />

        <div className="mt-12 grid gap-x-8 gap-y-8 sm:grid-cols-2 xl:grid-cols-3">
          <FeatureCard
            title="커서 앞 자동 검색"
            body="F3 한 번으로 커서 앞 어절을 안전하게 캡처. 문장부호를 정리하고 클립보드 내용은 원래대로 복원."
          />
          <FeatureCard
            title="뜻풀이별 예문 창"
            body="뜻풀이를 클릭하면 별도 창에 예문. 창 위·아래·좌·우 자유 부착."
          />
          <FeatureCard
            title="글꼴을 지키는 자동수정"
            body="확인된 사전 표기로 문서의 단어를 바로 수정. 붙여넣기 대신 직접 입력해 작업 중인 글꼴을 이어받도록 처리."
          />
          <FeatureCard
            title="내 화면에 맞춘 HUD"
            body="강조색과 HUD 배경색, 투명도와 글자 크기를 조절하고 필요할 때 설정과 창 위치를 초기화."
          />
          <FeatureCard
            title="최근 검색과 키보드 탐색"
            body="최근 검색어를 다시 선택하고 Ctrl+L로 검색창 이동, Esc로 입력과 결과를 빠르게 정리."
          />
          <FeatureCard
            title="자동 업데이트 알림"
            body="새 버전이 나오면 앱 상단에 배너로 안내. 홈페이지에서 변경 내용 확인."
          />
          <FeatureCard
            title="안전한 계정 연결"
            body="API 키 노출 없이 10분짜리 1회용 연결 코드로 앱 계정 연결."
          />
          <FeatureCard
            title="사용량 대시보드"
            body="내 이번 달 검색 수, 최근 검색어, 자주 찾은 단어를 웹에서 바로 확인."
          />
        </div>
      </section>

      {/* ─────────────  5. SUPPORT  ───────────── */}
      <section id="support" className="border-y border-border bg-panel">
        <div className="mx-auto w-full max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
          <OpenChatCard />
        </div>
      </section>

      {/* ─────────────  5.5 LIVE — Updates  ───────────── */}
      <section className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionIntro
          eyebrow="최근 소식"
          title="최근 업데이트"
          description="새 버전과 개선 사항을 확인하세요."
        />

        <div className="mt-12">
          <LatestReleaseCard release={latestRelease} />
        </div>
      </section>

      {/* ─────────────  5.8 FINAL CTA  ───────────── */}
      <section className="border-t border-border bg-panel">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-5 py-20 text-center sm:px-8 lg:py-24">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            낱말지기 온라인
          </p>
          <h2 className="ko-heading font-display max-w-3xl text-3xl leading-tight sm:text-4xl">
            필요한 순간 바로 확인하는 작업 환경을 만들어보세요.
          </h2>
          <p className="ko-copy max-w-xl text-lg leading-8 text-muted">
            무료 베타 기간에는 승인된 계정으로 월 {NATMALGI_ONLINE.monthlySearchLimit}회까지 이용할 수 있습니다.
          </p>
          <a
            href={DOWNLOAD_URL}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-8 py-4 text-base font-bold text-white transition hover:bg-accent-hover"
          >
            낱말지기 다운로드
            <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>

      {/* ─────────────  6. FAQ  ───────────── */}
      <section className="mx-auto w-full max-w-4xl px-5 py-20 sm:px-8 lg:py-24">
        <SectionIntro eyebrow="FAQ" title="자주 묻는 질문" />

        <div className="mt-12 flex flex-col divide-y divide-border">
          <FaqItem question="어떤 편집기에서 되나요?">
            한글(HWP), MS Word, 텍스트 편집기처럼 커서 앞 텍스트를 복사할 수 있는
            Windows 프로그램에서 사용할 수 있습니다. 프로그램의 보안 설정이나 입력 방식에 따라
            텍스트 캡처가 제한될 수 있습니다.
          </FaqItem>
          <FaqItem question="단축키가 안 눌리면?">
            다른 프로그램이 같은 키를 쓰고 있을 수 있어요. HUD 설정에서 Insert · Pause 같은
            평소 잘 안 쓰는 키로 바꾸면 대부분 해결됩니다.
          </FaqItem>
          <FaqItem question="설치할 때 백신이 막아요">
            코드 서명 인증서 확보 전이라 일부 백신·SmartScreen에서 경고가 뜰 수 있습니다.{" "}
            <Link href="/install-help" className="text-accent underline">
              설치 문제 해결 가이드
            </Link>
            에 확인 절차를 정리했습니다.
          </FaqItem>
          <FaqItem question="문의는 어디로?">
            가입 승인 · 사용 문의 · 기능 요청 · 오류 제보 모두 아래 카카오톡 오픈톡방으로
            보내주세요. 관리자만 공지하는 채널이라 알림 소음 없이 새 소식도 함께 받습니다.
          </FaqItem>
        </div>
      </section>
    </main>
  );
}

// ═════════════════════════════════════════════════════════════════
// SECTION HELPERS
// ═════════════════════════════════════════════════════════════════

function SectionIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
        {eyebrow}
      </p>
      <h2 className="ko-heading font-display max-w-3xl text-3xl leading-tight sm:text-4xl lg:text-[2.75rem]">
        {title}
      </h2>
      {description && (
        <p className="ko-copy max-w-2xl text-base leading-7 text-muted sm:text-lg sm:leading-8">
          {description}
        </p>
      )}
    </div>
  );
}

function StartStepCard({
  number,
  title,
  body,
  cta,
}: {
  number: string;
  title: string;
  body: string;
  cta: { label: string; href: string };
}) {
  return (
    <article className="flex flex-col gap-5 lg:px-8 lg:first:pl-0 lg:last:pr-0">
      <span className="font-mono text-4xl font-bold text-muted">
        {number}
      </span>
      <div className="flex flex-col gap-3">
        <h3 className="ko-heading font-display text-2xl leading-tight">{title}</h3>
        <p className="ko-copy text-[15px] leading-7 text-muted">
          {body}
        </p>
      </div>
      <Link
        href={cta.href}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-accent transition hover:text-accent-hover"
      >
        {cta.label}
        <span aria-hidden="true">→</span>
      </Link>
    </article>
  );
}

function KeyCap({
  children,
  dim,
}: {
  children: React.ReactNode;
  dim?: boolean;
}) {
  return (
    <span className={`keycap px-4 py-2 text-base ${dim ? "text-muted" : "text-foreground"}`}>
      {children}
    </span>
  );
}

function HowStep({
  index,
  title,
  caption,
  children,
}: {
  index: string;
  title: string;
  caption: string;
  children: React.ReactNode;
}) {
  return (
    <article className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-lg font-bold text-accent">
          {index}
        </span>
        <h3 className="ko-heading text-lg font-bold text-foreground">{title}</h3>
      </div>
      {children}
      <p className="ko-copy text-sm leading-6 text-muted">{caption}</p>
    </article>
  );
}

function FeatureCard({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="border-t border-border pt-5">
      <h3 className="ko-heading font-display text-lg leading-tight">{title}</h3>
      <p className="ko-copy mt-2 text-[15px] leading-7 text-muted">{body}</p>
    </div>
  );
}

function OpenChatCard() {
  return (
    <div className="grid gap-6 rounded-xl border border-border bg-card p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            공지 · 지원
          </span>
          <span className="text-xs font-medium text-muted">관리자 공지 채널</span>
        </div>
        <h2 className="ko-heading font-display max-w-2xl text-2xl leading-snug sm:text-3xl">
          업데이트 소식과 문의는 카카오톡 오픈톡방에서.
        </h2>
        <p className="ko-copy max-w-3xl text-[15px] leading-7 text-muted">
          업데이트 · 사용량 문의 · 기능 요청 · 가입 승인 요청을 오픈톡방에서 받습니다.
          현재는 회원 커뮤니티가 아닌 관리자 공지·지원 채널로 운영합니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={OPENCHAT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-hover"
          >
            공지·문의 채널 열기
            <span aria-hidden="true">→</span>
          </a>
          <a
            href={OPENCHAT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center break-all rounded-lg border border-border bg-panel px-4 py-3 font-mono text-xs font-medium text-muted transition hover:text-foreground sm:text-sm"
          >
            open.kakao.com/o/pmT0WGGi
          </a>
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="rounded-xl border border-border bg-background p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={OPENCHAT.qrSrc}
            alt="카카오톡 오픈톡방 QR 코드"
            width={168}
            height={168}
            className="block h-[168px] w-[168px]"
          />
        </div>
        <p className="text-[11px] font-medium text-muted">QR 스캔으로 바로 입장</p>
      </div>
    </div>
  );
}

function LatestReleaseCard({
  release,
}: {
  release: Awaited<ReturnType<typeof fetchReleases>>[number] | null;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-8">
      <div className="mb-4 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"
        >
          <Sparkles size={16} strokeWidth={2.2} />
        </span>
        <span className="text-xs font-bold tracking-[0.14em] text-accent">
          최신 업데이트
        </span>
      </div>
      {release ? (
        <>
          <h3 className="ko-heading font-display text-2xl leading-tight">{release.title}</h3>
          <p className="mt-2 font-mono text-xs text-muted">
            {formatShortDate(release.publishedAt)} · {release.tag}
          </p>
          <p className="ko-copy mt-4 line-clamp-4 text-[15px] leading-7 text-muted">
            {stripMarkdown(release.bodyMarkdown)}
          </p>
        </>
      ) : (
        <>
          <h3 className="ko-heading font-display text-2xl leading-tight">
            곧 새 소식을 만나보세요
          </h3>
          <p className="mt-2 text-[15px] text-muted">
            아직 표시할 릴리스가 없습니다.
          </p>
        </>
      )}
      <div className="mt-auto pt-6">
        <Link
          href="/updates"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent transition hover:opacity-80"
        >
          업데이트 로그 전체 보기
          <ArrowRight size={14} strokeWidth={2.4} />
        </Link>
      </div>
    </article>
  );
}

/** markdown 에서 헤딩·리스트 마커 제거해 미리보기 텍스트로. */
function stripMarkdown(md: string): string {
  return md
    .replace(/^#+\s*/gm, "")
    .replace(/^[-*]\s+/gm, "· ")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\r?\n{2,}/g, "\n")
    .trim();
}

function formatShortDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function FaqItem({
  question,
  children,
}: {
  question: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 py-6 first:pt-0 last:pb-0">
      <p className="ko-heading font-display text-lg font-bold">{question}</p>
      <p className="ko-copy text-[15px] leading-7 text-muted">{children}</p>
    </div>
  );
}
