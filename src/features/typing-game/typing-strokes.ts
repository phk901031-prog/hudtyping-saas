// 한컴타자의 자소 단위 기준과 같이 한글 음절을 실제 구성 자소 수로 센다.
// 겹모음과 겹받침은 두 기본 자소로 계산하고 공백·온점 등은 한 타로 센다.
const MEDIAL_STROKES = [1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 1, 1, 2, 2, 2, 1, 1, 2, 1];
const FINAL_STROKES = [0, 1, 1, 2, 1, 2, 2, 1, 1, 2, 2, 2, 2, 2, 2, 2, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 1];
const COMPOUND_COMPATIBILITY_JAMO = new Set([
  "ㅘ", "ㅙ", "ㅚ", "ㅝ", "ㅞ", "ㅟ", "ㅢ",
  "ㄳ", "ㄵ", "ㄶ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅄ",
]);

export function countTypingStrokes(text: string) {
  let strokes = 0;
  for (const character of Array.from(text.normalize("NFC"))) {
    const code = character.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const syllableIndex = code - 0xac00;
      const medialIndex = Math.floor((syllableIndex % 588) / 28);
      const finalIndex = syllableIndex % 28;
      strokes += 1 + MEDIAL_STROKES[medialIndex] + FINAL_STROKES[finalIndex];
    } else {
      strokes += COMPOUND_COMPATIBILITY_JAMO.has(character) ? 2 : 1;
    }
  }
  return strokes;
}
