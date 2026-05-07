// src/app/page.tsx
// 랜딩 페이지 — 비로그인 사용자가 처음 보는 화면.
// 목적: "이게 뭐고, 왜 필요하고, 어떻게 받는가" 1분 안에 전달.
//
// 디자인 방향: Claude 톤 (따뜻한 크림 배경 + 코랄 액센트 + 인간적 카피).

import Link from "next/link";
import { auth } from "@/infrastructure/clerk";
import { UserButton } from "@clerk/nextjs";

export default async function HomePage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="flex flex-1 flex-col bg-background text-foreground">
      {/* ───── 상단 네비 ───── */}
      <nav className="px-6 sm:px-10 py-5 flex items-center justify-between max-w-6xl w-full mx-auto">
        {/*
          로고 — 키캡(keyboard cap) 모티프.
          HUD가 단축키 도구라는 정체성 + Pretendard 굵은 가중으로 시인성 강화.
        */}
        <Link
          href="/"
          aria-label="hudtyping 홈"
          className="inline-flex items-center gap-2.5 group"
        >
          <span className="keycap w-10 h-10 text-base">H</span>
          <span className="font-display text-xl sm:text-2xl">hudtyping</span>
        </Link>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm text-muted hover:text-foreground transition"
              >
                대시보드
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm text-muted hover:text-foreground transition"
              >
                로그인
              </Link>
              <Link
                href="/sign-up"
                className="text-sm font-medium px-4 py-2 rounded-full bg-foreground text-background hover:opacity-90 transition"
              >
                시작하기
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section className="px-6 sm:px-10 pt-16 sm:pt-24 pb-20 max-w-6xl w-full mx-auto">
        <div className="max-w-3xl flex flex-col gap-6">
          <span className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-accent-soft text-accent text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            베타 운영 · 1년 무료
          </span>

          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl leading-[1.15] tracking-tight">
            회의록 쓰다가 단어 막혔을 때,
            <br />
            <span className="text-accent">Alt+Tab 없이</span> 찾는 법.
          </h1>

          <p className="text-lg sm:text-xl text-muted leading-relaxed max-w-2xl">
            한글에서 단어를 블록 잡고 지정한 단축키 한 번. 우리말샘 결과가 옆에
            살짝 떠요. 흐름이 끊기지 않아요.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <a
              href="https://github.com/phk901031-prog/hudtyping-saas/releases/latest/download/hudtyping-Setup-0.1.0.exe"
              className="px-6 py-3 rounded-full bg-accent text-white text-sm font-medium hover:bg-accent-hover transition inline-flex items-center justify-center gap-2"
            >
              <span>⬇</span>
              데스크톱 앱 다운로드
            </a>
            {!isSignedIn ? (
              <Link
                href="/sign-up"
                className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-muted-bg transition inline-flex items-center justify-center"
              >
                먼저 회원가입
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="px-6 py-3 rounded-full border border-border text-sm font-medium hover:bg-muted-bg transition inline-flex items-center justify-center"
              >
                대시보드로 →
              </Link>
            )}
          </div>

          <p className="text-xs text-muted mt-2">
            Windows 10·11 · v0.1.0 (86MB) · 회원가입 + 관리자 승인 후 사용
          </p>
          <p className="text-xs text-muted">
            ⚠️ 안랩·알약 등 백신이 차단할 수 있어요 (서명 미인증 .exe).{" "}
            <Link href="/install-help" className="underline hover:text-foreground transition">
              설치 도움말
            </Link>
          </p>
        </div>
      </section>

      {/* ───── 사용 흐름 (3단계) ───── */}
      <section className="px-6 sm:px-10 py-16 bg-muted-bg">
        <div className="max-w-6xl w-full mx-auto flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-accent font-medium">사용법</p>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
              세 번의 단계, 그 다음엔 단축키 하나.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <Step
              n="1"
              title="블록 잡기"
              body="한글에서 모르는 단어를 마우스로 살짝 드래그해서 블록을 잡아요. 그게 다예요."
            />
            <Step
              n="2"
              title="단축키 누르기"
              body="평소 안 쓰는 키 하나(예: Insert)를 단축키로 지정해두면, 한 번 누르는 순간 우리말샘이 그 단어를 찾기 시작해요."
            />
            <Step
              n="3"
              title="옆에서 확인"
              body="반투명 HUD가 한글 위에 떠 있어요. 시선만 살짝 옮기면 끝. 한글 작업은 그대로."
            />
          </div>
        </div>
      </section>

      {/* ───── 차별점 ───── */}
      <section className="px-6 sm:px-10 py-20 max-w-6xl w-full mx-auto">
        <div className="flex flex-col gap-12">
          <div className="max-w-2xl flex flex-col gap-2">
            <p className="text-sm text-accent font-medium">왜 hudtyping인가</p>
            <h2 className="font-display text-3xl sm:text-4xl tracking-tight">
              검색 횟수가 늘수록 더 빨라져요.
            </h2>
            <p className="text-muted text-lg leading-relaxed mt-2">
              모든 사용자의 검색이 한 캐시를 공유해요. 같은 단어를 다른 분이
              먼저 찾아봤다면, 당신은 5밀리초 안에 결과를 받아요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              icon="⌨"
              title="단축키 두 개로 충분"
              body="평소 안 쓰는 키 두 개를 직접 지정해요 — 블록 검색용·이전 단어 자동 검색용. 마우스도 거의 안 써요."
            />
            <Feature
              icon="⚡"
              title="공유 캐시로 빨라요"
              body="누군가 한 번 찾은 단어는 나에게도 즉시 응답. 우리말샘 직접 호출보다 50배 빨라요."
            />
            <Feature
              icon="🪟"
              title="HUD 오버레이"
              body="한글 위에 반투명으로 떠 있어요. 클릭 통과 모드로 두면 마우스 클릭도 한글에 그대로 전달돼요."
            />
          </div>
        </div>
      </section>

      {/* ───── 푸터 ───── */}
      <footer className="px-6 sm:px-10 py-10 border-t border-border max-w-6xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-muted">
          <div className="flex flex-col gap-1">
            <div className="inline-flex items-center gap-2 group">
              <span className="keycap w-6 h-6 text-[11px]">H</span>
              <span className="font-display text-foreground text-base">
                hudtyping
              </span>
            </div>
            <span className="text-xs">
              © 2026 hudtyping. 속기·회의록 작성을 위한 도구.
            </span>
          </div>
          <div className="flex flex-col sm:items-end gap-2">
            <a
              href="mailto:phk901031@gmail.com"
              className="hover:text-foreground transition"
            >
              phk901031@gmail.com
            </a>
            <div className="flex gap-3 text-xs">
              <Link href="/privacy" className="hover:text-foreground transition">
                개인정보 처리방침
              </Link>
              <span className="text-border">·</span>
              <Link href="/terms" className="hover:text-foreground transition">
                이용약관
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── 보조 컴포넌트 ──────────────────────────────────────────────────

function Step({
  n,
  title,
  body,
}: {
  n: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-7 sm:p-8 rounded-2xl bg-card border border-border">
      <div className="flex items-center gap-3">
        <span className="font-display text-3xl text-accent">{n}</span>
        <span className="h-px flex-1 bg-border" />
      </div>
      <h3 className="font-display text-2xl tracking-tight">{title}</h3>
      <p className="text-muted leading-relaxed text-base">{body}</p>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-4 p-7 sm:p-8 rounded-2xl bg-card border border-border">
      <span className="text-4xl">{icon}</span>
      <h3 className="font-display text-xl tracking-tight">{title}</h3>
      <p className="text-muted leading-relaxed text-base">{body}</p>
    </div>
  );
}
