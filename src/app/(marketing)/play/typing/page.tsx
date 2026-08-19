// src/app/(marketing)/play/typing/page.tsx
// Play Steno · 속기 타자 게임. 서버 컴포넌트는 초기 데이터(SSR)만 조회하고
// 실제 플레이 상태는 <TypingPlayClient> 클라이언트 경계 하나에서 관리한다.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { getGameProfile } from "@/features/typing-game/profile";
import { fetchLeaderboard } from "@/features/typing-game/leaderboard";
import { TypingPlayClient } from "@/components/games/typing-play-client";

export const metadata: Metadata = {
  title: "속기 타자 게임 | Play Steno",
  description:
    "속기 문장으로 타자 속도와 정확도를 겨루는 게임. 가입 없이 바로 플레이할 수 있어요.",
  alternates: { canonical: "/play/typing" },
};

export default async function PlayTypingPage() {
  const user = await getOrCreateCurrentUser();
  const [profile, leaderboard] = await Promise.all([
    user ? getGameProfile(user.clerkId) : Promise.resolve(null),
    fetchLeaderboard({ mode: "short", period: "daily" }),
  ]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-16 sm:px-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
      >
        <ArrowLeft size={16} /> PlaySteno 홈
      </Link>

      <div className="flex flex-col gap-3">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Play Steno</p>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">속기 타자 게임</h1>
        <p className="ko-copy text-sm leading-7 text-muted">
          속기 실무에 가까운 문장으로 타자 속도와 정확도를 겨뤄보세요. 가입 없이 바로
          플레이할 수 있고, 로그인하면 기록이 리더보드에 남아요.
        </p>
      </div>

      <TypingPlayClient
        signedIn={Boolean(user)}
        initialProfile={profile}
        initialLeaderboard={leaderboard}
      />
    </main>
  );
}
