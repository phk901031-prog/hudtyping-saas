import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@/infrastructure/clerk";

const DOWNLOAD_URL = "/download/windows";

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      <nav className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-3">
            <span className="keycap h-11 w-11 text-base">H</span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-xl">HUDTyping</span>
              <span className="mt-1 text-[11px] font-medium text-muted">
                한글 문서 위에서 쓰는 우리말샘 HUD
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
                  가입 승인 요청
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

          <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-5 pb-16 pt-10 sm:px-8 lg:min-h-[640px] lg:grid-cols-[0.86fr_1.14fr] lg:items-center lg:pb-16 lg:pt-12">
            <div className="flex flex-col justify-center gap-6">
              <div className="flex flex-wrap gap-2">
                <StatusPill tone="green">서비스 운영 중</StatusPill>
                <StatusPill tone="dark">Windows v0.2.10</StatusPill>
                <StatusPill tone="dark">승인 계정 전용</StatusPill>
              </div>

              <div className="flex max-w-2xl flex-col gap-4">
                <p className="w-fit rounded-full border border-white/12 bg-white/7 px-3 py-1 text-xs font-bold text-[#a8fff4]">
                  계정 승인 후 연결 코드로 Windows 앱을 연결합니다
                </p>
                <h1 className="font-display text-3xl leading-tight [word-break:keep-all] sm:text-5xl lg:text-[3.25rem]">
                  한글 문서에서 벗어나지 않고
                  <br />
                  커서 앞 단어를 바로 검색합니다.
                </h1>
                <p className="max-w-xl text-base leading-7 text-white/78 [word-break:keep-all] sm:text-lg">
                  HUDTyping은 속기사 업무 중 Alt+Tab, 브라우저 검색, 단어 복사 과정을 줄이기 위한
                  Windows HUD입니다. 웹에서 승인된 계정으로 연결 코드를 발급하고, 앱에 한 번 입력하면
                  이후에는 지정 키만 눌러 우리말샘 검색 결과를 확인할 수 있습니다.
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
                  href={isSignedIn ? "/api-keys" : "/sign-in"}
                  className="inline-flex items-center justify-center rounded-lg border border-white/18 bg-white/8 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/14"
                >
                  연결 코드 발급
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
            <ProofCard label="AUTH" value="승인 계정 + 1회용 연결 코드" />
            <ProofCard label="FLOW" value="설치 후 계정 연결, 이후 자동 인증" />
            <ProofCard label="OPS" value="사용량, 통계, 버전 관리를 웹에서 확인" />
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.72fr_1.28fr]">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-accent">계정 연결 방식</p>
            <h2 className="font-display text-3xl [word-break:keep-all]">
              API 키를 복사하지 않습니다. 웹에서 발급한 연결 코드만 입력합니다.
            </h2>
            <p className="text-[17px] leading-8 text-muted">
              사용자는 우리말샘 API 키를 직접 발급하거나 관리하지 않습니다. 관리자가 승인한 계정만
              프로그램 연결 코드를 만들 수 있고, 코드는 10분 동안 한 번만 사용할 수 있습니다.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <FeatureCard
              label="01"
              title="가입 승인"
              body="회원가입 후 관리자가 실명과 이메일을 확인합니다. 빠른 승인은 카카오톡 papawheels로 요청할 수 있습니다."
            />
            <FeatureCard
              label="02"
              title="연결 코드 발급"
              body="승인된 계정으로 로그인한 뒤 대시보드의 프로그램 연결에서 10분짜리 1회용 코드를 발급합니다."
            />
            <FeatureCard
              label="03"
              title="앱에 코드 입력"
              body="Windows 앱 설정의 계정 연결 칸에 이메일이 아니라 연결 코드를 입력합니다. 완료 후에는 다시 입력하지 않아도 됩니다."
            />
          </div>
        </section>

        <section className="border-y border-border bg-panel">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="flex flex-col justify-center gap-3">
              <p className="text-sm font-bold text-accent">사용 흐름</p>
              <h2 className="font-display text-3xl [word-break:keep-all]">
                한글 문서에 커서를 두고, 지정 키만 누르면 됩니다.
              </h2>
              <p className="text-[17px] leading-8 text-muted">
                블록 지정 기능은 덜어내고 커서 앞 검색에 집중했습니다. 단축키를 연속으로 누르면
                띄어쓰기를 넘어 검색어가 확장되어 더 긴 표현을 빠르게 확인할 수 있습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <GuideStep
                step="01"
                title="커서 두기"
                body="한글 문서에서 검색할 단어 또는 표현 바로 뒤에 커서를 둡니다."
                sample="회의 의견 정리|"
              />
              <GuideStep
                step="02"
                title="단축키 입력"
                body="기본 F3 또는 사용자가 지정한 Insert 같은 키를 누릅니다."
                sample="Insert"
                keycap
              />
              <GuideStep
                step="03"
                title="HUD 확인"
                body="작은 HUD 창에서 우리말샘 결과를 확인하고 바로 문서 작성으로 돌아갑니다."
                sample="우리말샘 응답 지연 중"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div className="flex flex-col gap-3">
            <p className="text-sm font-bold text-accent">운영 관리</p>
            <h2 className="font-display text-3xl [word-break:keep-all]">
              개인용 유틸이 아니라, 운영 가능한 SaaS로 관리합니다.
            </h2>
            <p className="text-[17px] leading-8 text-muted">
              관리자 화면에서 가입 승인, 월 검색 한도, 사용자별 검색 기록, 인기 검색어, 시간대별
              사용량을 확인할 수 있습니다. 문제 제보와 승인 요청은 카카오톡 papawheels로 모읍니다.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FeatureCard
              label="ADMIN"
              title="사용자 승인과 한도 관리"
              body="관리자를 제외한 사용자는 기본 월 500회로 운영하고, 필요하면 사용자별 한도를 조정할 수 있습니다."
            />
            <FeatureCard
              label="STATS"
              title="검색 기록과 사용량 통계"
              body="누가 많이 쓰는지, 어떤 단어가 많이 검색되는지, 어느 시간대에 사용량이 몰리는지 확인합니다."
            />
            <FeatureCard
              label="VERSION"
              title="버전 배포와 업데이트"
              body="Windows 설치 파일은 릴리스 버전으로 관리하고, 홈페이지 다운로드는 최신 안내 페이지를 거쳐 제공합니다."
            />
            <FeatureCard
              label="SUPPORT"
              title="카카오톡 문의 창구"
              body="가입 승인, 설치 차단, 오류 제보, 기능 건의는 papawheels 친구 추가 후 메시지로 받습니다."
            />
          </div>
        </section>

        <section className="border-y border-border bg-ink text-white">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-14 sm:px-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center">
            <div>
              <p className="text-sm font-bold text-[#a8fff4]">시작 순서</p>
              <h2 className="mt-3 font-display text-3xl [word-break:keep-all]">
                처음 사용하는 사람은 이 순서대로 진행하면 됩니다.
              </h2>
              <p className="mt-4 text-[17px] leading-8 text-white/72">
                앱에는 이메일을 입력하지 않습니다. 반드시 웹에서 발급한 연결 코드를 입력해야 합니다.
              </p>
            </div>
            <div className="grid gap-3">
              <FlowRow number="1" title="가입 승인 요청" body="실명과 이메일로 가입 후 관리자 승인을 기다립니다." />
              <FlowRow number="2" title="Windows 앱 설치" body="홈페이지의 다운로드 버튼으로 최신 설치 파일을 받습니다." />
              <FlowRow number="3" title="연결 코드 발급" body="승인 후 대시보드의 프로그램 연결에서 10분짜리 코드를 만듭니다." />
              <FlowRow number="4" title="앱 계정 연결" body="앱 설정의 계정 연결 칸에 연결 코드를 입력하고 검색을 시작합니다." />
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-6xl gap-5 px-5 py-14 sm:px-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="support" className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">운영 안내</h2>
            <div className="mt-5 divide-y divide-border">
              <Notice title="현재 배포 버전" date="v0.2.10">
                계정 연결 코드 방식이 반영된 Windows 앱입니다. 앱 설정에 이메일이 아니라 연결 코드를 입력합니다.
              </Notice>
              <Notice title="검색 지연 안내" date="검색">
                우리말샘 또는 서버 응답이 늦으면 앱에 “우리말샘 응답 지연 중”으로 표시합니다.
                반복 검색어는 캐시를 통해 더 빠르게 응답하도록 운영합니다.
              </Notice>
              <Notice title="문의 창구" date="상시">
                가입 승인, 설치 오류, 기능 건의는 카카오톡 <strong>papawheels</strong> 친구 추가 후 보내주세요.
              </Notice>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">바로 가기</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <SupportLink
                title="프로그램 연결"
                body="승인 계정으로 연결 코드 발급"
                href={isSignedIn ? "/api-keys" : "/sign-in"}
                label={isSignedIn ? "발급" : "로그인"}
              />
              <SupportLink
                title="사용 가이드"
                body="설치부터 커서 앞 검색까지"
                href="/help"
                label="가이드"
              />
              <SupportLink
                title="설치 문제 해결"
                body="백신 차단, Defender 경고"
                href="/install-help"
                label="해결법"
              />
              <SupportLink
                title="대시보드"
                body="사용량과 연결 상태 확인"
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
      <TrustItem label="AUTH" value="승인 계정 전용" />
      <TrustItem label="CODE" value="10분 1회용 연결" />
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

function FlowRow({
  number,
  title,
  body,
}: {
  number: string;
  title: string;
  body: string;
}) {
  return (
    <article className="flex gap-4 rounded-lg border border-white/12 bg-white/7 p-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-signal text-sm font-bold text-white">
        {number}
      </span>
      <div>
        <h3 className="font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-white/68">{body}</p>
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
