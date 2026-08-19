// 지문 등록 시 서버가 강제하는 문자 화이트리스트 (STENO-PORTAL-PLAN.md §5).
// 한글 · 영문 · 숫자 · 공백 · 온점/쉼표/느낌표/물음표 4종만 허용.
// 속기사 키보드로 치기 어려운 부호(괄호·물결·따옴표·콜론 등)는 전부 제거한다.
export function sanitizeForTyping(text: string): string {
  return text
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9\s.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
