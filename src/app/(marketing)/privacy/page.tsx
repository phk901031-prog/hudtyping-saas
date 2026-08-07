// src/app/privacy/page.tsx
// 개인정보 처리방침. 베타 단계의 최소 구성.
// 결제나 새로운 회원 기능 도입 시 처리 항목을 함께 갱신한다.

import Link from "next/link";
import type { Metadata } from "next";
import { OPENCHAT } from "@/config/community";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
  alternates: { canonical: "/privacy" },
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
      <p className="text-sm text-muted mb-8">최종 업데이트: 2026-08-07</p>

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
              <strong>프로그램 연결 정보</strong>: 연결 이름, 마지막 사용 시각, 발급 시각
              (실제 토큰은 SHA256 해시만 저장)
            </li>
            <li>
              <strong>타자 게임 기록</strong>: 종합점수, 타수, 정확도,
              오타 수, 완료 문장 수, 게임 시각 — 입력한 키의 원문과 개별 입력 시각은
              저장하지 않아요
            </li>
            <li>
              <strong>타자 게임 공개 프로필</strong>: 사용자가 정한 닉네임, 이름 색상,
              테두리 효과 — 닉네임과 꾸미기는 주간·월간 순위표에 공개돼요
            </li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">2. 정보 사용 목적</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            <li>서비스 이용 인증·승인</li>
            <li>월 검색 한도 계산 (사용자별 누적 사용량 추적)</li>
            <li>전체 사용 패턴 분석 (인기 검색어, 캐시 적중률 등)</li>
            <li>오류 분석과 기능·성능 개선을 위한 이용 통계 확인</li>
            <li>타자 게임의 주간·월간 순위 제공 및 비정상 기록 확인</li>
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
              계정 삭제 시 관련된 검색 기록·프로그램 연결 정보도 함께 자동 삭제돼요 (DB
              cascade)
            </li>
            <li>타자 게임 기록과 공개 프로필도 계정 삭제 시 함께 삭제돼요</li>
            <li>프로그램 연결 정보는 대시보드의 프로그램 연결 화면에서 다시 발급하거나 해제할 수 있어요</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl mb-3">5. 문의</h2>
          <p>
            개인정보 관련 문의는 카카오톡{" "}
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
