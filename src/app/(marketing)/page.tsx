import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  BellRing,
  BookOpen,
  Command,
  KeyRound,
  LineChart,
  Sparkles,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { auth } from "@/infrastructure/clerk";
import { WINDOWS_RELEASE } from "@/config/release";
import { NATMALGI_ONLINE } from "@/config/product";
import { OPENCHAT } from "@/config/community";
import { fetchReleases } from "@/features/updates/releases";
import { fetchTrendTop } from "@/features/trends/service";
import { NatmalgiDemo } from "@/components/marketing/natmalgi-demo";

const DOWNLOAD_URL = "/download/windows";

export const metadata: Metadata = {
  title: "낱말지기 온라인 — 문서 위 우리말샘 HUD",
  description:
    "문서 작업을 멈추지 않고 커서 앞 단어의 우리말샘 뜻풀이와 예문을 확인하는 Windows HUD.",
};

// 홈은 30분 캐시 — releases · trends 데이터도 이 창 안에서 신선.
export const revalidate = 1800;

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  // 홈페이지에 살짝 노출할 최신 릴리스 · 이번 주 top 8
  const [releases, weeklyTrend] = await Promise.all([
    fetchReleases().catch(() => []),
    fetchTrendTop({ days: 7, limit: 8 }).catch(() => []),
  ]);
  const latestRelease = releases[0] ?? null;

  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
        {/* ─────────────  1. HERO  ───────────── */}
        <section id="product" className="relative scroll-mt-28 overflow-hidden bg-ink text-white">
          {/* 절제된 그라디언트 하나만 유지 — 회로 애니메이션 등 노이즈 제거 */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(120%_80%_at_20%_0%,rgba(56,189,248,0.10),transparent_60%),radial-gradient(90%_60%_at_100%_100%,rgba(240,95,50,0.08),transparent_60%)]"
          />

          <div className="relative mx-auto grid w-full max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:min-h-[640px] lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:pt-20">
            <div className="flex flex-col justify-center gap-7">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-3 py-1 font-bold text-emerald-100">
                  <span className="status-led" />
                  무료 베타 운영 중
                </span>
                <span className="text-white/45">·</span>
                <span className="font-mono text-white/70">
                  Windows v{WINDOWS_RELEASE.version}
                </span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight [word-break:keep-all] sm:text-5xl lg:text-[3.75rem]">
                문서 작업을 멈추지 않고,
                <br />
                <span className="text-[#a8fff4]">필요한 단어를 바로 확인하세요.</span>
              </h1>

              <p className="max-w-xl text-lg leading-8 text-white/76 [word-break:keep-all]">
                커서 앞 단어의 뜻풀이와 예문을 작은 HUD에서 확인합니다.
              </p>

              <p className="max-w-xl text-sm leading-7 text-white/50 [word-break:keep-all]">
                한글 문서에서 벗어나지 않고 지정 키를 누르면 우리말샘 검색 결과가 표시됩니다.
                연속으로 누르면 앞 어절까지 검색 범위를 넓힐 수 있습니다.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DOWNLOAD_URL}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-7 py-4 text-base font-bold text-white transition hover:brightness-110"
                >
                  낱말지기 다운로드
                  <span aria-hidden="true">↓</span>
                </a>
                {!isSignedIn && (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/8 px-7 py-4 text-base font-bold text-white transition hover:bg-white/14"
                  >
                    무료로 시작하기
                  </Link>
                )}
                {isSignedIn && (
                  <Link
                    href="/api-keys"
                    className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/8 px-7 py-4 text-base font-bold text-white transition hover:bg-white/14"
                  >
                    연결 코드 발급
                  </Link>
                )}
              </div>

              <p className="text-sm text-white/50">
                {NATMALGI_ONLINE.supportedEnvironment} · 승인 계정 전용 · 월 기본 {NATMALGI_ONLINE.monthlySearchLimit}회
              </p>
            </div>

            <NatmalgiDemo />
          </div>
        </section>

        {/* ─────────────  2. GETTING STARTED  ───────────── */}
        <section id="start" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              시작하기
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              3단계로 시작합니다
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              가입 승인부터 첫 검색까지 순서대로 안내합니다.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
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
              cta={{ label: "다운로드", href: DOWNLOAD_URL, tone: "signal" }}
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
        <section className="border-y border-border bg-ink text-white">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8fff4]">
              작동 방식
              </p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl">
                한글 문서에서, 키 한 번.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-white/68">
                복사할 수 있는 커서 앞 텍스트를 가져와 검색하고,
                결과를 작업 화면 위 HUD에 표시합니다.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              <HowStep
                index="1"
                title="커서 두기"
                caption="검색할 단어 바로 뒤에 커서를 두고"
              >
                <div className="rounded-lg border border-white/12 bg-white/[0.04] p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/40">
                    HWP
                  </p>
                  <p className="mt-3 font-mono text-sm text-white/80">
                    회의 안건 정리
                    <span className="typing-caret ml-0.5 inline-block h-4 w-[2px] translate-y-0.5 bg-signal" />
                  </p>
                </div>
              </HowStep>
              <HowStep
                index="2"
                title="지정 키 한 번"
                caption="F3 · Insert · Pause · F4 등 원하는 키를 설정에서 자유롭게 지정"
              >
                <div className="flex flex-wrap items-center justify-center gap-2 rounded-lg border border-white/12 bg-white/[0.04] py-6">
                  <KeyCap>F3</KeyCap>
                  <span className="text-xs text-white/40">or</span>
                  <KeyCap>Insert</KeyCap>
                  <span className="text-xs text-white/40">or</span>
                  <KeyCap dim>내가 정한 키</KeyCap>
                </div>
              </HowStep>
              <HowStep
                index="3"
                title="HUD로 결과 확인"
                caption="작은 창에 뜻·품사·예문이 즉시"
              >
                <div className="rounded-lg border border-white/12 bg-[#041012]/95 p-3">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <span className="text-[10px] font-bold text-white/50">
                      낱말지기
                    </span>
                    <span className="rounded bg-accent/22 px-1.5 py-0.5 text-[9px] font-bold text-[#bff6ef]">
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
        <section id="features" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              주요 기능
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              기록 흐름을 지키는 실용적인 기능
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              화면을 전환하거나 검색어를 다시 입력하는 반복을 줄였습니다.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              Icon={Command}
              title="커서 앞 자동 검색"
              body="F3 한 번으로 커서 앞 어절을 잡아 검색. 연속으로 누르면 앞 단어까지 확장."
            />
            <FeatureCard
              Icon={BookOpen}
              title="뜻풀이별 예문 창"
              body="뜻풀이를 클릭하면 별도 창에 예문. 창 위·아래·좌·우 자유 부착."
            />
            <FeatureCard
              Icon={Zap}
              title="즉시 재검색"
              body="자주 찾은 결과는 캐시를 활용해 반복 검색의 대기 시간을 줄입니다."
            />
            <FeatureCard
              Icon={BellRing}
              title="자동 업데이트 알림"
              body="새 버전이 나오면 앱 상단에 배너로 안내. 홈페이지에서 변경 내용 확인."
            />
            <FeatureCard
              Icon={KeyRound}
              title="안전한 계정 연결"
              body="API 키 노출 없이 10분짜리 1회용 연결 코드로 앱 계정 연결."
            />
            <FeatureCard
              Icon={LineChart}
              title="사용량 대시보드"
              body="내 이번 달 검색 수, 최근 검색어, 자주 찾은 단어를 웹에서 바로 확인."
            />
          </div>
        </section>

        {/* ─────────────  5. SUPPORT  ───────────── */}
        <section id="support" className="border-y border-border bg-panel">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
            <OpenChatCard />
          </div>
        </section>

        {/* ─────────────  5.5 LIVE — Updates + Trends  ───────────── */}
        <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              최근 소식
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              최근 업데이트와 검색 흐름
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              최근 업데이트와 사용자들이 자주 찾은 단어를 한눈에 확인합니다.
            </p>
          </div>

          <div className="mt-14 grid gap-5 lg:grid-cols-2">
            <LatestReleaseCard release={latestRelease} />
            <WeeklyTrendCard rows={weeklyTrend} />
          </div>
        </section>

        {/* ─────────────  5.8 FINAL CTA  ───────────── */}
        <section className="border-t border-border bg-ink text-white">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-6 px-5 py-24 text-center sm:px-8 lg:py-28">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a8fff4]">
              낱말지기 온라인
            </p>
            <h2 className="font-display text-3xl leading-tight [word-break:keep-all] sm:text-4xl">
              필요한 순간 바로 확인하는 작업 환경을 만들어보세요.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-white/70 [word-break:keep-all]">
              무료 베타 기간에는 승인된 계정으로 월 {NATMALGI_ONLINE.monthlySearchLimit}회까지 이용할 수 있습니다.
            </p>
            <a
              href={DOWNLOAD_URL}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-8 py-4 text-base font-bold text-white transition hover:brightness-110"
            >
              낱말지기 다운로드
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        {/* ─────────────  6. FAQ  ───────────── */}
        <section className="mx-auto w-full max-w-4xl px-5 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              FAQ
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              자주 묻는 질문
            </h2>
          </div>

          <div className="mt-14 flex flex-col gap-3">
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

function StartStepCard({
  number,
  title,
  body,
  cta,
}: {
  number: string;
  title: string;
  body: string;
  cta: { label: string; href: string; tone?: "signal" };
}) {
  const ctaClass =
    cta.tone === "signal"
      ? "bg-signal text-white hover:brightness-110"
      : "bg-foreground text-background hover:opacity-90";
  return (
    <article className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-8 transition hover:border-accent/40">
      <span className="font-mono text-4xl font-bold text-accent">
        {number}
      </span>
      <div className="flex flex-col gap-3">
        <h3 className="font-display text-2xl leading-tight">{title}</h3>
        <p className="text-[15px] leading-7 text-muted [word-break:keep-all]">
          {body}
        </p>
      </div>
      <Link
        href={cta.href}
        className={`mt-auto inline-flex items-center justify-center gap-1.5 rounded-md px-5 py-3 text-sm font-bold transition ${ctaClass}`}
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
    <span
      className={
        "rounded-md border-2 px-4 py-2 font-mono text-base font-bold shadow-[0_3px_0_rgba(255,255,255,0.12)] " +
        (dim
          ? "border-white/25 bg-white/[0.06] text-white/60"
          : "border-white/40 bg-white/10 text-white")
      }
    >
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
        <span className="font-mono text-lg font-bold text-[#a8fff4]">
          {index}
        </span>
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      {children}
      <p className="text-sm text-white/56 [word-break:keep-all]">{caption}</p>
    </article>
  );
}

function FeatureCard({
  Icon,
  title,
  body,
}: {
  Icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-8 transition hover:border-accent/40 hover:shadow-[0_20px_40px_rgba(9,23,36,0.06)]">
      <span
        aria-hidden="true"
        className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent"
      >
        <Icon size={22} strokeWidth={2} />
      </span>
      <h3 className="font-display text-xl leading-tight">{title}</h3>
      <p className="text-[15px] leading-7 text-muted [word-break:keep-all]">{body}</p>
    </article>
  );
}

function OpenChatCard() {
  return (
    <div className="grid gap-6 rounded-xl border border-border bg-card p-6 sm:p-8 md:grid-cols-[1fr_auto] md:items-center">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-accent/12 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-accent">
            공지 · 지원
          </span>
          <span className="text-xs font-medium text-muted">관리자 공지 채널</span>
        </div>
        <h2 className="font-display text-2xl leading-snug [word-break:keep-all] sm:text-3xl">
          업데이트 소식과 문의는
          <br />
          카카오톡 오픈톡방에서.
        </h2>
        <p className="text-[15px] leading-7 text-muted [word-break:keep-all]">
          업데이트 · 사용량 문의 · 기능 요청 · 가입 승인 요청을 오픈톡방에서 받습니다.
          현재는 회원 커뮤니티가 아닌 관리자 공지·지원 채널로 운영합니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={OPENCHAT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(240,95,50,0.28)] transition hover:brightness-110"
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
        <div className="rounded-xl border border-border bg-background p-3 shadow-sm">
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
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
          Latest release
        </span>
      </div>
      {release ? (
        <>
          <h3 className="font-display text-2xl leading-tight">{release.title}</h3>
          <p className="mt-2 font-mono text-xs text-muted">
            {formatShortDate(release.publishedAt)} · {release.tag}
          </p>
          <p className="mt-4 line-clamp-4 text-[15px] leading-7 text-muted [word-break:keep-all]">
            {stripMarkdown(release.bodyMarkdown)}
          </p>
        </>
      ) : (
        <>
          <h3 className="font-display text-2xl leading-tight">
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

function WeeklyTrendCard({
  rows,
}: {
  rows: Array<{ query: string; count: number }>;
}) {
  return (
    <article className="flex flex-col rounded-2xl border border-border bg-card p-8">
      <div className="mb-4 flex items-center gap-2">
        <span
          aria-hidden="true"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent-soft text-accent"
        >
          <TrendingUp size={16} strokeWidth={2.2} />
        </span>
        <span className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
          This week
        </span>
      </div>
      <h3 className="font-display text-2xl leading-tight">이번 주 인기 검색어</h3>
      <p className="mt-2 font-mono text-xs text-muted">지난 7일 · top 8</p>

      {rows.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted">
          아직 집계할 검색 기록이 부족합니다.
        </p>
      ) : (
        <ol className="mt-5 flex flex-col divide-y divide-border">
          {rows.map((row, i) => (
            <li
              key={row.query}
              className="flex items-baseline gap-3 py-2 text-sm"
            >
              <span className="w-5 shrink-0 font-mono text-[11px] font-bold text-muted">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate font-medium">
                {row.query}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {row.count.toLocaleString()}회
              </span>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-auto pt-6">
        <Link
          href="/trends"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-accent transition hover:opacity-80"
        >
          top 30 전체 보기
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
    <details className="group rounded-2xl border border-border bg-card p-6 transition open:shadow-[0_10px_28px_rgba(9,23,36,0.06)]">
      <summary className="flex cursor-pointer items-center justify-between gap-4 text-lg font-bold [&::-webkit-details-marker]:hidden">
        {question}
        <span
          aria-hidden="true"
          className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xl leading-none text-muted transition group-open:rotate-45"
        >
          +
        </span>
      </summary>
      <div className="mt-4 text-[15px] leading-7 text-muted [word-break:keep-all]">
        {children}
      </div>
    </details>
  );
}
