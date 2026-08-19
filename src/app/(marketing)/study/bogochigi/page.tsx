// src/app/(marketing)/study/bogochigi/page.tsx
// Study Steno · 보고치기 - 내 텍스트 연습. 사용자가 붙여넣은 글을 정해진 속도로
// 어절 단위로 노출하고, 대한상공회의소 한글속기 채점기준(오자·탈자·첨자)으로 채점한다.
// 서버에 아무것도 저장하지 않는 순수 클라이언트 기능 — DB·인증·기존 라우트 어디에도
// 손대지 않는다.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { BogochigiClient } from "@/components/study-steno/bogochigi-client";

export const metadata: Metadata = {
  title: "보고치기 연습 | Study Steno",
  description:
    "원하는 글을 붙여넣고 원하는 속도로 보고치기 연습을 해보세요. 대한상공회의소 한글속기 채점기준으로 채점됩니다.",
  alternates: { canonical: "/study/bogochigi" },
};

export default function BogochigiPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={16} /> PlaySteno 홈
      </Link>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Study Steno</p>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">보고치기 연습</h1>
        <p className="ko-copy text-sm leading-7 text-muted">
          뉴스 기사나 사설 등 원하는 글을 붙여넣고, 원하는 속도로 낭독하듯 노출시켜서
          보고치기 연습을 해보세요. 대한상공회의소 한글속기 채점기준(오자·탈자·첨자)으로
          채점됩니다. 붙여넣은 글은 저장되지 않아요.
        </p>
      </div>

      <BogochigiClient />
    </main>
  );
}
