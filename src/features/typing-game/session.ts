import "server-only";

import { randomUUID } from "node:crypto";
import { redis } from "@/infrastructure/redis";
import { getRandomTypingContent, type TypingMode } from "@/features/typing-game/content";
import type { TypingContent } from "@/infrastructure/db/schema";

// 지문 하나를 다 치는 데 넉넉한 시간(장문 기준) + 방치된 세션 자동 정리.
const SESSION_TTL_SECONDS = 1200;

export interface TypingSessionPayload {
  contentId: number;
  mode: TypingMode;
  body: string;
  startedAt: number;
}

function sessionKey(sessionId: string) {
  return `typing-session:${sessionId}`;
}

export async function createTypingSession(
  mode: TypingMode
): Promise<{ sessionId: string; content: TypingContent } | null> {
  const content = await getRandomTypingContent(mode);
  if (!content) return null;

  const sessionId = randomUUID();
  const payload: TypingSessionPayload = {
    contentId: content.id,
    mode,
    body: content.body,
    startedAt: Date.now(),
  };
  await redis.set(sessionKey(sessionId), payload, { ex: SESSION_TTL_SECONDS });
  return { sessionId, content };
}

// 원자적 pop — 같은 세션으로 두 번 제출해도 두 번째는 항상 null.
export async function popTypingSession(
  sessionId: string
): Promise<TypingSessionPayload | null> {
  return redis.getdel<TypingSessionPayload>(sessionKey(sessionId));
}
