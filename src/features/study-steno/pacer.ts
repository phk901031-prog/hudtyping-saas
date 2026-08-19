import { countScorableChars, splitIntoWordUnits, type WordUnit } from "./text-units";

// 속기 속도 표현: "OO자"는 분당 채점 대상 글자수(공백 제외)를 의미한다.
export const MIN_SPEED_CPM = 80;
export const MAX_SPEED_CPM = 400;
export const SPEED_STEP = 10;
export const DEFAULT_SPEED_CPM = 190;

export interface PacedWord extends WordUnit {
  revealAtMs: number; // 세션 시작 시각 기준, 이 어절이 노출되는 시각(누적)
}

// 어절 단위로 노출 스케줄을 계산한다. 노출 시점은 "이 어절 앞까지 누적된 채점 대상
// 글자수"를 목표 속도로 나눈 시각 — 즉 정해진 속도로 계속 낭독한다고 가정했을 때
// 그 어절 차례가 오는 순간이다.
export function schedulePacing(text: string, speedCpm: number): PacedWord[] {
  const units = splitIntoWordUnits(text);
  const msPerChar = 60_000 / speedCpm;
  let cumulativeChars = 0;

  return units.map((unit) => {
    const revealAtMs = Math.round(cumulativeChars * msPerChar);
    cumulativeChars += countScorableChars(unit.text);
    return { ...unit, revealAtMs };
  });
}

export function estimateTotalDurationMs(text: string, speedCpm: number): number {
  const totalChars = countScorableChars(text);
  return Math.round((totalChars / speedCpm) * 60_000);
}
