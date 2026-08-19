import "server-only";

import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  gameProfiles,
  typingContents,
  typingResults,
} from "@/infrastructure/db/schema";
import type { TypingMode } from "@/features/typing-game/content";
import { getFallbackAlias } from "@/features/typing-game/profile";
import {
  isTypingBorderStyle,
  isTypingNameColor,
  type TypingBorderStyle,
  type TypingNameColor,
} from "@/features/typing-game/types";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly" | "all";

export interface LeaderboardRow {
  rank: number;
  nickname: string;
  nameColor: TypingNameColor;
  borderStyle: TypingBorderStyle;
  netSpeed: number;
  accuracyBasisPoints: number;
  createdAt: string;
}

const MAX_RECORDS_PER_USER = 5;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getPeriodSince(period: LeaderboardPeriod): Date | null {
  if (period === "all") return null;
  const now = new Date();
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth();
  const date = kst.getUTCDate();

  if (period === "daily") {
    return new Date(Date.UTC(year, month, date) - KST_OFFSET_MS);
  }
  if (period === "monthly") {
    return new Date(Date.UTC(year, month, 1) - KST_OFFSET_MS);
  }
  // weekly — 월요일 시작
  const daysSinceMonday = (kst.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(year, month, date - daysSinceMonday) - KST_OFFSET_MS);
}

export async function fetchLeaderboard(input: {
  mode: TypingMode;
  period: LeaderboardPeriod;
  limit?: number;
}): Promise<LeaderboardRow[]> {
  const limit = Math.min(Math.max(input.limit ?? 50, 1), 100);
  const since = getPeriodSince(input.period);

  // 사용자당 최대 5개 기록만 리더보드에 노출 — ROW_NUMBER 윈도우 함수로 자름.
  const ranked = db.$with("ranked").as(
    db
      .select({
        clerkId: typingResults.clerkId,
        netSpeed: typingResults.netSpeed,
        accuracyBasisPoints: typingResults.accuracyBasisPoints,
        createdAt: typingResults.createdAt,
        rn: sql<number>`ROW_NUMBER() OVER (PARTITION BY ${typingResults.clerkId} ORDER BY ${typingResults.netSpeed} DESC)`.as(
          "rn"
        ),
      })
      .from(typingResults)
      .innerJoin(typingContents, eq(typingContents.id, typingResults.contentId))
      .where(
        and(
          eq(typingContents.mode, input.mode),
          eq(typingResults.suspicious, false),
          since ? gte(typingResults.createdAt, since) : undefined
        )
      )
  );

  const rows = await db
    .with(ranked)
    .select({
      clerkId: ranked.clerkId,
      netSpeed: ranked.netSpeed,
      accuracyBasisPoints: ranked.accuracyBasisPoints,
      createdAt: ranked.createdAt,
      nickname: gameProfiles.nickname,
      nameColor: gameProfiles.nameColor,
      borderStyle: gameProfiles.borderStyle,
    })
    .from(ranked)
    .leftJoin(gameProfiles, eq(gameProfiles.clerkId, ranked.clerkId))
    .where(sql`${ranked.rn} <= ${MAX_RECORDS_PER_USER}`)
    .orderBy(desc(ranked.netSpeed))
    .limit(limit);

  return rows.map((row, index) => ({
    rank: index + 1,
    nickname: row.nickname ?? getFallbackAlias(row.clerkId),
    nameColor: isTypingNameColor(row.nameColor) ? row.nameColor : "mint",
    borderStyle: isTypingBorderStyle(row.borderStyle) ? row.borderStyle : "soft",
    netSpeed: row.netSpeed,
    accuracyBasisPoints: row.accuracyBasisPoints,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function getPersonalBest(
  clerkId: string,
  mode: TypingMode
): Promise<number | null> {
  const [row] = await db
    .select({ netSpeed: typingResults.netSpeed })
    .from(typingResults)
    .innerJoin(typingContents, eq(typingContents.id, typingResults.contentId))
    .where(
      and(
        eq(typingResults.clerkId, clerkId),
        eq(typingContents.mode, mode),
        eq(typingResults.suspicious, false)
      )
    )
    .orderBy(desc(typingResults.netSpeed))
    .limit(1);
  return row?.netSpeed ?? null;
}
