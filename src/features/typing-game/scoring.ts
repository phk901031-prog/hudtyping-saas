// 순수 채점 함수 — I/O 없음. 클라이언트(실시간 표시)와 서버(재검증) 둘 다에서 재사용.
// countTypingStrokes(한컴타자 자소 기준)를 기반으로 하기 때문에 kingoftyping의
// 단순 글자 수 세기보다 속기사 실무에 가까운 타수가 나온다.
import { countTypingStrokes } from "@/features/typing-game/typing-strokes";

export interface TypingScore {
  netSpeed: number; // 정타만 반영한 분당 타수
  rawSpeed: number; // 오타 포함 전체 시도 분당 타수
  accuracyBasisPoints: number; // 정확도 * 100 (10000 = 100.00%)
  errorCount: number; // 틀린 글자 수
}

export function computeTypingScore(input: {
  targetBody: string;
  typedText: string;
  elapsedMs: number;
}): TypingScore {
  const target = Array.from(input.targetBody.normalize("NFC"));
  const typed = Array.from(input.typedText.normalize("NFC"));
  const length = Math.min(target.length, typed.length);

  let correctStrokes = 0;
  let errorStrokes = 0;
  let errorCount = 0;

  for (let i = 0; i < length; i++) {
    if (typed[i] === target[i]) {
      correctStrokes += countTypingStrokes(target[i]);
    } else {
      errorCount += 1;
      errorStrokes += countTypingStrokes(typed[i]);
    }
  }

  const totalStrokes = correctStrokes + errorStrokes;
  const accuracyBasisPoints =
    totalStrokes > 0 ? Math.round((correctStrokes / totalStrokes) * 10000) : 0;

  const elapsedMinutes = Math.max(1, input.elapsedMs) / 60000;
  const netSpeed = Math.round(correctStrokes / elapsedMinutes);
  const rawSpeed = Math.round(totalStrokes / elapsedMinutes);

  return { netSpeed, rawSpeed, accuracyBasisPoints, errorCount };
}
