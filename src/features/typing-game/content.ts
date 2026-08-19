import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  typingContents,
  typingModeEnum,
  type TypingContent,
} from "@/infrastructure/db/schema";

export type TypingMode = (typeof typingModeEnum.enumValues)[number];

export function isTypingMode(value: unknown): value is TypingMode {
  return value === "short" || value === "long";
}

// 단문 풀은 원본(kingoftyping) 밈 데이터가 20~40자짜리와 최대 200자대가 섞여 있어
// 편차가 컸다. 너무 짧아 순식간에 끝나버리는 것들을 걸러내 "짧지만 칠 맛은 나는"
// 길이(대략 45자 이상)만 남긴다. 장문은 원래도 100자 이상이라 필터 불필요.
const MIN_SHORT_LENGTH = 45;

// 314행 규모라 캐싱 없이 매번 무작위 1건 조회.
export async function getRandomTypingContent(
  mode: TypingMode
): Promise<TypingContent | null> {
  const conditions = [eq(typingContents.mode, mode), eq(typingContents.isActive, true)];
  if (mode === "short") {
    conditions.push(sql`length(${typingContents.body}) >= ${MIN_SHORT_LENGTH}`);
  }

  const [row] = await db
    .select()
    .from(typingContents)
    .where(and(...conditions))
    .orderBy(sql`random()`)
    .limit(1);
  return row ?? null;
}
