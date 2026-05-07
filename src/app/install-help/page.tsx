// src/app/install-help/page.tsx
// 데스크톱 앱 설치 시 백신/SmartScreen 차단되는 경우 해결법.
// 코드 서명 인증서 없는 베타 단계에서 자주 발생하는 문제.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "설치 도움말 — hudtyping",
};

export default function InstallHelpPage() {
  return (
    <main className="flex-1 px-6 sm:px-10 py-12 max-w-3xl w-full mx-auto bg-background text-foreground">
      <Link
        href="/"
        className="text-sm text-muted hover:text-foreground transition"
      >
        ← 홈으로
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">
        설치 도움말
      </h1>
      <p className="text-muted mb-8 leading-relaxed">
        백신이나 Windows Defender가 .exe를 차단하는 경우의 해결법이에요.
        <br />
        코드 서명 인증서 없는 베타 .exe라 보수적인 백신이 가끔 진단 오류로
        격리해요. 실제 악성코드는 아니에요.
      </p>

      <div className="flex flex-col gap-8 leading-relaxed">
        <section className="rounded-2xl border border-border bg-muted-bg p-5">
          <h2 className="font-display text-lg mb-2">왜 이런 일이 생기나요?</h2>
          <p className="text-sm text-muted">
            상용 .exe는 보통 코드 서명 인증서 (연 30~50만원)로 서명돼요. 그게
            있으면 백신이 발급사를 신뢰하고 통과시켜요. hudtyping은 1년 무료
            운영 단계라 인증서 비용을 미루는 중이에요. 매출 발생 시점에 정식
            인증서 도입 예정.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">
            1. 안랩 V3 / V3 Lite
          </h2>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>트레이 안랩 아이콘 우클릭 → 메인 화면 열기</li>
            <li>좌측 메뉴 <strong>"격리실"</strong> 또는 <strong>"보안 검사 결과"</strong></li>
            <li>
              <code className="bg-muted-bg px-1.5 py-0.5 rounded text-xs">
                hudtyping-Setup-0.1.0.exe
              </code>{" "}
              찾아서 선택
            </li>
            <li><strong>"복원"</strong> 또는 <strong>"신뢰 처리"</strong> 클릭</li>
            <li>
              (재발 방지) 환경설정 → <strong>검사 예외</strong> → .exe 경로
              추가
            </li>
            <li>다시 .exe 실행 → 설치 진행</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">2. 알약</h2>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>알약 메인 화면 → <strong>격리실</strong></li>
            <li>해당 파일 선택 → <strong>복원</strong></li>
            <li>환경설정 → 검사 예외 → 추가</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">3. Windows Defender / SmartScreen</h2>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>.exe 실행 시 "Windows의 PC 보호" 파란 창</li>
            <li>
              <strong>"추가 정보"</strong> 글자 클릭 (오른쪽 위 작게 표시됨)
            </li>
            <li>"실행" 버튼이 새로 나타남 → 클릭</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">4. 그래도 안 되면</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              백신을 잠시 일시 정지 → 설치 → 다시 활성화 (보안상 비권장이지만
              빠름)
            </li>
            <li>
              회사 PC라 백신 정책을 못 바꾸는 경우, IT 부서에 화이트리스트
              요청
            </li>
            <li>
              그래도 안 되면 카카오톡 <strong>papawheels</strong>로 친구 추가 후
              알려주세요. 안랩 등 백신사에 진단 오류 신고하고 며칠 안에
              해제되도록 처리해 드릴게요.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-accent/30 bg-accent-soft p-5">
          <h2 className="font-display text-lg mb-2">파일이 진짜 안전한가요?</h2>
          <p className="text-sm leading-relaxed">
            .exe는 GitHub Releases에 공개되어 있고, SHA256 해시로 무결성을
            확인할 수 있어요. 소스 코드도 같은 저장소에 함께 공개돼 있어 누구나
            검토 가능해요.
          </p>
          <p className="text-xs mt-3">
            <a
              href="https://github.com/phk901031-prog/hudtyping-saas/releases/latest"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              GitHub Releases 페이지 →
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}
