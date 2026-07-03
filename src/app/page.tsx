import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@/infrastructure/clerk";

const DOWNLOAD_URL =
  "https://github.com/phk901031-prog/hudtyping-saas/releases/latest/download/hudtyping-Setup-0.2.3.exe";

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <nav className="border-b border-border bg-background/94 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="keycap h-11 w-11 text-base">H</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl">HUDTyping</span>
              <span className="mt-1 text-[11px] font-medium text-muted">
                한글 문서 위에 뜨는 우리말샘 HUD
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
        <section className="relative overflow-hidden border-b border-border">
          <div className="hero-motion absolute inset-0 opacity-70" />
          <div className="mx-auto grid w-full max-w-6xl gap-9 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-14">
            <div className="relative flex flex-col justify-center gap-7">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="green">서비스 운영 중</StatusPill>
                <StatusPill>Windows v0.2.3</StatusPill>
                <StatusPill>관리자 승인 후 사용</StatusPill>
              </div>

              <div className="flex max-w-2xl flex-col gap-4">
                <h1 className="font-display text-3xl leading-tight [word-break:keep-all] sm:text-5xl">
                  한글 문서에서
                  <br />
                  커서 앞 단어를 바로 찾습니다.
                </h1>
                <p className="text-base leading-8 text-muted [word-break:keep-all] sm:text-lg">
                  회의록을 쓰다가 궁금한 단어 뒤에 커서를 두고 지정 키를 누르세요.
                  HUDTyping이 커서 앞 표현을 잡아 우리말샘 결과를 작은 창으로 보여줍니다.
                  브라우저를 열거나 단어를 다시 입력하는 흐름을 줄이는 데 집중했습니다.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DOWNLOAD_URL}
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(13,89,99,0.24)] transition hover:bg-accent-hover"
                >
                  Windows 앱 다운로드
                </a>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
                >
                  사용법 보기
                </Link>
                {!isSignedIn && (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
                  >
                    가입 승인 요청
                  </Link>
                )}
              </div>
            </div>

            <ProductScreen />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-3">
          <FeatureCard
            label="1"
            title="블록 지정 없이 커서만 둡니다"
            body="한글 문서에서 단어 뒤에 커서를 두면 됩니다. 마우스로 단어를 긁거나 화면을 바꿀 필요가 없습니다."
          />
          <FeatureCard
            label="2"
            title="검색 키를 누르면 HUD가 뜹니다"
            body="Insert처럼 익숙한 키를 사용자가 직접 지정할 수 있습니다. 기본 안내는 커서 앞 검색 중심으로 정리했습니다."
          />
          <FeatureCard
            label="3"
            title="연속 입력으로 표현을 넓힙니다"
            body="키를 연속해서 누르면 띄어쓰기를 넘어 더 긴 표현으로 확장됩니다. 결과가 없어도 먼저 확장한 뒤 한 번에 검색합니다."
          />
        </section>

        <section className="border-y border-border bg-panel">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div className="flex flex-col justify-center gap-3">
              <p className="text-sm font-bold text-accent">사용 흐름</p>
              <h2 className="font-display text-3xl [word-break:keep-all]">
                짧은 키 입력만으로 검색 흐름을 끝냅니다.
              </h2>
              <p className="leading-7 text-muted">
                실제 사용자는 한글 문서를 벗어나지 않습니다. 커서 앞 검색,
                연속 확장, HUD 결과 확인까지 한 화면 안에서 이어집니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="01"
                title="커서 앞에 둠"
                body="검색할 표현 뒤에 커서를 둡니다."
                sample="회의 안건 정리|"
              />
              <GuideStep
                step="02"
                title="지정 키 입력"
                body="원하는 키를 누릅니다. 연속 입력하면 앞쪽 표현까지 넓어집니다."
                sample="Insert"
                keycap
              />
              <GuideStep
                step="03"
                title="HUD 결과 확인"
                body="작은 창에서 뜻을 확인하고 바로 회의록 작성을 이어갑니다."
                sample="검색 실패 시: 우리말샘 응답 지연 중"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="support" className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">운영 안내</h2>
            <div className="mt-5 divide-y divide-border">
              <Notice title="현재 배포 버전" date="v0.2.3">
                커서 앞 검색 중심으로 앱 화면을 정리했고, 상태표시줄 아이콘과 설치 파일을 갱신했습니다.
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
                body="API 키와 사용량 확인"
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

function ProductScreen() {
  return (
    <div className="hud-stage relative min-h-[470px] overflow-hidden rounded-xl border border-border bg-ink p-4 text-white shadow-[0_24px_70px_rgba(11,22,26,0.28)] sm:p-5">
      <div className="absolute inset-x-0 top-0 h-1 bg-signal" />
      <div className="screen-grid absolute inset-0 opacity-35" />

      <div className="relative flex h-full flex-col rounded-lg border border-white/10 bg-[#101d21]/96 p-4">
        <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <p className="text-xs font-semibold text-white/45">HWP DOCUMENT</p>
            <p className="mt-1 text-sm font-bold">회의록 작성 중</p>
          </div>
          <span className="key-press rounded-md bg-white/10 px-2.5 py-1 text-xs font-bold text-white/85">
            Insert
          </span>
        </div>

        <div className="space-y-3 text-sm leading-7 text-white/70">
          <p>제3호 안건은 참석자 의견을 반영하여 다음 회의에서 다시</p>
          <p>
            <span className="select-token select-token-3">회의</span>{" "}
            <span className="select-token select-token-2">안건</span>{" "}
            <span className="select-token select-token-1">정리</span>
            <span className="typing-caret ml-1 inline-block h-5 w-[2px] translate-y-1 bg-signal" />
            하기로 하였다.
          </p>
        </div>

        <div className="hud-panel absolute bottom-5 right-5 w-[min(88%,390px)] rounded-lg border border-white/14 bg-[#061112]/96 p-4 shadow-2xl">
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

        <div className="absolute bottom-6 left-5 hidden w-40 rounded-md border border-white/10 bg-white/6 p-3 text-xs text-white/55 sm:block">
          <p className="font-bold text-white/80">상태표시줄</p>
          <div className="mt-3 flex items-center gap-2">
            <span className="tray-badge">H</span>
            <span>작게 떠 있어도 보이게</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "green";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        tone === "green"
          ? "border-success/30 bg-success/10 text-success"
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
    <article className="rounded-lg border border-border bg-card p-5 shadow-[0_14px_40px_rgba(17,29,36,0.06)]">
      <p className="text-xs font-bold text-signal">STEP {label}</p>
      <h2 className="mt-3 text-lg font-bold">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{body}</p>
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
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-accent">STEP {step}</span>
        <span className="step-dot h-2 w-2 rounded-full bg-signal" />
      </div>
      <h3 className="mt-4 font-bold">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted">{body}</p>
      <div
        className={
          keycap
            ? "mt-4 flex h-16 items-center justify-center rounded-md bg-ink text-lg font-bold text-white"
            : "mt-4 flex h-16 items-center rounded-md bg-muted-bg px-3 text-sm font-semibold text-foreground"
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
      <span className="text-xs font-bold text-accent">{date}</span>
      <div>
        <h3 className="text-sm font-bold">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-muted">{children}</p>
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
      className="rounded-lg border border-border p-4 transition hover:bg-muted-bg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold">{title}</h3>
          <p className="mt-1 text-sm text-muted">{body}</p>
        </div>
        <span className="shrink-0 rounded bg-muted-bg px-2.5 py-1 text-xs font-semibold text-muted">
          {label}
        </span>
      </div>
    </a>
  );
}
