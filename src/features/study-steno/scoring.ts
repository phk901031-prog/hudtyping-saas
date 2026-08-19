import { isScorable, countScorableChars } from "./text-units";

// 원문 vs 입력문 사이 최소 편집 거리 정렬. Study Steno 채점(보고치기·듣고치기 공통)의
// 기반 — 자리별 단순 비교로는 탈자/첨자로 밀린 뒤의 글자들이 전부 오자로 오판되므로
// 반드시 편집거리 기반 정렬이 필요하다.
export type AlignOp =
  | { type: "match"; original: string }
  | { type: "substitute"; original: string; typed: string } // 오자 — 다른 글자를 침
  | { type: "delete"; original: string } // 탈자 — 원문 글자를 안 침
  | { type: "insert"; typed: string }; // 첨자 — 원문에 없는 글자를 더 침

export function alignTexts(original: string, typed: string): AlignOp[] {
  const a = Array.from(original.normalize("NFC"));
  const b = Array.from(typed.normalize("NFC"));
  const n = a.length;
  const m = b.length;

  // dp[i][j] = a의 앞 i글자 ↔ b의 앞 j글자 사이 최소 편집 횟수 (치환·삭제·삽입 각 비용 1).
  // 채점 가중치(첨자 1/3 등)는 여기서 반영하지 않는다 — 정렬 자체가 왜곡되면
  // "가장 자연스러운 대응"이 아니라 점수에 유리한 쪽으로 편향되기 때문에,
  // 정렬은 균등 비용으로 구하고 가중치는 scoreKoreanSteno()에서 별도로 적용한다.
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));
  for (let i = 0; i <= n; i++) dp[i][0] = i;
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const ops: AlignOp[] = [];
  let i = n;
  let j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ type: "match", original: a[i - 1] });
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ type: "substitute", original: a[i - 1], typed: b[j - 1] });
      i -= 1;
      j -= 1;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ type: "delete", original: a[i - 1] });
      i -= 1;
    } else {
      ops.push({ type: "insert", typed: b[j - 1] });
      j -= 1;
    }
  }
  ops.reverse();
  return ops;
}

export interface StenoScoreResult {
  score: number;
  accuracy: number; // 0~100
  passed: boolean; // 정확도 90% 이상 (한글속기 합격 기준)
  ojaCount: number; // 오자
  taljaCount: number; // 탈자
  cheomjaCount: number; // 첨자
  deduction: number;
  totalScorable: number;
  ops: AlignOp[];
}

const PASS_THRESHOLD = 90;

// 대한상공회의소 한글속기 채점기준: 오자 1자당 -1점, 탈자 1자당 -1점, 첨자 3자당 -1점.
// 공백·느낌표·물음표는 채점 대상에서 제외.
export function scoreKoreanSteno(original: string, typed: string): StenoScoreResult {
  const ops = alignTexts(original, typed);

  let ojaCount = 0;
  let taljaCount = 0;
  let cheomjaCount = 0;

  for (const op of ops) {
    if (op.type === "substitute") {
      if (isScorable(op.original) || isScorable(op.typed)) ojaCount += 1;
    } else if (op.type === "delete") {
      if (isScorable(op.original)) taljaCount += 1;
    } else if (op.type === "insert") {
      if (isScorable(op.typed)) cheomjaCount += 1;
    }
  }

  const totalScorable = countScorableChars(original);
  const deduction = ojaCount * 1 + taljaCount * 1 + cheomjaCount / 3;
  const score = Math.max(0, totalScorable - deduction);
  const accuracy = totalScorable > 0 ? (score / totalScorable) * 100 : 100;

  return {
    score: Math.round(score * 10) / 10,
    accuracy: Math.round(accuracy * 10) / 10,
    passed: accuracy >= PASS_THRESHOLD,
    ojaCount,
    taljaCount,
    cheomjaCount,
    deduction: Math.round(deduction * 10) / 10,
    totalScorable,
    ops,
  };
}
