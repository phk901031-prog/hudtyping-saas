import "server-only";

import { db } from "@/infrastructure/db";
import { typingResults } from "@/infrastructure/db/schema";
import { popTypingSession } from "@/features/typing-game/session";
import { computeTypingScore } from "@/features/typing-game/scoring";
import { countTypingStrokes } from "@/features/typing-game/typing-strokes";
import { getPersonalBest } from "@/features/typing-game/leaderboard";

// 지문 길이 기준 "물리적으로 불가능한 속도" 하한선 — 분당 1500타(전국 최상위 속기사도
// 도달 못 하는 수준)를 넘는 시간에 완주했다고 하면 매크로/붙여넣기로 간주해 거부한다.
const IMPLAUSIBLE_STROKES_PER_MINUTE = 1500;
const MIN_ELAPSED_MS_FLOOR = 1000;
const MAX_REASONABLE_NET_SPEED = 3000;
// suspicious 플래그는 위 TOO_FAST 하한선(1500타/분)에 근접한, 진짜 이례적인 경우만
// 표시한다. PlaySteno 타겟이 속기사라 600~800타대에 정확도 100%가 오히려 흔한
// 정상 범위라, 예전엔 "700타 초과 + 정확도 100%"를 잡던 규칙이 실사용자의 정상
// 기록을 대량으로 걸러버리는 오탐이었다 — 그 조합 규칙은 폐기.
const SUSPICIOUS_NET_SPEED = 1400;

export type SubmitOutcome =
  | {
      ok: true;
      netSpeed: number;
      rawSpeed: number;
      accuracyBasisPoints: number;
      errorCount: number;
      durationMs: number;
      suspicious: boolean;
      saved: boolean;
      prevBest: number | null;
    }
  | {
      ok: false;
      code: "SESSION_EXPIRED" | "INVALID_SUBMISSION" | "INVALID_SPEED" | "TOO_FAST";
    };

export async function submitTypingResult(input: {
  sessionId: string;
  typedText: string;
  clerkId: string | null;
}): Promise<SubmitOutcome> {
  const payload = await popTypingSession(input.sessionId);
  if (!payload) {
    return { ok: false, code: "SESSION_EXPIRED" };
  }

  const typed = input.typedText.normalize("NFC");
  const target = payload.body.normalize("NFC");
  if (typed.length !== target.length) {
    return { ok: false, code: "INVALID_SUBMISSION" };
  }

  const elapsedMs = Date.now() - payload.startedAt;
  const floorMs = Math.max(
    MIN_ELAPSED_MS_FLOOR,
    (countTypingStrokes(target) / IMPLAUSIBLE_STROKES_PER_MINUTE) * 60_000
  );
  if (elapsedMs < floorMs) {
    return { ok: false, code: "TOO_FAST" };
  }

  const score = computeTypingScore({
    targetBody: target,
    typedText: typed,
    elapsedMs,
  });

  if (score.netSpeed < 0 || score.netSpeed > MAX_REASONABLE_NET_SPEED) {
    return { ok: false, code: "INVALID_SPEED" };
  }

  const suspicious = score.netSpeed > SUSPICIOUS_NET_SPEED;

  let saved = false;
  let prevBest: number | null = null;

  // 비회원은 typing_results.clerk_id 가 NOT NULL FK 라 애초에 저장 불가 — 결과만 보여준다.
  if (input.clerkId) {
    prevBest = await getPersonalBest(input.clerkId, payload.mode);
    await db.insert(typingResults).values({
      sessionId: input.sessionId,
      clerkId: input.clerkId,
      contentId: payload.contentId,
      netSpeed: score.netSpeed,
      rawSpeed: score.rawSpeed,
      accuracyBasisPoints: score.accuracyBasisPoints,
      errorCount: score.errorCount,
      durationMs: elapsedMs,
      suspicious,
    });
    saved = true;
  }

  return {
    ok: true,
    netSpeed: score.netSpeed,
    rawSpeed: score.rawSpeed,
    accuracyBasisPoints: score.accuracyBasisPoints,
    errorCount: score.errorCount,
    durationMs: elapsedMs,
    suspicious,
    saved,
    prevBest,
  };
}
