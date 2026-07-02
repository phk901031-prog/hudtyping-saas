import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용 가이드 | hudtyping",
};

export default function HelpPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 bg-background px-6 py-12 text-foreground sm:px-10">
      <Link href="/" className="text-sm text-muted transition hover:text-foreground">
        메인으로
      </Link>

      <header className="flex flex-col gap-3">
        <h1 className="font-display text-3xl sm:text-4xl">사용 가이드</h1>
        <p className="leading-relaxed text-muted">
          가입부터 한글 문서에서 커서 앞 검색을 쓰기까지 필요한 내용만 정리했습니다.
        </p>
      </header>

      <nav className="flex flex-col gap-2 rounded-lg border border-border bg-muted-bg p-4 text-sm">
        <a href="#approval" className="transition hover:text-accent">1. 가입 승인</a>
        <a href="#api-key" className="transition hover:text-accent">2. API 키 발급</a>
        <a href="#install" className="transition hover:text-accent">3. Windows 앱 설치</a>
        <a href="#search" className="transition hover:text-accent">4. 커서 앞 검색</a>
        <a href="#faq" className="transition hover:text-accent">5. 자주 묻는 질문</a>
      </nav>

      <section id="approval" className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">1. 가입 승인</h2>
        <p className="leading-relaxed">
          <Link href="/sign-up" className="text-accent underline">회원가입</Link> 후 관리자가
          가입자를 확인하면 서비스를 사용할 수 있습니다. 빠른 승인이 필요하면 카카오톡
          <strong> papawheels</strong> 친구 추가 후 가입한 이메일과 성명을 보내주세요.
        </p>
      </section>

      <section id="api-key" className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">2. API 키 발급</h2>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5">
          <li>로그인 후 대시보드로 이동합니다.</li>
          <li>API 키 카드에서 키를 발급합니다.</li>
          <li>발급된 <code className="rounded bg-muted-bg px-1.5 py-0.5 text-xs">hk_live_...</code> 키를 복사합니다.</li>
          <li>HUD 앱 설정의 API 키 입력칸에 붙여넣고 저장합니다.</li>
        </ol>
        <p className="text-sm text-muted">
          API 키는 발급 직후 한 번만 보입니다. 잃어버리면 기존 키를 삭제하고 새로 발급하세요.
        </p>
      </section>

      <section id="install" className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">3. Windows 앱 설치</h2>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5">
          <li>메인 화면의 Windows 앱 다운로드 버튼으로 설치 파일을 받습니다.</li>
          <li>설치 파일을 실행합니다.</li>
          <li>Windows Defender 경고가 나오면 "추가 정보"를 누른 뒤 실행합니다.</li>
          <li>백신이 차단하면 <Link href="/install-help" className="text-accent underline">설치 문제 해결</Link>을 확인합니다.</li>
        </ol>
      </section>

      <section id="search" className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">4. 커서 앞 검색</h2>
        <p className="leading-relaxed">
          한글 문서에서 단어 뒤에 커서를 두고 지정한 단축키를 누르면 커서 앞 단어를 자동으로 잡아 검색합니다.
          기본 단축키는 <strong>F3</strong>이고, 설정에서 <strong>Insert</strong> 같은 키로 바꿀 수 있습니다.
        </p>
        <ol className="flex list-decimal flex-col gap-1.5 pl-5">
          <li>한글 문서에서 검색할 단어 바로 뒤에 커서를 둡니다.</li>
          <li>지정한 검색 단축키를 누릅니다.</li>
          <li>연속으로 누르면 띄어쓰기를 넘어 앞 단어까지 검색어가 확장됩니다.</li>
        </ol>
        <div className="rounded-lg border border-border bg-muted-bg p-4 text-sm">
          <p className="font-semibold">예시</p>
          <p className="mt-2 leading-relaxed text-muted">
            <code className="rounded bg-card px-1.5 py-0.5 text-xs">회의 안건 정리|</code> 에서
            한 번 누르면 <strong>"정리"</strong>, 두 번 누르면 <strong>"안건 정리"</strong>,
            세 번 누르면 <strong>"회의 안건 정리"</strong>로 확장됩니다.
          </p>
        </div>
      </section>

      <section id="faq" className="flex flex-col gap-3">
        <h2 className="font-display text-2xl">5. 자주 묻는 질문</h2>
        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer font-semibold">단축키가 동작하지 않아요</summary>
          <p className="mt-2 text-sm text-muted">
            다른 프로그램이 같은 키를 사용 중일 수 있습니다. HUD 설정에서 Insert, Pause처럼 평소 덜 쓰는 키로 바꿔보세요.
          </p>
        </details>
        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer font-semibold">우리말샘 응답 지연 중이라고 나와요</summary>
          <p className="mt-2 text-sm text-muted">
            우리말샘 또는 서버 응답이 느린 상태입니다. 자주 검색되는 단어는 캐시로 빨라지지만, 처음 검색하는 단어는 외부 API 상태의 영향을 받을 수 있습니다.
          </p>
        </details>
        <details className="rounded-lg border border-border p-4">
          <summary className="cursor-pointer font-semibold">문의는 어디로 하나요?</summary>
          <p className="mt-2 text-sm text-muted">
            승인 요청, 오류 제보, 기능 건의는 카카오톡 <strong>papawheels</strong>로 보내주세요.
          </p>
        </details>
      </section>
    </main>
  );
}
