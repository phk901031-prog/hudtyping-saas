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

// 314행 규모라 캐싱 없이 매번 무작위 1건 조회.
export async function getRandomTypingContent(
  mode: TypingMode
): Promise<TypingContent | null> {
  const [row] = await db
    .select()
    .from(typingContents)
    .where(and(eq(typingContents.mode, mode), eq(typingContents.isActive, true)))
    .orderBy(sql`random()`)
    .limit(1);
  return row ?? null;
}
