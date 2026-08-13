// src/app/install-help/page.tsx
// 데스크톱 앱 설치 시 백신/SmartScreen 차단되는 경우 해결법.
// 코드 서명 인증서 없는 베타 단계에서 자주 발생하는 문제.

import Link from "next/link";
import type { Metadata } from "next";
import { OPENCHAT } from "@/config/community";
import { WINDOWS_RELEASE } from "@/config/release";

export const metadata: Metadata = {
  title: "설치 도움말 — 낱말지기 온라인",
  description: "낱말지기 온라인 설치 중 Windows SmartScreen이나 백신 경고가 표시될 때 확인할 내용.",
  alternates: { canonical: "/work/natmalgi/install-help" },
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
        백신이나 Windows Defender가 설치 파일을 차단하는 경우의 확인 방법입니다.
        <br />
        현재 설치 파일에는 코드 서명 인증서가 적용되지 않아 SmartScreen 경고가 표시될 수 있습니다.
      </p>

      <div className="flex flex-col gap-8 leading-relaxed">
        <section className="rounded-2xl border border-border bg-muted-bg p-5">
          <h2 className="font-display text-lg mb-2">왜 이런 일이 생기나요?</h2>
          <p className="text-sm text-muted">
            코드 서명은 파일 배포 주체와 서명 이후 변경 여부를 확인하는 수단입니다.
            낱말지기 온라인은 아직 코드 서명을 적용하지 않아 Windows가 게시자를
            확인할 수 없으며, 다운로드 이력이 적은 새 버전은 추가 경고가 표시될 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">
            1. 안랩 V3 / V3 Lite
          </h2>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>트레이 안랩 아이콘 우클릭 → 메인 화면 열기</li>
            <li>좌측 메뉴 <strong>‘격리실’</strong> 또는 <strong>‘보안 검사 결과’</strong></li>
            <li>
              <code className="bg-muted-bg px-1.5 py-0.5 rounded text-xs">
                hudtyping-Setup-{WINDOWS_RELEASE.version}.exe
              </code>{" "}
              찾아서 선택
            </li>
            <li><strong>‘복원’</strong> 또는 <strong>‘신뢰 처리’</strong> 클릭</li>
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
            <li>.exe 실행 시 ‘Windows의 PC 보호’ 파란 창</li>
            <li>
              <strong>‘추가 정보’</strong> 글자 클릭 (오른쪽 위 작게 표시됨)
            </li>
            <li>파일 출처와 이름을 확인한 뒤 ‘실행’ 버튼 클릭</li>
          </ol>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">4. 그래도 안 되면</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              백신을 끄지 말고 격리 내역과 탐지명을 확인한 뒤 문의
            </li>
            <li>
              회사 PC라 백신 정책을 못 바꾸는 경우, IT 부서에 화이트리스트
              요청
            </li>
            <li>
              그래도 안 되면 카카오톡{" "}
              <a
                href={OPENCHAT.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-accent underline"
              >
                오픈톡방
              </a>
              에 파일명, 앱 버전, 탐지명을 알려주세요. 내용을 확인한 뒤 필요한 경우
              백신사에 오진 신고를 진행합니다.
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-accent/30 bg-accent-soft p-5">
          <h2 className="font-display text-lg mb-2">공식 설치 파일 확인</h2>
          <p className="text-sm leading-relaxed">
            아래 공식 GitHub Releases에서 받은 파일인지 먼저 확인하세요. 파일명이나
            다운로드 주소가 다르거나 백신이 구체적인 악성코드명을 탐지하면 실행하지 말고
            공지·문의 채널로 확인을 요청해 주세요.
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
