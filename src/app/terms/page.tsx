// src/app/terms/page.tsx
// 이용약관. 베타 단계의 최소 구성.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "이용약관 — hudtyping",
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
      <p className="text-sm text-muted mb-8">최종 업데이트: 2026-05-07</p>

      <div className="flex flex-col gap-8 leading-relaxed">
        <section>
          <h2 className="font-display text-xl mb-3">1. 서비스 안내</h2>
          <p>
            hudtyping은 한글 워드프로세서 사용자가 단축키로 우리말샘 사전을 빠르게
            검색할 수 있게 도와주는 도구예요. 데스크톱 HUD 앱과 SaaS 백엔드로 구성돼
            있어요.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">2. 베타 운영 안내</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>현재 1년 무료 운영 단계예요. 이후 유료화로 전환될 수 있어요.</li>
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
              일반 사용자: <strong>월 500회</strong> 검색 (매월 1일 0시 UTC 리셋)
            </li>
            <li>관리자가 사용자별로 한도를 조정할 수 있어요</li>
            <li>한도 초과 시 다음 달까지 검색이 일시 제한돼요</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">4. 사용자 의무</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>본인 계정과 API 키를 안전하게 관리해 주세요</li>
            <li>API 키는 계정당 1개만 발급돼요. 노출됐다면 즉시 삭제 후 재발급해 주세요</li>
            <li>
              자동화된 무차별 호출, 우리말샘 API의 부정한 우회 사용 등은 금지돼요
            </li>
            <li>
              위반 사항 발견 시 사전 통지 없이 계정·키가 정지될 수 있어요
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">5. 책임의 한계</h2>
          <p>
            서비스는 "있는 그대로(as-is)" 제공돼요. 베타 단계의 특성상 데이터
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
          <h2 className="font-display text-xl mb-3">6. 약관 변경</h2>
          <p>
            본 약관은 서비스 정책 변화에 따라 변경될 수 있어요. 중요한 변경은
            이메일·웹사이트로 사전 안내해 드려요.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">7. 문의</h2>
          <p>
            문의는{" "}
            <a
              href="mailto:phk901031@gmail.com"
              className="underline text-accent"
            >
              phk901031@gmail.com
            </a>
            로 보내주세요.
          </p>
        </section>
      </div>
    </main>
  );
}
