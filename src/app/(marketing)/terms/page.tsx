// src/app/terms/page.tsx
// 이용약관. 베타 단계의 최소 구성.

import Link from "next/link";
import type { Metadata } from "next";
import { OPENCHAT } from "@/config/community";
import { NATMALGI_ONLINE } from "@/config/product";

export const metadata: Metadata = {
  title: "이용약관",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <main className="flex-1 px-6 sm:px-10 py-12 max-w-3xl w-full mx-auto bg-background text-foreground">
      <Link
        href="/"
        className="text-sm text-muted hover:text-foreground transition"
      >
        ← 홈으로
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">이용약관</h1>
      <p className="text-sm text-muted mb-8">최종 업데이트: 2026-08-07</p>

      <div className="flex flex-col gap-8 leading-relaxed">
        <section>
          <h2 className="font-display text-xl mb-3">1. 서비스 안내</h2>
          <p>
            PlaySteno는 속기사를 위한 도구와 정보를 제공하는 서비스입니다. 현재 공개 제품인
            낱말지기 온라인은 Windows HUD 앱과 온라인 검색 서비스로 구성되며, 커서 앞
            텍스트를 우리말샘에서 빠르게 확인할 수 있도록 돕습니다.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">2. 베타 운영 안내</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>현재 낱말지기 온라인은 무료 베타로 운영합니다.</li>
            <li>
              유료화 전환은 최소 30일 전 이메일·웹사이트로 미리 안내해 드려요.
            </li>
            <li>
              베타 단계에서는 예고 없는 다운타임·기능 변경이 있을 수 있어요.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">3. 이용 한도</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              일반 사용자: <strong>월 {NATMALGI_ONLINE.monthlySearchLimit}회</strong> 검색
              ({NATMALGI_ONLINE.quotaResetLabel} 초기화)
            </li>
            <li>관리자가 사용자별로 한도를 조정할 수 있어요</li>
            <li>한도 초과 시 다음 달까지 검색이 일시 제한돼요</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">4. 타자 게임</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>타자 게임은 현재 보상 없이 연습과 순위 기능만 제공해요</li>
            <li>로그인하지 않은 사용자는 연습할 수 있지만 순위에는 기록되지 않아요</li>
            <li>순위에는 승인된 사용자별 주간·월간 최고 기록 한 건만 반영해요</li>
            <li>설정한 닉네임과 꾸미기 효과는 순위표에 공개되며 타인을 사칭하거나 불쾌감을 주는 이름은 제한할 수 있어요</li>
            <li>자동 입력이나 결과 조작 등 비정상 기록은 순위에서 제외할 수 있어요</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">5. 사용자 의무</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>본인 계정과 프로그램 연결 정보를 안전하게 관리해 주세요</li>
            <li>연결 코드는 한 번만 사용할 수 있어요. 노출됐다면 새 코드를 발급해 다시 연결해 주세요</li>
            <li>
              자동화된 무차별 호출, 우리말샘 API의 부정한 우회 사용 등은 금지돼요
            </li>
            <li>
              위반 사항 발견 시 사전 통지 없이 계정·키가 정지될 수 있어요
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">6. 책임의 한계</h2>
          <p>
            서비스는 ‘있는 그대로(as-is)’ 제공돼요. 베타 단계의 특성상 데이터
            손실·서비스 중단·검색 결과 부정확 등이 발생할 수 있고, 이에 따른 직간접
            손해에 대해서는 책임지지 않아요. 우리말샘 사전 데이터는{" "}
            <a
              href="https://opendict.korean.go.kr/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-accent"
            >
              국립국어원 우리말샘
            </a>
            의 공식 Open API에서 제공받아요.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">7. 약관 변경</h2>
          <p>
            본 약관은 서비스 정책 변화에 따라 변경될 수 있어요. 중요한 변경은
            이메일·웹사이트로 사전 안내해 드려요.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">8. 문의</h2>
          <p>
            문의는 카카오톡{" "}
            <a
              href={OPENCHAT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-accent underline"
            >
              오픈톡방
            </a>
            에 남겨주세요.
          </p>
        </section>
      </div>
    </main>
  );
}
