import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@/infrastructure/clerk";

const DOWNLOAD_URL =
  "https://github.com/phk901031-prog/hudtyping-saas/releases/latest/download/hudtyping-Setup-0.2.6.exe";

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border bg-card/88 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="keycap h-11 w-11 text-base">H</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl">HUDTyping</span>
              <span className="mt-1 text-[11px] font-medium text-muted">
                속기사 업무용 우리말샘 HUD
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/help"
              className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline"
            >
              사용 가이드
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
                  승인 요청
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        <section className="hero-slab relative overflow-hidden bg-ink text-white">
          <div className="hero-motion absolute inset-0" />
          <div className="circuit-layer absolute inset-0" />

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[610px] lg:grid-cols-[0.82fr_1.18fr] lg:items-center lg:pb-16 lg:pt-12">
            <div className="flex flex-col justify-center gap-6">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="green">서비스 운영 중</StatusPill>
                <StatusPill tone="dark">Windows v0.2.4</StatusPill>
                <StatusPill tone="dark">승인제 운영</StatusPill>
              </div>

              <div className="flex max-w-2xl flex-col gap-4">
                <p className="w-fit rounded-full border border-white/12 bg-white/7 px-3 py-1 text-xs font-bold text-[#a8fff4]">
                  한글 문서 위에서 바로 뜨는 우리말샘 검색 보조 시스템
                </p>
                <h1 className="font-display text-3xl leading-tight [word-break:keep-all] sm:text-5xl lg:text-[3.25rem]">
                  회의록 작성 화면에서
                  <br />
                  바로 검색되는 사전 HUD.
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/78 [word-break:keep-all] sm:text-lg">
                  단어 뒤에 커서를 두고 지정 키를 누르면 HUDTyping이 커서 앞 표현을
                  잡아 우리말샘 결과를 작은 창으로 보여줍니다. 사용자는 한글 문서를
                  벗어나지 않고, 관리자는 검색 실패율과 응답속도까지 확인합니다.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DOWNLOAD_URL}
                  className="inline-flex items-center justify-center rounded-lg bg-signal px-6 py-3.5 text-sm font-bold text-white shadow-[0_20px_48px_rgba(240,95,50,0.34)] transition hover:brightness-110"
                >
                  Windows 앱 다운로드
                </a>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-lg border border-white/18 bg-white/8 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/14"
                >
                  사용법 보기
                </Link>
                {!isSignedIn && (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-lg border border-white/18 bg-white/8 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/14"
                  >
                    가입 승인 요청
                  </Link>
                )}
              </div>

              <TrustStrip />
            </div>

            <ProductScreen />
          </div>
        </section>

        <section className="relative z-10 border-b border-border bg-background">
          <div className="mx-auto grid w-full max-w-6xl gap-3 px-5 py-6 sm:px-8 lg:-mt-10 lg:grid-cols-3 lg:py-0">
            <ProofCard label="운영 관측" value="실패율 · 응답속도 · 앱 버전" />
            <ProofCard label="검색 흐름" value="커서 앞 검색 · 연속 확장" />
            <ProofCard label="배포 관리" value="자동 업데이트 · 구버전 정책" />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.68fr_1.32fr]">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-accent">제품 기준</p>
            <h2 className="font-display text-3xl [word-break:keep-all]">
              화려한 검색창보다, 작업 흐름을 지키는 도구가 필요합니다.
            </h2>
            <p className="text-[17px] leading-8 text-muted">
              HUDTyping은 랜딩페이지보다 실제 속기사 업무 화면에서의 반응속도와
              안정성을 우선합니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              label="01"
              title="커서 앞 검색"
              body="블록 지정 없이 커서 앞 표현을 검색합니다. 키를 연속해서 누르면 표현이 확장됩니다."
            />
            <FeatureCard
              label="02"
              title="운영 데이터"
              body="검색 수, 실패율, 평균 응답속도, 앱 버전을 관리자 화면에서 확인합니다."
            />
            <FeatureCard
              label="03"
              title="캐시 최적화"
              body="자주 찾는 검색어는 서버 캐시에 저장해 더 빠르게 응답하도록 운영합니다."
            />
          </div>
        </section>

        <section className="border-y border-border bg-panel">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="flex flex-col justify-center gap-3">
              <p className="text-sm font-bold text-accent">업무 흐름</p>
              <h2 className="font-display text-3xl [word-break:keep-all]">
                화면을 바꾸지 않고, 필요한 순간만 검색합니다.
              </h2>
              <p className="text-[17px] leading-8 text-muted">
                속기사는 한글 문서에 계속 머물러야 합니다. HUDTyping은 브라우저 검색,
                단어 재입력, Alt+Tab 이동을 줄이는 데 초점을 둔 도구입니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="01"
                title="커서 두기"
                body="검색할 표현 뒤에 커서를 둡니다."
                sample="회의 안건 정리|"
              />
              <GuideStep
                step="02"
                title="지정 키 입력"
                body="Insert 등 원하는 키를 누릅니다. 연속 입력하면 표현이 확장됩니다."
                sample="Insert"
                keycap
              />
              <GuideStep
                step="03"
                title="HUD 확인"
                body="작은 창에서 뜻을 확인하고 바로 작성 흐름으로 돌아갑니다."
                sample="우리말샘 응답 지연 중"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="support" className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">운영 안내</h2>
            <div className="mt-5 divide-y divide-border">
              <Notice title="현재 배포 버전" date="v0.2.4">
                앱 버전 보고, 업데이트 안내, 검색 실패/응답시간 기록을 추가했습니다.
              </Notice>
              <Notice title="응답 지연 안내" date="검색">
                우리말샘 또는 서버 응답이 늦으면 앱에 “우리말샘 응답 지연 중”으로 표시됩니다.
                자주 찾는 검색어는 캐시를 통해 더 빠르게 응답하도록 운영합니다.
              </Notice>
              <Notice title="문의 창구" date="상시">
                가입 승인, 오류 제보, 기능 건의는 카카오톡 papawheels 친구 추가 후 보내주세요.
              </Notice>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">지원 채널</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SupportLink
                title="카카오톡 문의"
                body="승인, 오류, 기능 건의"
                href="#support"
                label="papawheels"
              />
              <SupportLink
                title="사용 가이드"
                body="설치부터 커서 앞 검색까지"
                href="/help"
                label="가이드"
              />
              <SupportLink
                title="설치 문제"
                body="백신 차단, Defender 경고"
                href="/install-help"
                label="해결법"
              />
              <SupportLink
                title="대시보드"
                body="프로그램 연결과 사용량 확인"
                href={isSignedIn ? "/dashboard" : "/sign-in"}
                label={isSignedIn ? "열기" : "로그인"}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function TrustStrip() {
  return (
    <div className="grid gap-2 rounded-xl border border-white/12 bg-white/8 p-3 shadow-[0_18px_48px_rgba(0,0,0,0.18)] backdrop-blur sm:grid-cols-3">
      <TrustItem label="API" value="SaaS 인증" />
      <TrustItem label="LOG" value="실패율 추적" />
      <TrustItem label="CACHE" value="반복 검색 최적화" />
    </div>
  );
}

function TrustItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/8 px-3 py-2">
      <span className="status-led" />
      <div className="min-w-0">
        <p className="font-mono text-[10px] font-bold text-[#a8fff4]">{label}</p>
        <p className="truncate text-xs font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function ProofCard({ label, value }: { label: string; value: string }) {
  return (
    <article className="proof-card rounded-lg border border-border bg-card p-5">
      <p className="font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-accent">
        {label}
      </p>
      <p className="mt-2 text-base font-bold">{value}</p>
    </article>
  );
}

function ProductScreen() {
  return (
    <div className="hud-stage tech-shell relative min-h-[480px] overflow-hidden rounded-xl border border-white/12 bg-ink p-4 text-white shadow-[0_30px_80px_rgba(5,18,26,0.35)] sm:p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-signal" />
      <div className="screen-grid absolute inset-0 opacity-25" />
      <div className="scan-line absolute inset-x-8 top-10 h-14 rounded-full opacity-45" />

      <div className="relative flex min-h-[430px] flex-col rounded-lg border border-white/10 bg-[#0a1519]/96 p-4">
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
          <p>제3호 안건은 참석자 의견을 반영하여 다음 회의에서 다시</p>
          <p>
            <span className="select-token select-token-3">회의</span>{" "}
            <span className="select-token select-token-2">안건</span>{" "}
            <span className="select-token select-token-1">정리</span>
            <span className="typing-caret ml-1 inline-block h-5 w-[2px] translate-y-1 bg-signal" />
            하기로 하였다.
          </p>
        </div>

        <div className="system-rail absolute bottom-6 left-5 hidden w-32 rounded-md border border-white/10 bg-white/[0.045] p-3 text-[11px] text-white/58 lg:block">
          <p className="font-bold text-white/82">LIVE CHECK</p>
          <div className="mt-3 grid gap-2">
            <RailRow label="AUTH" value="OK" />
            <RailRow label="CACHE" value="HIT" />
            <RailRow label="LATENCY" value="184ms" />
          </div>
        </div>

        <div className="hud-panel absolute bottom-5 right-5 w-[min(82%,360px)] rounded-lg border border-white/14 bg-[#041012]/96 p-4 shadow-2xl">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-xs font-bold text-white/50">HUDTyping</span>
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
              <span className="cycle-item cycle-item-2">안건 정리</span>
              <span className="cycle-item cycle-item-3">회의 안건 정리</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
              <span className="search-progress block h-full rounded-full bg-signal" />
            </div>
          </div>

          <div className="mt-4 min-h-[96px]">
            <p className="text-sm font-bold text-white">정리</p>
            <p className="mt-2 text-sm leading-6 text-white/72">
              흩어진 내용을 일정한 기준에 따라 질서 있게 바로잡음. 회의록에서는 안건,
              발언, 결론을 구분해 쓰는 흐름을 가리킬 때 자주 사용됩니다.
            </p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-white/62">
            <span className="rounded-md border border-white/10 py-1.5">1회 정리</span>
            <span className="rounded-md border border-white/10 py-1.5">2회 안건 정리</span>
            <span className="rounded-md border border-white/10 py-1.5">3회 회의 안건 정리</span>
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

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "green" | "dark";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        tone === "green"
          ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
          : tone === "dark"
            ? "border-white/16 bg-white/8 text-white/78"
            : "border-border bg-card text-muted"
      }`}
    >
      {children}
    </span>
  );
}

function FeatureCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <article className="feature-card rounded-lg border border-border bg-card p-6">
      <p className="font-mono text-xs font-bold text-accent">{label}</p>
      <h2 className="mt-4 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-[15px] leading-7 text-muted">{body}</p>
    </article>
  );
}

function GuideStep({
  step,
  title,
  body,
  sample,
  keycap,
}: {
  step: string;
  title: string;
  body: string;
  sample: string;
  keycap?: boolean;
}) {
  return (
    <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-xs font-bold text-accent">STEP {step}</span>
        <span className="step-dot h-2 w-2 rounded-full bg-accent" />
      </div>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 text-[15px] leading-7 text-muted sm:min-h-12">{body}</p>
      <div
        className={
          keycap
            ? "mt-3 flex min-h-12 items-center justify-center rounded-md bg-ink px-3 py-3 text-lg font-bold text-white sm:mt-4 sm:min-h-16"
            : "mt-3 flex min-h-12 items-center rounded-md border border-border bg-paper px-3 py-3 text-sm font-semibold text-ink sm:mt-4 sm:min-h-16"
        }
      >
        {sample}
      </div>
    </article>
  );
}

function Notice({
  title,
  date,
  children,
}: {
  title: string;
  date: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2 py-4 sm:grid-cols-[92px_1fr]">
      <span className="font-mono text-xs font-bold text-accent">{date}</span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-[15px] leading-7 text-muted">{children}</p>
      </div>
    </div>
  );
}

function SupportLink({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="support-link rounded-lg border border-transparent bg-muted-bg/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-[15px] text-muted">{body}</p>
        </div>
        <span className="shrink-0 rounded bg-card px-2.5 py-1 text-xs font-semibold text-muted">
          {label}
        </span>
      </div>
    </a>
  );
}
