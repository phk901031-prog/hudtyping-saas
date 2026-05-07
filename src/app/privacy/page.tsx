// src/app/privacy/page.tsx
// 개인정보 처리방침. 베타 단계의 최소 구성.
// 1년 후 유료화·결제 도입 시 보강 예정.

import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 처리방침 — hudtyping",
};

export default function PrivacyPage() {
  return (
    <main className="flex-1 px-6 sm:px-10 py-12 max-w-3xl w-full mx-auto bg-background text-foreground">
      <Link
        href="/"
        className="text-sm text-muted hover:text-foreground transition"
      >
        ← 홈으로
      </Link>

      <h1 className="font-display text-3xl sm:text-4xl mt-6 mb-2">
        개인정보 처리방침
      </h1>
      <p className="text-sm text-muted mb-8">최종 업데이트: 2026-05-07</p>

      <div className="flex flex-col gap-8 leading-relaxed">
        <section>
          <h2 className="font-display text-xl mb-3">1. 수집하는 정보</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5 text-foreground">
            <li>
              <strong>계정 정보</strong>: 이메일 주소(가입 시), 인증 식별자
              (Clerk이 발급한 사용자 ID)
            </li>
            <li>
              <strong>승인 상태</strong>: 가입 승인/거절 여부, 권한(일반/관리자)
            </li>
            <li>
              <strong>검색 기록</strong>: 검색어, 검색 시각, 캐시 적중 여부, 사용자
              식별자 — 사용 패턴 분석 및 한도 산정 용도
            </li>
            <li>
              <strong>API 키 메타</strong>: 키 이름, 마지막 사용 시각, 발급 시각
              (실제 토큰은 SHA256 해시만 저장)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">2. 정보 사용 목적</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>서비스 이용 인증·승인</li>
            <li>월 검색 한도 계산 (사용자별 누적 사용량 추적)</li>
            <li>전체 사용 패턴 분석 (인기 검색어, 캐시 적중률 등)</li>
            <li>
              유료화 전환 시점 결정 자료 (1년 무료 운영 후 — 자세한 내용은 변경 시
              별도 안내)
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">3. 정보 보관·제3자 제공</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>
              데이터는 Neon (PostgreSQL, 도쿄 리전) 및 Upstash Redis (도쿄
              리전)에 저장돼요
            </li>
            <li>인증은 Clerk을 통해 처리돼요 (이메일·OAuth)</li>
            <li>제3자에게 광고·마케팅 목적으로 정보를 제공하지 않아요</li>
            <li>법령에 의한 요청이 있는 경우에 한해 제공할 수 있어요</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">4. 사용자 권리</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>본인 정보 열람·수정·삭제를 요청할 수 있어요</li>
            <li>
              계정 삭제 시 관련된 검색 기록·API 키도 함께 자동 삭제돼요 (DB
              cascade)
            </li>
            <li>API 키는 본인이 직접 언제든 삭제할 수 있어요 (`/api-keys`)</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">5. 문의</h2>
          <p>
            개인정보 관련 문의는{" "}
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
