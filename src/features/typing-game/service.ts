import "server-only";

import { createHash, randomInt, randomUUID } from "node:crypto";
import { and, asc, desc, eq, gte, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  typingGameResults,
  users,
  type User,
} from "@/infrastructure/db/schema";
import { redis } from "@/infrastructure/redis";
import {
  TYPING_PROMPT_BY_ID,
  TYPING_PROMPTS,
  type TypingPrompt,
} from "@/features/typing-game/prompts";
import {
  isTypingBorderStyle,
  isTypingNameColor,
  isValidTypingNickname,
  normalizeTypingNickname,
  type TypingBorderStyle,
  type TypingGameProfile,
  type TypingNameColor,
} from "@/features/typing-game/customization";

export const TYPING_GAME_DURATION_MS = 30_000;
export const TYPING_GAME_COUNTDOWN_MS = 3_000;

const SESSION_TTL_SECONDS = 120;
const PROMPTS_PER_SESSION = 28;
const MIN_FINISH_EARLY_TOLERANCE_MS = 2_500;
const MAX_FINISH_DELAY_MS = 30_000;
const MAX_RANKED_CPM = 1_800;

interface TypingSessionState {
  promptIds: string[];
  clerkId: string | null;
  rankingEligible: boolean;
  startsAt: number;
}

export interface TypingGameEntryInput {
  promptId: string;
  typed: string;
}

export interface TypingGameResultSummary {
  score: number;
  cpm: number;
  accuracy: number;
  correctChars: number;
  errorCount: number;
  completedPrompts: number;
  ranked: boolean;
  suspicious: boolean;
}

export interface TypingLeaderboardRow {
  rank: number;
  player: string;
  score: number;
  cpm: number;
  accuracy: number;
  playedAt: string;
  nameColor: TypingNameColor;
  borderStyle: TypingBorderStyle;
}

export interface TypingLeaderboard {
  period: "weekly" | "monthly";
  label: string;
  rows: TypingLeaderboardRow[];
}

export class TypingGameError extends Error {
  constructor(
    public readonly code:
      | "SESSION_NOT_FOUND"
      | "SESSION_TOO_EARLY"
      | "SESSION_EXPIRED"
      | "INVALID_RESULT"
      | "PROFILE_REQUIRED",
    message: string
  ) {
    super(message);
    this.name = "TypingGameError";
  }
}

export async function createTypingSession(user: User | null) {
  if (!user?.gameNickname) {
    throw new TypingGameError(
      "PROFILE_REQUIRED",
      "게임을 시작하려면 로그인 후 닉네임을 먼저 확정해주세요."
    );
  }
  const sessionId = randomUUID();
  const prompts = pickRandomPrompts(PROMPTS_PER_SESSION);
  const startsAt = Date.now() + TYPING_GAME_COUNTDOWN_MS;
  const state: TypingSessionState = {
    promptIds: prompts.map((prompt) => prompt.id),
    clerkId: user?.clerkId ?? null,
    rankingEligible: user?.status === "approved",
    startsAt,
  };

  await redis.set(sessionKey(sessionId), state, { ex: SESSION_TTL_SECONDS });

  return {
    sessionId,
    prompts,
    countdownMs: TYPING_GAME_COUNTDOWN_MS,
    durationMs: TYPING_GAME_DURATION_MS,
    rankingEligible: state.rankingEligible,
  };
}

export async function finishTypingSession(input: {
  sessionId: string;
  entries: TypingGameEntryInput[];
  currentUser: User | null;
}): Promise<TypingGameResultSummary> {
  const state = await redis.getdel<TypingSessionState>(
    sessionKey(input.sessionId)
  );
  if (!state) {
    throw new TypingGameError(
      "SESSION_NOT_FOUND",
      "게임 세션이 만료됐거나 이미 제출되었습니다."
    );
  }

  const elapsedMs = Date.now() - state.startsAt;
  if (elapsedMs < TYPING_GAME_DURATION_MS - MIN_FINISH_EARLY_TOLERANCE_MS) {
    throw new TypingGameError(
      "SESSION_TOO_EARLY",
      "게임 시간이 끝나기 전에 결과가 제출되었습니다."
    );
  }
  if (elapsedMs > TYPING_GAME_DURATION_MS + MAX_FINISH_DELAY_MS) {
    throw new TypingGameError(
      "SESSION_EXPIRED",
      "결과 제출 시간이 지나 다시 시작해야 합니다."
    );
  }

  const metrics = calculateResult({
    promptIds: state.promptIds,
    entries: input.entries,
  });

  const sameUser = Boolean(
    state.clerkId && input.currentUser?.clerkId === state.clerkId
  );
  const ranked = Boolean(
    state.rankingEligible &&
      sameUser &&
      input.currentUser?.status === "approved" &&
      !metrics.suspicious
  );

  if (ranked && input.currentUser) {
    await db.insert(typingGameResults).values({
      sessionId: input.sessionId,
      clerkId: input.currentUser.clerkId,
      score: metrics.score,
      cpm: metrics.cpm,
      accuracyBasisPoints: metrics.accuracyBasisPoints,
      correctChars: metrics.correctChars,
      errorCount: metrics.errorCount,
      completedPrompts: metrics.completedPrompts,
      durationMs: TYPING_GAME_DURATION_MS,
    });
  }

  return {
    score: metrics.score,
    cpm: metrics.cpm,
    accuracy: metrics.accuracyBasisPoints / 100,
    correctChars: metrics.correctChars,
    errorCount: metrics.errorCount,
    completedPrompts: metrics.completedPrompts,
    ranked,
    suspicious: metrics.suspicious,
  };
}

export async function fetchTypingLeaderboard(
  period: "weekly" | "monthly",
  limit = 20
): Promise<TypingLeaderboard> {
  const window = getKoreanRankingWindow(period);

  // 사용자마다 기간 내 최고 기록 하나만 남긴 뒤 전체 순위를 정한다.
  const bestByUser = await db
    .selectDistinctOn([typingGameResults.clerkId], {
      clerkId: typingGameResults.clerkId,
      nickname: users.gameNickname,
      nameColor: users.gameNameColor,
      borderStyle: users.gameBorderStyle,
      score: typingGameResults.score,
      cpm: typingGameResults.cpm,
      accuracyBasisPoints: typingGameResults.accuracyBasisPoints,
      createdAt: typingGameResults.createdAt,
    })
    .from(typingGameResults)
    .innerJoin(users, eq(users.clerkId, typingGameResults.clerkId))
    .where(gte(typingGameResults.createdAt, window.since))
    .orderBy(
      typingGameResults.clerkId,
      desc(typingGameResults.score),
      desc(typingGameResults.accuracyBasisPoints),
      desc(typingGameResults.cpm),
      asc(typingGameResults.createdAt)
    );

  const rows = bestByUser
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.accuracyBasisPoints - a.accuracyBasisPoints ||
        b.cpm - a.cpm ||
        a.createdAt.getTime() - b.createdAt.getTime()
    )
    .slice(0, Math.min(Math.max(limit, 1), 50))
    .map((row, index) => ({
      rank: index + 1,
      player: row.nickname ?? playerAlias(row.clerkId),
      score: row.score,
      cpm: row.cpm,
      accuracy: row.accuracyBasisPoints / 100,
      playedAt: row.createdAt.toISOString(),
      nameColor: isTypingNameColor(row.nameColor) ? row.nameColor : "mint",
      borderStyle: isTypingBorderStyle(row.borderStyle) ? row.borderStyle : "soft",
    }));

  return {
    period,
    label: window.label,
    rows,
  };
}

function calculateResult(input: {
  promptIds: string[];
  entries: TypingGameEntryInput[];
}) {
  if (
    !Array.isArray(input.entries) ||
    input.entries.length > input.promptIds.length
  ) {
    throw new TypingGameError("INVALID_RESULT", "결과 형식이 올바르지 않습니다.");
  }

  let correctChars = 0;
  let errorCount = 0;
  let completedPrompts = 0;

  input.entries.forEach((entry, index) => {
    if (
      !entry ||
      entry.promptId !== input.promptIds[index] ||
      typeof entry.typed !== "string" ||
      entry.typed.length > 250
    ) {
      throw new TypingGameError("INVALID_RESULT", "문장 결과가 올바르지 않습니다.");
    }

    const prompt = TYPING_PROMPT_BY_ID.get(entry.promptId);
    if (!prompt) {
      throw new TypingGameError("INVALID_RESULT", "등록되지 않은 문장입니다.");
    }

    const typed = entry.typed.normalize("NFC");
    const target = prompt.text.normalize("NFC");
    const typedChars = Array.from(typed);
    const targetChars = Array.from(target);
    if (typedChars.length > targetChars.length) {
      throw new TypingGameError("INVALID_RESULT", "문장 결과가 올바르지 않습니다.");
    }
    for (let position = 0; position < typedChars.length; position++) {
      if (typedChars[position] === targetChars[position]) correctChars += 1;
      else errorCount += 1;
    }
    if (typedChars.length === targetChars.length) completedPrompts += 1;
  });

  const attempts = correctChars + errorCount;
  const accuracyBasisPoints =
    attempts > 0 ? Math.round((correctChars / attempts) * 10_000) : 0;
  const cpm = Math.round(
    (correctChars * 60_000) / TYPING_GAME_DURATION_MS
  );
  const accuracyRatio = accuracyBasisPoints / 10_000;
  const score = Math.round(cpm * accuracyRatio * accuracyRatio);
  const suspicious = cpm > MAX_RANKED_CPM;

  return {
    score,
    cpm,
    accuracyBasisPoints,
    correctChars,
    errorCount,
    completedPrompts,
    suspicious,
  };
}

export function typingProfileForUser(user: User): TypingGameProfile {
  return {
    nickname: user.gameNickname ?? playerAlias(user.clerkId),
    nameColor: isTypingNameColor(user.gameNameColor) ? user.gameNameColor : "mint",
    borderStyle: isTypingBorderStyle(user.gameBorderStyle) ? user.gameBorderStyle : "soft",
    customized: Boolean(user.gameNickname),
  };
}

export async function updateTypingProfile(input: {
  user: User;
  nickname: string;
  nameColor: TypingNameColor;
  borderStyle: TypingBorderStyle;
}): Promise<TypingGameProfile> {
  const nickname = normalizeTypingNickname(input.nickname);
  if (!isValidTypingNickname(nickname)) {
    throw new Error("닉네임은 한글, 영문, 숫자 2~10자로 입력해주세요.");
  }
  if (input.user.gameNickname && input.user.gameNickname !== nickname) {
    throw new Error("닉네임은 최초 설정 후 변경할 수 없습니다.");
  }

  const duplicate = await db
    .select({ clerkId: users.clerkId })
    .from(users)
    .where(eq(users.gameNickname, nickname))
    .limit(1);
  if (duplicate[0] && duplicate[0].clerkId !== input.user.clerkId) {
    throw new Error("이미 사용 중인 닉네임입니다.");
  }

  try {
    const profileCondition = input.user.gameNickname
      ? and(eq(users.clerkId, input.user.clerkId), eq(users.gameNickname, nickname))
      : and(eq(users.clerkId, input.user.clerkId), isNull(users.gameNickname));
    const [updated] = await db
      .update(users)
      .set({
        gameNickname: nickname,
        gameNameColor: input.nameColor,
        gameBorderStyle: input.borderStyle,
        updatedAt: new Date(),
      })
      .where(profileCondition)
      .returning();
    if (!updated) {
      const [current] = await db.select().from(users).where(eq(users.clerkId, input.user.clerkId)).limit(1);
      if (current?.gameNickname && current.gameNickname !== nickname) {
        throw new Error("닉네임은 최초 설정 후 변경할 수 없습니다.");
      }
      if (current) return typingProfileForUser(current);
      throw new Error("닉네임을 저장하지 못했습니다.");
    }
    return typingProfileForUser(updated);
  } catch (error) {
    if (isUniqueViolation(error)) throw new Error("이미 사용 중인 닉네임입니다.");
    throw error;
  }
}

function isUniqueViolation(error: unknown) {
  return typeof error === "object" && error !== null && "code" in error && error.code === "23505";
}

function pickRandomPrompts(count: number): TypingPrompt[] {
  const pool = [...TYPING_PROMPTS];
  for (let index = pool.length - 1; index > 0; index--) {
    const random = randomInt(index + 1);
    [pool[index], pool[random]] = [pool[random], pool[index]];
  }
  return pool.slice(0, count);
}

function sessionKey(sessionId: string) {
  return `typing-game:session:${sessionId}`;
}

function playerAlias(clerkId: string) {
  const suffix = createHash("sha256")
    .update(`playsteno-game:${clerkId}`)
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
  return `플레이어 ${suffix}`;
}

function getKoreanRankingWindow(period: "weekly" | "monthly") {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const now = new Date();
  const kst = new Date(now.getTime() + KST_OFFSET_MS);
  const year = kst.getUTCFullYear();
  const month = kst.getUTCMonth();
  const date = kst.getUTCDate();

  if (period === "monthly") {
    const since = new Date(Date.UTC(year, month, 1) - KST_OFFSET_MS);
    return {
      since,
      label: `${year}년 ${month + 1}월`,
    };
  }

  const daysSinceMonday = (kst.getUTCDay() + 6) % 7;
  const mondayDate = date - daysSinceMonday;
  const since = new Date(
    Date.UTC(year, month, mondayDate) - KST_OFFSET_MS
  );
  const end = new Date(since.getTime() + 6 * 24 * 60 * 60 * 1000);
  const startKst = new Date(since.getTime() + KST_OFFSET_MS);
  const endKst = new Date(end.getTime() + KST_OFFSET_MS);
  return {
    since,
    label: `${startKst.getUTCMonth() + 1}월 ${startKst.getUTCDate()}일에서 ${endKst.getUTCMonth() + 1}월 ${endKst.getUTCDate()}일`,
  };
}
