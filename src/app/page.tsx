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
      <nav className="border-b border-border bg-card/70">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="group inline-flex items-center gap-2.5">
            <span className="keycap h-10 w-10 text-base">H</span>
            <span className="font-display text-xl">hudtyping</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/help"
              className="hidden text-sm text-muted transition hover:text-foreground sm:inline"
            >
              사용 가이드
            </Link>
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted-bg"
                >
                  대시보드
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <Link
                  href="/sign-in"
                  className="text-sm text-muted transition hover:text-foreground"
                >
                  로그인
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  가입하기
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-5 py-8 sm:px-8 sm:py-10">
        <section className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="flex flex-col justify-between gap-8 rounded-lg border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill tone="green">서비스 운영 중</StatusPill>
                <StatusPill>Windows v0.2.2</StatusPill>
                <StatusPill>승인 후 사용</StatusPill>
              </div>

              <div className="flex max-w-3xl flex-col gap-4">
                <h1 className="font-display text-3xl leading-tight sm:text-5xl">
                  한글 작업 중 단어 검색을 바로 띄우는 속기사용 HUD
                </h1>
                <p className="text-base leading-relaxed text-muted sm:text-lg">
                  한글 문서에서 커서 앞 단어를 지정 단축키로 검색하고,
                  우리말샘 결과를 작은 HUD로 확인합니다. 설치, 승인,
                  문의까지 이 화면에서 바로 처리할 수 있습니다.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={DOWNLOAD_URL}
                className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Windows 앱 다운로드
              </a>
              <Link
                href="/help"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted-bg"
              >
                사용 가이드 보기
              </Link>
              {!isSignedIn && (
                <Link
                  href="/sign-up"
                  className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold transition hover:bg-muted-bg"
                >
                  승인 요청하기
                </Link>
              )}
            </div>
          </div>

          <aside className="grid gap-4">
            <ActionPanel
              title="빠른 승인"
              body="가입 후 성명 확인이 필요합니다. 빠른 승인을 원하면 카카오톡 papawheels로 연락해주세요."
              action="카카오톡 papawheels"
              href="#support"
              tone="yellow"
            />
            <ActionPanel
              title="설치가 막힐 때"
              body="안랩, 알약, Windows 보안에서 설치 파일을 검사하거나 차단할 수 있습니다."
              action="설치 문제 해결"
              href="/install-help"
            />
          </aside>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <WorkflowCard
            step="1"
            title="앱 설치"
            body="최신 설치 파일을 내려받고 실행합니다. 기존 사용자는 자동 업데이트 또는 재설치로 v0.2.2를 받을 수 있습니다."
          />
          <WorkflowCard
            step="2"
            title="API 키 입력"
            body="SaaS 대시보드에서 발급한 키를 HUD 설정에 붙여넣습니다. 사용자는 별도 우리말샘 키가 필요 없습니다."
          />
          <WorkflowCard
            step="3"
            title="한글에서 검색"
            body="단어 뒤에 커서를 두고 지정 단축키를 누릅니다. 연속 입력하면 띄어쓰기 앞 단어까지 확장해 검색할 수 있습니다."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div id="support" className="rounded-lg border border-border bg-card p-6">
            <h2 className="font-display text-2xl">운영 안내</h2>
            <div className="mt-5 divide-y divide-border">
              <Notice title="검색 속도 개선" date="2026.07.02">
                자주 검색되는 단어는 서버 캐시에 저장되어 다음 검색부터 더
                빠르게 표시됩니다.
              </Notice>
              <Notice title="최신 버전" date="v0.2.2">
                커서 앞 검색 중심으로 단축키 화면을 정리하고, 연속 입력 시 검색어를 먼저 확장한 뒤 한 번만 검색하도록 개선했습니다.
              </Notice>
              <Notice title="문의 창구" date="상시">
                오류 제보, 승인 요청, 기능 건의는 카카오톡 papawheels로
                보내주세요.
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
                body="설치부터 단축키 검색까지"
                href="/help"
                label="가이드"
              />
              <SupportLink
                title="설치 문제"
                body="보안 프로그램 차단 대응"
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

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone?: "green";
}) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${
        tone === "green"
          ? "border-success/30 bg-success/10 text-success"
          : "border-border bg-muted-bg text-muted"
      }`}
    >
      {children}
    </span>
  );
}

function ActionPanel({
  title,
  body,
  action,
  href,
  external,
  tone,
}: {
  title: string;
  body: string;
  action: string;
  href: string;
  external?: boolean;
  tone?: "yellow";
}) {
  return (
    <div
      className={`rounded-lg border p-5 ${
        tone === "yellow"
          ? "border-[#E7D367] bg-[#FEE500]/25"
          : "border-border bg-card"
      }`}
    >
      <h2 className="font-display text-xl">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted">{body}</p>
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="mt-4 inline-flex rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90"
      >
        {action}
      </a>
    </div>
  );
}

function WorkflowCard({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">
          {step}
        </span>
        <h2 className="font-display text-xl">{title}</h2>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted">{body}</p>
    </div>
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
    <div className="grid gap-2 py-4 sm:grid-cols-[120px_1fr]">
      <span className="text-xs font-medium text-accent">{date}</span>
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-relaxed text-muted">{children}</p>
      </div>
    </div>
  );
}

function SupportLink({
  title,
  body,
  href,
  label,
  external,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      className="rounded-lg border border-border p-4 transition hover:bg-muted-bg"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted">{body}</p>
        </div>
        <span className="shrink-0 rounded-full bg-muted-bg px-2.5 py-1 text-xs text-muted">
          {label}
        </span>
      </div>
    </a>
  );
}
