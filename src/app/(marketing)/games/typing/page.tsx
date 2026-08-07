import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Keyboard, Sparkles, Trophy } from "lucide-react";
import { TypingGame } from "@/components/games/typing-game";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { fetchTypingLeaderboard, typingProfileForUser } from "@/features/typing-game/service";

export const metadata: Metadata = {
  title: "30초 타자 게임",
  description:
    "30초 동안 문장을 연속으로 입력하고 정확도와 타수를 확인하는 PlaySteno 타자 게임.",
  alternates: { canonical: "/games/typing" },
};

export default async function TypingGamePage() {
  const [user, weekly, monthly] = await Promise.all([
    getOrCreateCurrentUser(),
    fetchTypingLeaderboard("weekly"),
    fetchTypingLeaderboard("monthly"),
  ]);

  return (
    <main className="flex-1 bg-background text-foreground">
      <section className="border-b border-border bg-ink text-white">
        <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white/65 transition hover:text-white"
          >
            <ArrowLeft size={14} /> 메인으로
          </Link>
          <div className="mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#a8fff4]">
                <Keyboard size={14} /> PlaySteno typing
              </p>
              <h1 className="ko-heading mt-3 font-display text-4xl leading-tight sm:text-5xl">
                30초 동안 정확하고 빠르게.
              </h1>
              <p className="ko-copy mt-4 max-w-2xl text-base leading-7 text-white/72">
                화면의 문장을 끝까지 입력하면 다음 문장이 바로 이어집니다. 타수와 정확도를 함께 측정하고 주간 및 월간 최고 기록을 비교합니다.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoCard icon={Sparkles} title="직접 쓴 문장" body="외부 저작물 인용 없음" />
              <InfoCard icon={Trophy} title="종합 순위" body="속도와 정확도 반영" />
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <TypingGame
          signedIn={Boolean(user)}
          approved={user?.status === "approved"}
          initialWeekly={weekly}
          initialMonthly={monthly}
          initialProfile={user ? typingProfileForUser(user) : null}
        />

        <section className="mt-10 grid gap-5 md:grid-cols-3">
          <RuleCard number="01" title="닉네임 최초 1회">
            로그인 후 닉네임을 한 번 확정하면 이후 모든 게임과 순위에 같은 이름이 사용됩니다.
          </RuleCard>
          <RuleCard number="02" title="30초 연속 입력">
            오타가 있어도 다음 문장으로 이어지며 한글 자소 수를 1분 기준으로 환산해 실제 타수를 계산합니다.
          </RuleCard>
          <RuleCard number="03" title="주간·월간 순위">
            사용자별 최고 점수를 크게 비교합니다. 종합점수에는 타수와 정확도가 함께 반영됩니다.
          </RuleCard>
        </section>
      </div>
    </main>
  );
}

function InfoCard({
  icon: Icon,
  title,
  body,
}: {
  icon: typeof Sparkles;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.06] p-4">
      <Icon size={18} className="text-[#a8fff4]" />
      <p className="mt-3 text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-white/58">{body}</p>
    </div>
  );
}

function RuleCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-6">
      <span className="font-mono text-xs font-bold text-accent">{number}</span>
      <h2 className="mt-2 font-display text-lg">{title}</h2>
      <p className="ko-copy mt-2 text-sm leading-6 text-muted">{children}</p>
    </article>
  );
}
