// src/app/help/page.tsx
// 인앱 사용 가이드 — 가입부터 검색까지 한 페이지에 정리.
// 사용자가 처음 진입할 때 가장 먼저 보는 곳.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "사용 가이드 — hudtyping",
};

export default function HelpPage() {
  return (
    <main className="flex-1 px-6 sm:px-10 py-12 max-w-3xl w-full mx-auto bg-background text-foreground">
      <Link
        href="/"
        className="text-sm text-muted hover:text-foreground transition"
      >
        ← 홈으로
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-3">
        사용 가이드
      </h1>
      <p className="text-muted leading-relaxed mb-10">
        가입부터 한글에서 검색하기까지, 처음 한 번만 따라하면 돼요.
        <br />
        총 5분 정도 걸려요.
      </p>

      {/* 빠른 이동 */}
      <nav className="rounded-2xl border border-border bg-muted-bg p-4 mb-12 flex flex-col gap-2 text-sm">
        <span className="font-semibold mb-1">빠른 이동</span>
        <a href="#step1" className="hover:text-accent transition">
          1. 가입 + 승인 받기
        </a>
        <a href="#step2" className="hover:text-accent transition">
          2. API 키 발급
        </a>
        <a href="#step3" className="hover:text-accent transition">
          3. 데스크톱 앱 설치
        </a>
        <a href="#step4" className="hover:text-accent transition">
          4. 단축키로 검색
        </a>
        <a href="#step5" className="hover:text-accent transition">
          5. 자주 묻는 질문
        </a>
      </nav>

      <div className="flex flex-col gap-12 leading-relaxed">
        {/* ── Step 1 ─────────────────────────────── */}
        <section id="step1" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">1. 가입 + 승인 받기</h2>
          <p>
            <Link href="/sign-up" className="underline text-accent">
              회원가입
            </Link>
            {" "}후 자동으로 <strong>승인 대기 페이지</strong>로 이동해요. 베타 운영
            중이라 관리자가 가입을 검토해요. 보통 1~24시간 안에 승인되고, 승인되면
            바로 서비스 이용 가능해요.
          </p>
          <p className="text-sm text-muted">
            이미 가입했으면{" "}
            <Link href="/sign-in" className="underline">
              로그인
            </Link>
            으로 이동.
          </p>
        </section>

        {/* ── Step 2 ─────────────────────────────── */}
        <section id="step2" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">2. API 키 발급</h2>
          <p>
            데스크톱 앱이 SaaS와 통신할 때 사용하는 인증 키예요.{" "}
            <strong>계정당 1개</strong>만 발급돼요.
          </p>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>
              로그인 후{" "}
              <Link href="/dashboard" className="underline">
                대시보드
              </Link>
              에서 <strong>"🔑 API 키"</strong> 카드 클릭
            </li>
            <li>
              키 이름 입력 (예: <em>"내 노트북"</em>) → <strong>발급</strong>
            </li>
            <li>
              <strong>평문 키가 노란 박스에 1회만 표시</strong>돼요. 즉시 복사해서
              메모장이나 비밀번호 관리자에 보관
            </li>
            <li>"확인" 닫으면 다시 못 봐요. 잃어버리면 삭제 후 재발급</li>
          </ol>
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 dark:bg-amber-950/20 dark:border-amber-800/40 p-4 text-sm">
            ⚠️ 키는 비밀번호 같은 거예요. 다른 사람에게 노출되면 즉시 삭제 후
            재발급하세요.
          </div>
        </section>

        {/* ── Step 3 ─────────────────────────────── */}
        <section id="step3" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">3. 데스크톱 앱 설치</h2>
          <p>홈 페이지의 다운로드 버튼을 누르면 .exe 파일이 다운로드돼요.</p>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>
              <code className="bg-muted-bg px-1.5 py-0.5 rounded text-xs">
                hudtyping-Setup-0.1.0.exe
              </code>{" "}
              실행
            </li>
            <li>
              Windows Defender 경고 시: <strong>"추가 정보"</strong> →{" "}
              <strong>"실행"</strong> 클릭
            </li>
            <li>
              안랩·알약 등 백신이 차단할 수도 있어요 →{" "}
              <Link href="/install-help" className="underline text-accent">
                설치 도움말
              </Link>
              {" "}참고
            </li>
            <li>설치 완료 후 자동 실행돼요</li>
          </ol>
          <p className="text-sm">
            설치 후 <strong>시스템 트레이</strong>(작업표시줄 우측 하단)에 빨간
            동그라미 + M 아이콘이 생겨요.
          </p>
          <h3 className="font-display text-lg mt-2">API 키 입력</h3>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>HUD 창의 ⚙ (설정) 버튼 클릭, 또는 트레이 아이콘 우클릭</li>
            <li>
              <strong>API 키</strong> 입력란에 발급받은{" "}
              <code className="bg-muted-bg px-1.5 py-0.5 rounded text-xs">
                hk_live_...
              </code>{" "}
              붙여넣기
            </li>
            <li>
              <strong>저장</strong> 클릭 → "저장됨!" 표시
            </li>
          </ol>
        </section>

        {/* ── Step 4 ─────────────────────────────── */}
        <section id="step4" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">4. 단축키로 검색</h2>
          <p>
            기본 단축키는 <strong>F2</strong> (블록 검색) /{" "}
            <strong>F3</strong> (이전 단어 자동 검색)이지만,{" "}
            <strong>자유롭게 변경 가능</strong>해요. 평소 안 쓰는 키(예:{" "}
            <kbd className="bg-muted-bg px-1.5 py-0.5 rounded text-xs">Insert</kbd>
            ,{" "}
            <kbd className="bg-muted-bg px-1.5 py-0.5 rounded text-xs">Pause</kbd>
            )로 바꿔두면 한글 작업 흐름과 충돌이 적어요.
          </p>

          <h3 className="font-display text-lg mt-2">블록 선택 검색 (기본 F2)</h3>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>한글에서 모르는 단어를 마우스로 <strong>블록 선택</strong></li>
            <li>지정한 단축키 누름</li>
            <li>HUD에 결과 카드 즉시 표시</li>
          </ol>

          <h3 className="font-display text-lg mt-3">
            이전 단어 자동 검색 (기본 F3)
          </h3>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>한글에서 어떤 단어 뒤에 커서 두기 (블록 안 잡아도 됨)</li>
            <li>지정한 단축키 누름 → 커서 앞 단어 자동 검색</li>
            <li>
              <strong>연속해서 더 누르면</strong> 띄어쓰기를 넘어 한 단어씩
              확장돼요. 두 번째 누름 → 앞 두 단어를 묶어서, 세 번째 → 세 단어,
              계속 누를수록 더 길게.
            </li>
          </ol>
          <div className="rounded-xl border border-border bg-muted-bg p-4 text-sm">
            <p className="font-semibold mb-1">예시</p>
            <p className="text-muted leading-relaxed">
              <code className="bg-card px-1.5 py-0.5 rounded text-xs">
                회의 안건 정리|
              </code>
              {" "}커서 위치에서 단축키를 누르면 →{" "}
              <strong>"정리"</strong> 검색.
              <br />
              한 번 더 → <strong>"안건 정리"</strong> 검색.
              <br />
              세 번째 → <strong>"회의 안건 정리"</strong> 전체 검색.
            </p>
          </div>

          <h3 className="font-display text-lg mt-3">단축키 변경</h3>
          <ol className="list-decimal pl-5 flex flex-col gap-1.5">
            <li>HUD 설정 패널 열기</li>
            <li><strong>단축키</strong> 입력란 클릭</li>
            <li>원하는 키 한 번 누르기 → 자동 저장</li>
          </ol>

          <h3 className="font-display text-lg mt-3">HUD 옵션</h3>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              <strong>투명도</strong>: 트레이 우클릭 → 투명도 → 30/60/85/100%
            </li>
            <li>
              <strong>클릭 통과 모드</strong>: 마우스 클릭이 HUD를 통과해 한글에
              그대로 전달돼요. 검색 결과만 보고 한글에서 작업 계속할 때 편리.
            </li>
            <li>
              <strong>보이기/숨기기</strong>: 트레이 아이콘 좌클릭으로 토글
            </li>
          </ul>
        </section>

        {/* ── Step 5 — FAQ ─────────────────────────── */}
        <section id="step5" className="flex flex-col gap-3">
          <h2 className="font-display text-2xl">5. 자주 묻는 질문</h2>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              가입했는데 승인이 안 와요
            </summary>
            <p className="mt-2 text-sm text-muted">
              관리자가 직접 검토해요. 24시간 안에 안 오면 phk901031@gmail.com로
              문의 주세요.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              백신이 .exe를 차단해요
            </summary>
            <p className="mt-2 text-sm text-muted">
              코드 서명 인증서 미발급 상태라 보수적인 백신이 진단 오류로 격리해요.{" "}
              <Link href="/install-help" className="underline text-accent">
                설치 도움말
              </Link>
              에 백신별 해제 방법 있어요.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              API 키를 잃어버렸어요
            </summary>
            <p className="mt-2 text-sm text-muted">
              발급 시 1회만 보여주고 다시 못 봐요.{" "}
              <Link href="/api-keys" className="underline">
                /api-keys
              </Link>
              에서 기존 키 삭제 → 새 키 발급 → 데스크톱 앱에 다시 입력.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              월 검색 한도가 있나요?
            </summary>
            <p className="mt-2 text-sm text-muted">
              일반 사용자는 <strong>월 500회</strong>예요. 매월 1일 0시(UTC)
              리셋. 본인 사용량은{" "}
              <Link href="/stats" className="underline">
                /stats
              </Link>
              에서 확인 가능. 한도 초과 시 다음 달까지 일시 제한돼요.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              단축키가 안 먹혀요
            </summary>
            <p className="mt-2 text-sm text-muted">
              다른 프로그램이 같은 키를 점유 중일 가능성이 커요. HUD 설정에서 평소
              안 쓰는 다른 키로 변경. 그래도 안 되면 관리자 권한으로 HUD 재실행.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              한자가 깨져 보여요
            </summary>
            <p className="mt-2 text-sm text-muted">
              Windows의 동아시아 언어팩 설치 필요. 설정 → 시간 및 언어 → 언어 →
              일본어/중국어(간체) 추가.
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              데이터(검색 기록)는 어떻게 관리되나요?
            </summary>
            <p className="mt-2 text-sm text-muted">
              우리 DB에만 저장하고 외부 분석 도구로 안 보내요. 계정 삭제 시 검색
              기록도 자동 삭제. 자세한 내용은{" "}
              <Link href="/privacy" className="underline">
                개인정보 처리방침
              </Link>
              .
            </p>
          </details>

          <details className="border border-border rounded-xl p-4">
            <summary className="font-semibold cursor-pointer">
              다른 PC에도 설치하고 싶어요
            </summary>
            <p className="mt-2 text-sm text-muted">
              같은 .exe를 다른 PC에 설치하고 같은 API 키를 입력하면 돼요. 키는
              계정당 1개라 모든 디바이스가 같은 키 공유.
            </p>
          </details>
        </section>

        <section className="rounded-2xl border border-accent/30 bg-accent-soft p-5 mt-4">
          <h3 className="font-display text-lg mb-2">해결이 안 되면</h3>
          <p className="text-sm">
            <a
              href="mailto:phk901031@gmail.com"
              className="underline font-medium"
            >
              phk901031@gmail.com
            </a>
            로 어떤 화면에서 어떤 메시지가 나왔는지 (스크린샷 첨부 가능) 보내주세요.
            보통 1~2일 안에 답해드려요.
          </p>
        </section>
      </div>
    </main>
  );
}
