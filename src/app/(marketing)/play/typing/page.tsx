// src/app/(marketing)/play/typing/page.tsx
// Play Steno · 속기 타자 게임. 서버 컴포넌트는 초기 데이터(SSR)만 조회하고
// 실제 플레이 상태는 <TypingPlayClient> 클라이언트 경계 하나에서 관리한다.
//
// PLAY_STENO_MAINTENANCE 가 true인 동안은 DB/Redis를 전혀 건드리지 않고 점검 안내만
// 보여준다 — Neon 컴퓨트 비용 문제로 임시 차단.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { PLAY_STENO_MAINTENANCE } from "@/config/maintenance";
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

      {PLAY_STENO_MAINTENANCE ? <MaintenanceNotice /> : <PlayTypingContent />}
    </main>
  );
}

function MaintenanceNotice() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-panel px-6 py-10 text-center">
      <p className="font-display text-xl">잠시 점검 중이에요</p>
      <p className="ko-copy mt-2 text-sm leading-6 text-muted">
        서버 점검으로 타자 게임을 잠시 이용할 수 없어요. 곧 다시 열게요.
      </p>
    </div>
  );
}

async function PlayTypingContent() {
  const user = await getOrCreateCurrentUser();
  const [profile, leaderboard] = await Promise.all([
    user ? getGameProfile(user.clerkId) : Promise.resolve(null),
    fetchLeaderboard({ mode: "short", period: "daily" }),
  ]);

  return (
    <TypingPlayClient
      signedIn={Boolean(user)}
      initialProfile={profile}
      initialLeaderboard={leaderboard}
    />
  );
}
