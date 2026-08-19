import "server-only";

import { eq } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  gameProfiles,
  type GameProfile,
} from "@/infrastructure/db/schema";
import type { TypingBorderStyle, TypingNameColor } from "@/features/typing-game/types";

export function normalizeTypingNickname(value: string) {
  return value.normalize("NFC").trim().replace(/\s+/g, " ");
}

export function isValidTypingNickname(value: string) {
  const normalized = normalizeTypingNickname(value);
  return (
    normalized.length >= 2 &&
    normalized.length <= 10 &&
    /^[가-힣A-Za-z0-9]+$/.test(normalized) &&
    !/^(관리자|운영자|playsteno|플레이스테노)$/i.test(normalized)
  );
}

export async function getGameProfile(clerkId: string): Promise<GameProfile | null> {
  const [row] = await db
    .select()
    .from(gameProfiles)
    .where(eq(gameProfiles.clerkId, clerkId))
    .limit(1);
  return row ?? null;
}

// 프로필이 없으면 새로 만들고, 있으면 닉네임은 그대로 둔 채 꾸미기만 갱신한다.
// 닉네임은 최초 설정 후 불변 — 이미 있는 닉네임과 다른 값이 들어오면 거부.
export async function createOrGetGameProfile(input: {
  clerkId: string;
  nickname: string;
  nameColor: TypingNameColor;
  borderStyle: TypingBorderStyle;
}): Promise<GameProfile> {
  const nickname = normalizeTypingNickname(input.nickname);
  if (!isValidTypingNickname(nickname)) {
    throw new Error("닉네임은 한글, 영문, 숫자 2~10자로 입력해주세요.");
  }

  const existing = await getGameProfile(input.clerkId);
  if (existing) {
    if (existing.nickname !== nickname) {
      throw new Error("닉네임은 최초 설정 후 변경할 수 없습니다.");
    }
    const [updated] = await db
      .update(gameProfiles)
      .set({
        nameColor: input.nameColor,
        borderStyle: input.borderStyle,
        updatedAt: new Date(),
      })
      .where(eq(gameProfiles.clerkId, input.clerkId))
      .returning();
    return updated;
  }

  try {
    const [created] = await db
      .insert(gameProfiles)
      .values({
        clerkId: input.clerkId,
        nickname,
        nameColor: input.nameColor,
        borderStyle: input.borderStyle,
      })
      .returning();
    return created;
  } catch (error) {
    if (isUniqueViolation(error)) throw new Error("이미 사용 중인 닉네임입니다.");
    throw error;
  }
}

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "23505"
  );
}
