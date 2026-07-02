import Link from "next/link";
import { auth } from "@/infrastructure/clerk";
import { UserButton } from "@clerk/nextjs";

const DOWNLOAD_URL =
  "https://github.com/phk901031-prog/hudtyping-saas/releases/latest/download/hudtyping-Setup-0.2.2.exe";

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <nav className="border-b border-border bg-background/95">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="keycap h-11 w-11 text-base">H</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl">HUDTyping</span>
              <span className="mt-1 text-[11px] font-medium text-muted">
                속기사용 우리말샘 HUD
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
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
                  className="text-sm font-medium text-muted transition hover:text-foreground"
                >
                  로그인
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
                >
                  가입하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex flex-1 flex-col">
        <section className="border-b border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
            <div className="flex flex-col justify-center gap-7">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="green">서비스 운영 중</StatusPill>
                <StatusPill>Windows v0.2.2</StatusPill>
                <StatusPill>승인 후 사용</StatusPill>
              </div>

              <div className="flex max-w-3xl flex-col gap-4">
                <h1 className="font-display text-3xl leading-tight [word-break:keep-all] sm:text-5xl">
                  한글 문서 위에서,
                  <br />
                  단어 뜻만 조용히 띄웁니다.
                </h1>
                <p className="text-base leading-8 text-muted [word-break:keep-all] sm:text-lg">
                  HUDTyping은 속기사가 회의록을 쓰는 흐름을 끊지 않도록 만든
                  우리말샘 검색 HUD입니다. 단어 뒤에 커서를 두고 지정 키를
                  누르면, 브라우저를 열지 않고 바로 뜻을 확인합니다.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <a
                  href={DOWNLOAD_URL}
                  className="inline-flex items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:bg-accent-hover"
                >
                  Windows 앱 다운로드
                </a>
                <Link
                  href="/help"
                  className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
                >
                  사용법 보기
                </Link>
                {!isSignedIn && (
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
                  >
                    승인 요청
                  </Link>
                )}
              </div>
            </div>

            <ProductDemo />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 sm:px-8 md:grid-cols-3">
          <FeatureCard
            label="검색 방식"
            title="커서 앞 검색 하나로 정리"
            body="블록을 잡지 않습니다. 단어 뒤에 커서를 두고 지정 키만 누르면 됩니다."
          />
          <FeatureCard
            label="연속 확장"
            title="Insert를 여러 번 누르면 구절로 확장"
            body="정리 → 안건 정리 → 회의 안건 정리처럼 띄어쓰기를 넘어 검색어가 길어집니다."
          />
          <FeatureCard
            label="운영"
            title="승인, 한도, 사용량을 웹에서 관리"
            body="사용자는 앱만 쓰고, 관리자는 가입 승인과 사용 현황을 웹에서 확인합니다."
          />
        </section>

        <section className="border-y border-border bg-panel">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[0.8fr_1.2fr]">
            <div className="flex flex-col justify-center gap-3">
              <p className="text-sm font-bold text-accent">따라 하기</p>
              <h2 className="font-display text-3xl">이미지처럼 읽히는 사용법</h2>
              <p className="leading-7 text-muted">
                처음 쓰는 사람에게는 긴 설명보다 한 화면짜리 순서도가 더
                빠릅니다. 아래 흐름은 그대로 캡처해서 공지 이미지나 짧은
                영상의 장면 구성으로 사용할 수 있게 만들었습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="1"
                title="커서 두기"
                body="검색할 단어 바로 뒤에 커서를 둡니다."
                sample="회의 안건 정리|"
              />
              <GuideStep
                step="2"
                title="키 누르기"
                body="지정 키를 누릅니다. Insert를 추천합니다."
                sample="Insert"
                keycap
              />
              <GuideStep
                step="3"
                title="HUD 확인"
                body="뜻을 확인하고 바로 문서 작성으로 돌아갑니다."
                sample="정리: 흐트러진 것을..."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-10 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="support" className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">운영 안내</h2>
            <div className="mt-5 divide-y divide-border">
              <Notice title="최신 버전" date="v0.2.2">
                커서 앞 검색 중심으로 단축키 화면을 정리했고, 연속 입력 시
                검색어를 먼저 확장한 뒤 한 번만 검색합니다.
              </Notice>
              <Notice title="응답 지연 안내" date="검색">
                우리말샘 또는 서버 응답이 늦으면 “우리말샘 응답 지연 중”으로
                표시됩니다. 자주 찾는 단어는 캐시로 더 빨라집니다.
              </Notice>
              <Notice title="문의 창구" date="상시">
                가입 승인, 오류 제보, 기능 건의는 카카오톡 papawheels로 보내주세요.
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
                label="도움말"
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

function ProductDemo() {
  return (
    <div className="relative min-h-[420px] overflow-hidden rounded-lg border border-border bg-ink p-5 text-white shadow-[0_18px_50px_rgba(35,38,32,0.18)]">
      <div className="absolute inset-x-0 top-0 h-1 bg-accent" />
      <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-3">
        <div>
          <p className="text-xs font-semibold text-white/50">HWP DOCUMENT</p>
          <p className="mt-1 text-sm font-bold">회의록 작성 중</p>
        </div>
        <span className="rounded bg-white/10 px-2 py-1 text-xs">Insert</span>
      </div>

      <div className="space-y-3 text-sm leading-7 text-white/78">
        <p>제3호 안건은 참석자 의견을 반영하여 다음 회의에서 다시</p>
        <p>
          <span className="rounded-sm bg-paper px-1.5 py-0.5 font-bold text-ink">
            정리
          </span>
          <span className="ml-1 inline-block h-5 w-[2px] translate-y-1 bg-accent" />
          하기로 하였다.
        </p>
      </div>

      <div className="absolute bottom-5 right-5 w-[min(88%,360px)] rounded-md border border-white/12 bg-[#111814]/95 p-4 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-semibold text-white/55">HUDTyping</span>
          <span className="rounded bg-accent/20 px-2 py-0.5 text-[11px] font-bold text-[#f3c2ae]">
            커서 앞 검색
          </span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-lg font-bold">정리</p>
            <p className="mt-1 text-sm leading-6 text-white/70">
              흐트러진 것이나 어수선한 것을 질서 있게 바로잡음.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-white/60">
            <span className="rounded border border-white/10 py-1">1회 정리</span>
            <span className="rounded border border-white/10 py-1">2회 안건 정리</span>
            <span className="rounded border border-white/10 py-1">3회 회의 안건 정리</span>
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
          : "border-border bg-muted-bg text-muted"
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
    <article className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-bold text-accent">{label}</p>
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
        <span className="h-2 w-2 rounded-full bg-accent" />
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
