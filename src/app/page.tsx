import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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
import { OPENCHAT } from "@/config/community";
import { fetchReleases } from "@/features/updates/releases";
import { fetchTrendTop } from "@/features/trends/service";

const DOWNLOAD_URL = "/download/windows";

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
    <div className="flex flex-1 flex-col bg-background text-foreground">
      {/* ─────────────  NAV  ───────────── */}
      <nav className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="PlaySteno"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl"
            />
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl">PlaySteno</span>
              <span className="mt-1 text-[11px] font-medium text-muted">
                속기사의 놀이터 · 낱말지기 (온라인)
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="#start"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              시작하기
            </a>
            <a
              href="#features"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              기능
            </a>
            <Link
              href="/updates"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              업데이트
            </Link>
            <Link
              href="/trends"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              인기 검색어
            </Link>
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-lg border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted-bg"
                >
                  대시보드
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="hidden whitespace-nowrap text-sm font-medium text-muted transition hover:text-foreground sm:inline"
                >
                  로그인
                </Link>
                <Link
                  href="/sign-up"
                  className="whitespace-nowrap rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  가입 승인 요청
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        {/* ─────────────  1. HERO  ───────────── */}
        <section className="relative overflow-hidden bg-ink text-white">
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
                  서비스 운영 중
                </span>
                <span className="text-white/45">·</span>
                <span className="font-mono text-white/70">
                  Windows v{WINDOWS_RELEASE.version}
                </span>
              </div>

              <h1 className="font-display text-4xl font-bold leading-[1.1] tracking-tight [word-break:keep-all] sm:text-5xl lg:text-[3.75rem]">
                받아쓰기는 누구나 합니다.
                <br />
                <span className="text-[#a8fff4]">정확한 기록</span>은 아무나 못 합니다.
              </h1>

              <p className="max-w-xl text-lg leading-8 text-white/76 [word-break:keep-all]">
                확인하지 않는 사람은 모릅니다, 자기가 뭘 놓쳤는지조차.
              </p>

              <p className="max-w-xl text-sm leading-7 text-white/50 [word-break:keep-all]">
                한글 문서에서 벗어나지 않고, 지정 키 한 번이면 우리말샘 결과가 작은 HUD 창에 뜹니다 —
                Alt+Tab도, 브라우저 검색도, 복사·붙여넣기도 필요 없습니다.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DOWNLOAD_URL}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-7 py-4 text-base font-bold text-white transition hover:brightness-110"
                >
                  Windows 앱 다운로드
                  <span aria-hidden="true">↓</span>
                </a>
                {!isSignedIn && (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-md border border-white/25 bg-white/8 px-7 py-4 text-base font-bold text-white transition hover:bg-white/14"
                  >
                    가입 승인 요청
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
                승인 계정 전용 · v{WINDOWS_RELEASE.minimumFreshInstallVersion} 미만 앱은 새 설치 필요
              </p>
            </div>

            <ProductScreen />
          </div>
        </section>

        {/* ─────────────  2. GETTING STARTED  ───────────── */}
        <section id="start" className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Get started
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              3단계로 시작합니다
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              정확한 기록을 만드는 습관은, 이 3단계에서 시작됩니다.
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
                How it works
              </p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl">
                한글 문서에서, 키 한 번.
              </h2>
              <p className="max-w-2xl text-lg leading-8 text-white/68">
                편집기와 통신하지 않습니다. 커서 앞 어절을 잡아 검색한 뒤
                결과만 HUD 창에 표시합니다.
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
              Features
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              작지만 매일 쓰기 좋은 것들
            </h2>
            <p className="max-w-2xl text-lg leading-8 text-muted">
              자주 확인할수록, 더 빨라지고 더 정확해집니다.
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
              body="한 번 찾은 단어는 앱 안에 저장돼 재검색 시 네트워크 없이 0ms 응답."
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

        {/* ─────────────  5. COMMUNITY  ───────────── */}
        <section id="support" className="border-y border-border bg-panel">
          <div className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
            <OpenChatCard />
          </div>
        </section>

        {/* ─────────────  5.5 LIVE — Updates + Trends  ───────────── */}
        <section className="mx-auto w-full max-w-6xl px-5 py-24 sm:px-8 lg:py-28">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
              Live
            </p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl">
              지금 이 순간 벌어지는 일
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
              Before you go
            </p>
            <h2 className="font-display text-3xl leading-tight [word-break:keep-all] sm:text-4xl">
              지금 놓친 그 단어, 나중엔 기억도 안 납니다.
            </h2>
            <p className="max-w-xl text-lg leading-8 text-white/70 [word-break:keep-all]">
              확인하는 습관은 지금 만드는 게 가장 쉽습니다. 설치는 1분이면 끝납니다.
            </p>
            <a
              href={DOWNLOAD_URL}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-signal px-8 py-4 text-base font-bold text-white transition hover:brightness-110"
            >
              Windows 앱 다운로드
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
              한글(HWP), MS Word, 텍스트 편집기 등 커서가 있는 대부분의 문서 앱에서 동작합니다.
              앱이 특정 편집기와 통신하지 않고 커서 앞 단어를 캡처하는 방식이라 범용적으로 쓸 수 있습니다.
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
              에 케이스별 우회 방법을 정리해 뒀습니다.
            </FaqItem>
            <FaqItem question="문의는 어디로?">
              가입 승인 · 사용 문의 · 기능 요청 · 오류 제보 모두 아래 카카오톡 오픈톡방으로
              보내주세요. 관리자만 공지하는 채널이라 알림 소음 없이 새 소식도 함께 받습니다.
            </FaqItem>
          </div>
        </section>
      </main>

      {/* ─────────────  FOOTER  ───────────── */}
      <footer className="border-t border-border bg-card">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:px-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="낱말지기"
              width={40}
              height={40}
              className="h-10 w-10 rounded-xl"
            />
            <div>
              <p className="font-display text-lg">PlaySteno</p>
              <p className="mt-1 text-xs text-muted">
                속기사의 놀이터 · 낱말지기 (온라인) · Windows v{WINDOWS_RELEASE.version}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
            <FooterLink href={DOWNLOAD_URL}>Windows 다운로드</FooterLink>
            <FooterLink href="/updates">업데이트 로그</FooterLink>
            <FooterLink href="/trends">인기 검색어</FooterLink>
            <FooterLink href="/help">사용 가이드</FooterLink>
            <FooterLink href="/install-help">설치 도움말</FooterLink>
            <FooterLink href="/terms">이용약관</FooterLink>
            <FooterLink href="/privacy">개인정보 처리방침</FooterLink>
            <FooterLink external href={OPENCHAT.url}>
              오픈톡방
            </FooterLink>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════
// SECTION HELPERS
// ═════════════════════════════════════════════════════════════════

function StatusPill({
  tone,
  children,
}: {
  tone: "green" | "dark";
  children: React.ReactNode;
}) {
  const color =
    tone === "green"
      ? "border-emerald-400/40 bg-emerald-400/12 text-emerald-100"
      : "border-white/16 bg-white/8 text-white/85";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${color}`}
    >
      {tone === "green" && <span className="status-led" />}
      {children}
    </span>
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
            Community
          </span>
          <span className="text-xs font-medium text-muted">관리자 공지 채널</span>
        </div>
        <h2 className="font-display text-2xl leading-snug [word-break:keep-all] sm:text-3xl">
          새 소식과 문의는
          <br />
          카카오톡 오픈톡방에서.
        </h2>
        <p className="text-[15px] leading-7 text-muted [word-break:keep-all]">
          업데이트 · 사용량 문의 · 기능 요청 · 가입 승인 요청 모두 이 오픈톡방에서 받습니다.
          관리자만 공지하는 채널이라 알림 소음 없이 조용히 필요한 소식만 확인할 수 있습니다.
        </p>
        <div className="flex flex-wrap gap-3">
          <a
            href={OPENCHAT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-signal px-5 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(240,95,50,0.28)] transition hover:brightness-110"
          >
            오픈톡방 열기
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

function FooterLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: React.ReactNode;
}) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted transition hover:text-foreground"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className="text-muted transition hover:text-foreground">
      {children}
    </Link>
  );
}

// ═════════════════════════════════════════════════════════════════
// PRODUCT SCREEN — CSS 목업 (히어로 우측)
// GIF/스크린샷 있으면 여기만 <img>/<video> 로 교체하면 됨.
// ═════════════════════════════════════════════════════════════════

function ProductScreen() {
  return (
    <div className="hud-stage tech-shell relative min-h-[500px] overflow-hidden rounded-xl border border-white/12 bg-ink p-4 text-white shadow-[0_30px_80px_rgba(5,18,26,0.35)] sm:p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-signal" />
      <div className="screen-grid absolute inset-0 opacity-25" />
      <div className="scan-line absolute inset-x-8 top-10 h-14 rounded-full opacity-45" />

      <div className="relative flex min-h-[450px] flex-col rounded-lg border border-white/10 bg-[#0a1519]/96 p-4">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <p className="text-xs font-semibold text-white/45">HWP DOCUMENT</p>
            <p className="mt-1 text-sm font-bold">회의록 작성 중</p>
          </div>
          <span className="key-press rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-white/85">
            Insert
          </span>
        </div>

        <div className="max-w-[62%] space-y-3 text-sm leading-7 text-white/70">
          <p>참석자 의견은 다음 회의에서 다시 검토하기로 하였으며</p>
          <p>
            <span className="select-token select-token-3">회의</span>{" "}
            <span className="select-token select-token-2">의견</span>{" "}
            <span className="select-token select-token-1">정리</span>
            <span className="typing-caret ml-1 inline-block h-5 w-[2px] translate-y-1 bg-signal" />
            에 따라 후속 조치를 진행한다.
          </p>
        </div>

        <div className="system-rail absolute bottom-6 left-5 hidden w-36 rounded-md border border-white/10 bg-white/[0.045] p-3 text-[11px] text-white/58 lg:block">
          <p className="font-bold text-white/82">CONNECTION</p>
          <div className="mt-3 grid gap-2">
            <RailRow label="ACCOUNT" value="OK" />
            <RailRow label="CACHE" value="HIT" />
            <RailRow label="LATENCY" value="184ms" />
          </div>
        </div>

        <div className="hud-panel absolute bottom-5 right-5 w-[min(82%,360px)] rounded-lg border border-white/14 bg-[#041012]/96 p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-white/50">낱말지기</span>
            <span className="rounded bg-accent/22 px-2 py-0.5 text-[11px] font-bold text-[#bff6ef]">
              커서 앞 검색
            </span>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.04] p-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/38">
              검색어
            </p>
            <div className="query-cycle mt-1 h-8 overflow-hidden text-xl font-bold">
              <span className="cycle-item cycle-item-1">정리</span>
              <span className="cycle-item cycle-item-2">의견 정리</span>
              <span className="cycle-item cycle-item-3">회의 의견 정리</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="search-progress block h-full rounded-full bg-signal" />
            </div>
          </div>

          <div className="mt-4 min-h-[96px]">
            <p className="text-sm font-bold text-white">정리</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              일정한 기준에 따라 내용을 가지런히 바로잡음. 회의록에서는 의견, 발언, 결론을
              구분해 문서의 흐름을 잡을 때 자주 쓰입니다.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-white/62">
            <span className="rounded-md border border-white/10 py-1.5">1회 정리</span>
            <span className="rounded-md border border-white/10 py-1.5">2회 의견 정리</span>
            <span className="rounded-md border border-white/10 py-1.5">3회 회의 의견</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="font-mono text-white/42">{label}</span>
      <span className="font-mono font-bold text-[#a8fff4]">{value}</span>
    </div>
  );
}
