import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/infrastructure/clerk";
import { WINDOWS_RELEASE } from "@/config/release";
import { OPENCHAT } from "@/config/community";
import { fetchReleases } from "@/features/updates/releases";

const DOWNLOAD_URL = "/download/windows";

export const metadata: Metadata = {
  title: "낱말지기 온라인 — 한글 문서 위 우리말샘",
  description:
    "한글 문서에서 단어 뒤에 커서를 놓고 단축키를 누르면 우리말샘 뜻풀이와 예문이 작은 HUD에 표시됩니다.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "PlaySteno",
    title: "낱말지기 온라인 — 한글 문서 위 우리말샘",
    description: "문서를 벗어나지 않고 커서 앞 단어의 우리말샘 뜻풀이와 예문을 확인하세요.",
  },
};

export const revalidate = 1800;

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const releases = await fetchReleases().catch(() => []);
  const latestRelease = releases[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
      <section aria-labelledby="home-title">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          낱말지기 온라인 · Windows {WINDOWS_RELEASE.version}
        </p>
        <h1
          id="home-title"
          className="ko-heading mt-5 max-w-2xl text-[2.55rem] font-black leading-[1.12] tracking-[-0.035em] sm:text-[4rem]"
        >
          한글에서 단어 뒤에 커서를 놓고 <span className="text-accent">지정한 키</span>를 누르세요.
        </h1>
        <p className="ko-copy mt-7 max-w-2xl text-lg leading-8 text-foreground/90 sm:text-xl sm:leading-9">
          우리말샘 뜻풀이가 문서 위 작은 창에 뜹니다. 브라우저를 열거나 검색어를 다시
          입력하지 않아도 됩니다.
        </p>
        <p className="ko-copy mt-4 max-w-xl text-[15px] leading-7 text-muted">
          속기사와 회의록 작성자를 위한 Windows 도구입니다. 현재 무료로 운영하고 있습니다.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={DOWNLOAD_URL} className="editorial-button">Windows용 내려받기</a>
          <Link
            href={isSignedIn ? "/dashboard" : "/sign-up"}
            className="text-sm font-bold text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:decoration-accent"
          >
            {isSignedIn ? "내 대시보드 열기" : "가입 승인 요청하기"}
          </Link>
        </div>
      </section>

      <section aria-labelledby="example-title" className="editorial-section">
        <SectionHeading
          id="example-title"
          title="한 문장으로 보는 사용법"
          description="검색하려는 단어를 드래그할 필요가 없습니다. 커서 위치와 단축키만 기억하면 됩니다."
        />

        <figure className="mt-8">
          <div className="overflow-hidden rounded-[0.9rem] bg-ink text-white">
            <div className="border-b border-white/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/55">
              한글 문서
            </div>
            <div className="px-5 py-7 sm:px-8 sm:py-9">
              <p className="text-lg leading-8 text-white/85 sm:text-xl">
                다음 회의에서 안건을 다시 <strong className="text-white">정리</strong>
                <span className="ml-0.5 inline-block h-5 w-[2px] translate-y-1 bg-accent" />합니다.
              </p>
              <div className="mt-7 border-l-2 border-accent pl-4 sm:pl-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
                  지정한 키를 한 번 누른 결과
                </p>
                <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <strong className="text-2xl">정리</strong>
                  <span className="text-xs text-white/45">명사</span>
                </div>
                <p className="ko-copy mt-2 max-w-lg text-sm leading-6 text-white/72 sm:text-[15px]">
                  일정한 기준에 따라 내용을 가지런히 바로잡음.
                </p>
              </div>
            </div>
          </div>
          <figcaption className="mt-3 text-xs leading-5 text-muted">
            사용 예시입니다. 실제 HUD의 색상·투명도·글자 크기는 설정에서 바꿀 수 있습니다.
          </figcaption>
        </figure>
      </section>

      <section id="start" aria-labelledby="start-title" className="editorial-section">
        <SectionHeading
          id="start-title"
          title="처음 한 번만 준비하면 됩니다"
          description="가입 승인, 설치, 프로그램 연결 순서로 진행합니다."
        />
        <ol className="mt-8 divide-y divide-border border-y border-border">
          <Instruction
            number="01"
            title="계정을 만들고 승인을 기다립니다"
            body="이메일과 실명으로 가입해 주세요. 빠른 승인이 필요하면 가입한 이메일을 공지·문의 채널로 보내면 됩니다."
            link={{ href: isSignedIn ? "/dashboard" : "/sign-up", label: isSignedIn ? "대시보드" : "가입하기" }}
          />
          <Instruction
            number="02"
            title="Windows 앱을 설치합니다"
            body={`Windows 10·11에서 사용할 수 있습니다. 현재 배포 버전은 ${WINDOWS_RELEASE.version}입니다.`}
            link={{ href: DOWNLOAD_URL, label: "설치 파일 받기" }}
          />
          <Instruction
            number="03"
            title="연결 코드를 앱에 붙여넣습니다"
            body="대시보드에서 발급한 10분짜리 일회용 코드를 HUD 설정에 입력하면 바로 검색할 수 있습니다."
            link={{ href: isSignedIn ? "/api-keys" : "/sign-in", label: isSignedIn ? "연결 코드 발급" : "로그인" }}
          />
        </ol>
      </section>

      <section aria-labelledby="details-title" className="editorial-section">
        <SectionHeading
          id="details-title"
          title="써 보면 바로 알게 되는 것들"
          description="기능 이름 대신 실제 작업에서 달라지는 점만 추렸습니다."
        />
        <div className="mt-8 space-y-8">
          <Note
            title="한 번 더 누르면 검색 범위가 넓어집니다"
            body="‘회의 안건 정리’ 뒤에서 지정한 키를 한 번 누르면 ‘정리’, 두 번 누르면 ‘안건 정리’, 세 번 누르면 ‘회의 안건 정리’를 찾습니다."
          />
          <Note
            title="확인한 표기로 문서 안에서 바로 고칠 수 있습니다"
            body="붙여넣기 대신 글자를 직접 입력하는 방식이라 작업 중인 문서의 글꼴과 서식이 그대로 이어집니다."
          />
          <Note
            title="HUD는 필요한 자리에 둘 수 있습니다"
            body="화면 위·아래·좌·우에 붙이고 배경색, 투명도, 글자 크기를 조절할 수 있습니다. 단축키는 F3, Insert, Pause 등 원하는 키로 직접 정할 수 있습니다."
          />
        </div>
        <Link
          href="/help"
          className="mt-8 inline-block text-sm font-bold text-accent underline decoration-accent/35 underline-offset-4 hover:decoration-accent"
        >
          전체 사용 가이드 읽기 →
        </Link>
      </section>

      <section id="download" aria-labelledby="download-title" className="editorial-section">
        <div className="border-y border-border py-8 sm:py-10">
          <p className="font-mono text-xs font-semibold text-muted">WINDOWS {WINDOWS_RELEASE.version}</p>
          <h2 id="download-title" className="ko-heading mt-3 text-2xl font-black tracking-[-0.02em] sm:text-3xl">
            설치해 보고, 막히면 바로 물어보세요.
          </h2>
          <p className="ko-copy mt-3 max-w-xl text-[15px] leading-7 text-muted">
            코드 서명 인증서 확보 전이라 Windows SmartScreen이나 일부 백신에서 경고가 표시될 수
            있습니다. 설치 도움말에 확인 절차를 적어 두었습니다.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href={DOWNLOAD_URL} className="editorial-button">Windows용 내려받기</a>
            <Link href="/install-help" className="text-sm font-bold text-foreground underline decoration-border decoration-2 underline-offset-4">
              설치 문제 해결
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="news-title" className="editorial-section">
        <SectionHeading id="news-title" title="최근 소식" />
        <div className="mt-7 grid gap-8 sm:grid-cols-2">
          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">업데이트</p>
            <h3 className="ko-heading mt-2 text-lg font-bold">
              {latestRelease?.title ?? "새 버전을 준비하고 있습니다"}
            </h3>
            {latestRelease && (
              <p className="mt-1 font-mono text-xs text-muted">
                {formatShortDate(latestRelease.publishedAt)} · {latestRelease.tag}
              </p>
            )}
            <Link href="/updates" className="mt-4 inline-block text-sm font-bold text-accent underline underline-offset-4">
              변경 내용 보기 →
            </Link>
          </article>
          <article>
            <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">문의</p>
            <h3 className="ko-heading mt-2 text-lg font-bold">가입 승인과 오류 제보는 오픈톡방에서 받습니다</h3>
            <p className="ko-copy mt-2 text-sm leading-6 text-muted">
              관리자 공지·지원 채널이라 대화 알림 없이 새 버전 소식도 확인할 수 있습니다.
            </p>
            <a
              href={OPENCHAT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-bold text-accent underline underline-offset-4"
            >
              공지·문의 채널 열기 →
            </a>
          </article>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="editorial-section">
        <SectionHeading id="faq-title" title="자주 묻는 질문" />
        <div className="mt-7 divide-y divide-border border-y border-border">
          <Faq question="한글에서만 쓸 수 있나요?">
            아닙니다. 한글(HWP), MS Word, 메모장처럼 커서 앞 텍스트를 복사할 수 있는 Windows
            프로그램에서 사용할 수 있습니다. 프로그램의 보안 설정에 따라 캡처가 제한될 수 있습니다.
          </Faq>
          <Faq question="단축키가 다른 프로그램과 겹치면 어떻게 하나요?">
            HUD 설정에서 Insert나 Pause처럼 평소 잘 쓰지 않는 키로 바꿔 주세요. F4를 포함해 원하는
            키를 직접 지정할 수 있습니다.
          </Faq>
          <Faq question="무료인가요?">
            현재 무료로 운영하고 있습니다. 운영 정책이 바뀌면 홈페이지와 업데이트 로그에서 먼저
            안내합니다.
          </Faq>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ id, title, description }: { id: string; title: string; description?: string }) {
  return (
    <div>
      <h2 id={id} className="ko-heading text-2xl font-black tracking-[-0.025em] sm:text-3xl">{title}</h2>
      {description && <p className="ko-copy mt-3 max-w-2xl text-[15px] leading-7 text-muted">{description}</p>}
    </div>
  );
}

function Instruction({ number, title, body, link }: {
  number: string;
  title: string;
  body: string;
  link: { href: string; label: string };
}) {
  return (
    <li className="grid gap-3 py-6 sm:grid-cols-[2.5rem_1fr_auto] sm:items-start sm:gap-5">
      <span className="font-mono text-xs font-bold text-accent">{number}</span>
      <div>
        <h3 className="ko-heading text-lg font-bold">{title}</h3>
        <p className="ko-copy mt-2 text-[15px] leading-7 text-muted">{body}</p>
      </div>
      <Link href={link.href} className="text-sm font-bold text-accent underline underline-offset-4 sm:mt-1 sm:whitespace-nowrap">
        {link.label}
      </Link>
    </li>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  return (
    <article className="grid gap-2 sm:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] sm:gap-8">
      <h3 className="ko-heading text-lg font-bold leading-7">{title}</h3>
      <p className="ko-copy text-[15px] leading-7 text-muted">{body}</p>
    </article>
  );
}

function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <article className="py-6">
      <h3 className="ko-heading text-lg font-bold">Q. {question}</h3>
      <p className="ko-copy mt-3 text-[15px] leading-7 text-muted">{children}</p>
    </article>
  );
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
