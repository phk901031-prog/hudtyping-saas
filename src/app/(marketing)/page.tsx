import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/infrastructure/clerk";
import { WINDOWS_RELEASE } from "@/config/release";
import { OPENCHAT } from "@/config/community";
import { fetchReleases } from "@/features/updates/releases";
import { NOTES } from "@/features/notes/notes";
import { ConnectionGuideVideo } from "@/components/guides/connection-guide-video";
import { HudDemo } from "@/components/marketing/hud-demo";

const DOWNLOAD_URL = "/download/windows";

// 2026-10-27 개편: 첫 화면을 "설치 설명서"에서 "제품 가치 + 바로 체험"으로.
// 연결 방법 안내는 영상 하나 + 3단계로 합치고, 자세한 내용은 /help 로 보낸다.
// 2026-10-27 재정의: 낱말지기의 핵심은 뜻 검색이 아니라 "띄어쓰기 확인". 문구 전체를 그 기준으로.
export const metadata: Metadata = {
  title: "낱말지기 — 띄어 쓸까, 붙여 쓸까. 문서 위에서 우리말샘으로 확인",
  description:
    "한글 문서에서 헷갈리는 단어 뒤에 커서를 두고 단축키를 누르면 국립국어원 우리말샘 표제어가 문서 위 작은 창에 떠 띄어쓰기를 바로 확인할 수 있습니다. 속기사·회의록 작성자를 위한 Windows 도구.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: "/",
    siteName: "PlaySteno",
    title: "낱말지기 — 띄어 쓸까, 붙여 쓸까. 문서 위에서 우리말샘으로 확인",
    description: "음 소거, 가해^학생, 회의록 — 브라우저를 열지 않고 작업 중인 문서 위에서 우리말샘 표기로 띄어쓰기를 확인하세요. 홈페이지에서 바로 체험할 수 있습니다.",
  },
};

export const revalidate = 1800;

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);
  const releases = await fetchReleases().catch(() => []);
  const latestRelease = releases[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-14 sm:px-8 sm:pb-28 sm:pt-20">
      {/* 1. 첫 화면 — 무엇을 해 주는 도구인지 */}
      <section aria-labelledby="home-title">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          속기사·회의록 작성자를 위한 Windows 도구
        </p>
        <h1
          id="home-title"
          className="ko-heading mt-5 max-w-3xl text-[2.55rem] font-black leading-[1.12] tracking-[-0.035em] sm:text-[4rem]"
        >
          띄어 쓸까, 붙여 쓸까.
          <br />
          키 한 번이면 <span className="text-accent">문서 위에서.</span>
        </h1>
        <p className="ko-copy mt-7 max-w-2xl text-lg leading-8 text-foreground/90 sm:text-xl sm:leading-9">
          ‘음소거’일까 ‘음 소거’일까. 헷갈리는 단어 뒤에서 지정한 키를 누르면 국립국어원 우리말샘 표제어가
          작업 중인 문서 위 작은 창에 떠, 띄어 쓰는지·붙여 쓰는지·둘 다 되는지 바로 보입니다.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <a href={DOWNLOAD_URL} className="editorial-button">Windows용 내려받기</a>
          <a
            href="#try"
            className="text-sm font-bold text-foreground underline decoration-border decoration-2 underline-offset-4 transition hover:decoration-accent"
          >
            지금 여기서 체험해 보기 ↓
          </a>
        </div>
      </section>

      {/* 2. 브라우저 체험판 */}
      <section id="try" aria-labelledby="try-title" className="mt-14 scroll-mt-8 sm:mt-16">
        <h2 id="try-title" className="sr-only">브라우저 체험판</h2>
        <HudDemo />
        <p className="ko-copy mt-3 text-xs leading-5 text-muted">
          체험용 화면입니다. 실제 HUD에는 우리말샘 표제어가 표기 그대로 뜨고, 아래 판정 카드는 그 표기를 읽는 법을
          풀어 쓴 체험판 설명입니다. 실제 앱은 한글(HWP)·Word·메모장에서 동작하며, 단축키와 HUD의 위치·색상·글자 크기를
          원하는 대로 바꿀 수 있습니다.
        </p>
      </section>

      {/* 3. 기존 방식과 비교 */}
      <section aria-labelledby="compare-title" className="editorial-section">
        <SectionHeading
          id="compare-title"
          title="띄어쓰기 하나 확인하는 데 창을 몇 번 오가셨나요?"
          description="받아 적는 흐름이 끊기는 건 검색 자체보다 창을 오가는 순간입니다."
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-border p-6">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-muted">지금까지</p>
            <ol className="mt-4 space-y-3">
              {["브라우저로 창 전환", "사전 사이트 검색창 클릭", "단어를 다시 입력", "표제어의 띄어쓰기 확인", "문서 창으로 돌아와 커서 위치 찾기"].map(
                (step, i) => (
                  <li key={step} className="flex gap-3 text-[15px] leading-6 text-muted">
                    <span className="font-mono text-xs leading-6 text-muted/70">{i + 1}</span>
                    {step}
                  </li>
                )
              )}
            </ol>
          </div>
          <div className="rounded-xl bg-ink p-6 text-white">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-accent">낱말지기</p>
            <ol className="mt-4 space-y-3">
              <li className="flex gap-3 text-[15px] leading-6">
                <span className="font-mono text-xs leading-6 text-white/50">1</span>
                단어 뒤에서 지정한 키 누르기
              </li>
            </ol>
            <p className="ko-copy mt-6 border-t border-white/10 pt-5 text-sm leading-6 text-white/65">
              커서는 문서에 그대로 있습니다. 확인한 뒤 바로 이어서 입력하면 됩니다.
            </p>
          </div>
        </div>
      </section>

      {/* 4. 써 보면 알게 되는 것들 */}
      <section aria-labelledby="details-title" className="editorial-section">
        <SectionHeading
          id="details-title"
          title="써 보면 바로 알게 되는 것들"
          description="기능 이름 대신 실제 작업에서 달라지는 점만 추렸습니다."
        />
        <div className="mt-8 space-y-8">
          <Note
            title="붙여 치든 띄어 치든 같은 표제어가 잡힙니다"
            body="‘음소거’로 쳐도 ‘음 소거’가, ‘가해 학생’으로 쳐도 ‘가해^학생’이 나옵니다. 문서에 쓴 표기와 사전 표기를 바로 비교할 수 있습니다."
          />
          <Note
            title="표제어 표기가 곧 띄어쓰기 답입니다"
            body="띄어 쓴 표제어는 띄어 쓰고, ^ 표시는 띄어 쓰는 것이 원칙이되 붙여 써도 된다는 뜻입니다. - 표시는 한 단어의 짜임을 보여 줄 뿐이라 붙여 씁니다."
          />
          <Note
            title="검색되지 않으면 띄어 쓰는 것이 원칙입니다"
            body="‘사실확인’처럼 우리말샘에 한 단어로 오르지 않은 말은 단어마다 띄어 씁니다(한글 맞춤법 제2항). 결과가 없다는 것도 판단 근거가 됩니다. 다만 전문 용어는 붙여 쓰는 것도 허용됩니다(제50항)."
          />
          <Note
            title="한 번 더 누르면 앞말까지 넓혀 찾습니다"
            body="‘국정 감사’ 뒤에서 지정한 키를 한 번 누르면 ‘감사’, 빠르게 두 번 누르면 ‘국정 감사’를 찾습니다. 띄어 쓴 말이 한 표제어인지 확인할 때 씁니다."
          />
          <Note
            title="HUD는 필요한 자리에 둘 수 있습니다"
            body="화면 위·아래·좌·우에 붙이고 배경색, 투명도, 글자 크기를 조절할 수 있습니다. 단축키는 F3, Insert, Pause 등 원하는 키로 직접 정할 수 있습니다."
          />
        </div>
      </section>

      {/* 5. 시작 준비 — 영상 + 3단계 (연결 안내는 여기 한 곳에만) */}
      <section id="start" aria-labelledby="start-title" className="editorial-section">
        <SectionHeading
          id="start-title"
          title="처음 한 번만 준비하면 됩니다"
          description="가입 승인, 설치, 프로그램 연결 순서로 진행합니다. 1분 25초 영상으로 먼저 보셔도 됩니다."
        />
        <div className="mt-8">
          <ConnectionGuideVideo showHelpLink />
        </div>
        <ol className="mt-10 divide-y divide-border border-y border-border">
          <Instruction
            number="01"
            title="계정을 만들고 승인을 기다립니다"
            body="이메일과 실명으로 가입해 주세요. 빠른 승인이 필요하면 가입한 이메일을 카카오톡 문의 채널로 보내면 됩니다."
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
            title="연결 코드를 앱에 입력합니다"
            body="대시보드의 ‘프로그램 연결’에서 10분짜리 일회용 코드를 발급해 낱말지기 설정의 ‘계정 연결’ 칸에 입력합니다. 이메일이나 비밀번호를 앱에 넣지 않으며, 한 번 연결하면 다시 입력할 필요가 없습니다."
            link={{ href: isSignedIn ? "/api-keys" : "/help#program-connect", label: isSignedIn ? "연결 코드 발급" : "자세히 보기" }}
          />
        </ol>
      </section>

      {/* 6. 내려받기 — 어두운 블록으로 흐름에 리듬 */}
      <section id="download" aria-labelledby="download-title" className="mt-20 sm:mt-24">
        <div className="rounded-2xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12">
          <p className="font-mono text-xs font-semibold text-white/50">WINDOWS {WINDOWS_RELEASE.version} · Windows 10·11</p>
          <h2 id="download-title" className="ko-heading mt-3 text-2xl font-black tracking-[-0.02em] sm:text-3xl">
            다음 문서부터 바로 써 보세요.
          </h2>
          <p className="ko-copy mt-3 max-w-xl text-[15px] leading-7 text-white/65">
            설치하다 막히면 설치 도움말을 보거나 카카오톡으로 물어보세요.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-3">
            <a href={DOWNLOAD_URL} className="editorial-button">Windows용 내려받기</a>
            <Link href="/install-help" className="text-sm font-bold text-white underline decoration-white/30 decoration-2 underline-offset-4 hover:decoration-white">
              설치 도움말
            </Link>
          </div>
        </div>
      </section>

      {/* 7. WORK STENO 베타 */}
      <Link
        href="/work-steno"
        className="group mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 transition hover:border-accent sm:grid-cols-[1fr_auto] sm:items-center sm:p-8"
      >
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
            Beta testing · Coming soon
          </p>
          <p className="ko-heading mt-2 text-xl font-black tracking-[-0.025em] sm:text-2xl">
            속기사의 실제 작업 방식으로 만드는 WORK STENO
          </p>
          <p className="ko-copy mt-2 text-sm leading-6 text-muted">
            업무 유형, 참고자료, 화자 구분과 원고 완성까지. 현재 함께 검증할 속기사 베타테스터를 모집하고 있습니다.
          </p>
        </div>
        <span className="text-sm font-bold text-accent underline decoration-accent/40 underline-offset-4 group-hover:decoration-accent">
          내용 보기 →
        </span>
      </Link>

      {/* 8. 표기 노트 — 읽을거리 */}
      <section aria-labelledby="notes-title" className="editorial-section">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <SectionHeading
            id="notes-title"
            title="표기 노트"
            description="받아 적을 때 자주 헷갈리는 맞춤법과 띄어쓰기를 짧게 정리합니다."
          />
          <Link href="/notes" className="text-sm font-bold text-accent underline underline-offset-4">
            전체 보기 →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {NOTES.slice(0, 3).map((note) => (
            <Link
              key={note.slug}
              href={`/notes/${note.slug}`}
              className="feature-card flex flex-col rounded-xl border border-border bg-card p-5"
            >
              <h3 className="ko-heading text-base font-bold leading-6">{note.title}</h3>
              <p className="ko-copy mt-2 flex-1 text-sm leading-6 text-muted">{note.summary}</p>
              <span className="mt-4 text-xs font-bold text-accent">읽기 →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 9. 최근 소식 */}
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
            <h3 className="ko-heading mt-2 text-lg font-bold">문의 사항은 카카오톡으로 보내주세요</h3>
            <p className="ko-copy mt-2 text-sm leading-6 text-muted">
              가입 승인, 사용 방법, 오류 제보와 기능 건의를 한곳에서 확인하고 답변드립니다.
            </p>
            <a
              href={OPENCHAT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block text-sm font-bold text-accent underline underline-offset-4"
            >
              카카오톡 문의하기 →
            </a>
          </article>
        </div>
      </section>

      {/* 10. 자주 묻는 질문 — 접었다 펴는 방식 */}
      <section aria-labelledby="faq-title" className="editorial-section">
        <SectionHeading id="faq-title" title="자주 묻는 질문" />
        <div className="mt-7 divide-y divide-border border-y border-border">
          <Faq question="한글에서만 쓸 수 있나요?">
            아닙니다. 한글(HWP), MS Word, 메모장처럼 커서 앞 텍스트를 복사할 수 있는 Windows
            프로그램에서 사용할 수 있습니다. 프로그램의 보안 설정에 따라 캡처가 제한될 수 있습니다.
          </Faq>
          <Faq question="Mac이나 휴대폰에서도 쓸 수 있나요?">
            현재는 Windows 10·11용 앱만 제공합니다.
          </Faq>
          <Faq question="인터넷 연결이 필요한가요?">
            네. 검색 결과는 국립국어원 우리말샘 데이터를 낱말지기 서버를 거쳐 가져오기 때문에 인터넷 연결이 필요합니다.
          </Faq>
          <Faq question="단축키가 다른 프로그램과 겹치면 어떻게 하나요?">
            HUD 설정에서 Insert나 Pause처럼 평소 잘 쓰지 않는 키로 바꿔 주세요. F4를 포함해 원하는
            키를 직접 지정할 수 있습니다.
          </Faq>
          <Faq question="연결 코드를 매번 입력해야 하나요?">
            아닙니다. 최초 연결이 완료되면 다음 실행부터는 별도 입력 없이 사용할 수 있습니다.
          </Faq>
          <Faq question="설치할 때 Windows 경고가 표시돼요.">
            아직 코드 서명 인증서를 적용하기 전이라 Windows SmartScreen이나 일부 백신에서 경고가 표시될 수
            있습니다.{" "}
            <Link href="/install-help" className="font-bold text-accent underline underline-offset-4">
              설치 도움말
            </Link>
            에 확인 절차를 적어 두었습니다.
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

// <details> 로 접었다 펴기 — JS 없이 동작
function Faq({ question, children }: { question: string; children: React.ReactNode }) {
  return (
    <details className="group py-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h3 className="ko-heading text-lg font-bold">Q. {question}</h3>
        <span aria-hidden="true" className="font-mono text-lg text-accent transition group-open:rotate-45">+</span>
      </summary>
      <p className="ko-copy mt-3 text-[15px] leading-7 text-muted">{children}</p>
    </details>
  );
}

function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
