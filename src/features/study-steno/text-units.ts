// 대한상공회의소 한글속기 채점기준: 공백, 느낌표(!), 물음표(?)는 채점 대상에서 제외.
const EXCLUDED_FROM_SCORING = /[\s!?]/;

export function isScorable(char: string): boolean {
  return char.length > 0 && !EXCLUDED_FROM_SCORING.test(char);
}

// 채점 대상 글자수 (공백류·!·? 제외)
export function countScorableChars(text: string): number {
  return Array.from(text.normalize("NFC")).filter(isScorable).length;
}

export interface WordUnit {
  text: string; // 어절 자체 (공백 미포함)
  trailingSpace: string; // 이 어절 뒤에 붙는 공백 (재조합용)
}

// 어절(공백 기준) 단위로 분리 — 노출 페이스메이커가 이 단위로 텍스트를 내보낸다.
export function splitIntoWordUnits(text: string): WordUnit[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const chunks = trimmed.match(/\S+\s*/g) ?? [];
  return chunks.map((chunk) => {
    const word = chunk.trimEnd();
    const trailingSpace = chunk.slice(word.length);
    return { text: word, trailingSpace: trailingSpace.length > 0 ? trailingSpace : " " };
  });
}
