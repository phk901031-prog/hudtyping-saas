const LEADS: Record<string, number> = {
  r: 0, R: 1, s: 2, e: 3, E: 4, f: 5, a: 6, q: 7, Q: 8,
  t: 9, T: 10, d: 11, w: 12, W: 13, c: 14, z: 15, x: 16, v: 17, g: 18,
};
const VOWELS: Record<string, number> = {
  k: 0, o: 1, i: 2, O: 3, j: 4, p: 5, u: 6, P: 7, h: 8,
  y: 12, n: 13, b: 17, m: 18, l: 20,
};
const TAILS: Record<string, number> = {
  r: 1, R: 2, s: 4, e: 7, f: 8, a: 16, q: 17, t: 19, T: 20,
  d: 21, w: 22, c: 23, z: 24, x: 25, v: 26, g: 27,
};
const COMPAT_LEADS = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
const COMPAT_VOWELS = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ", "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ", "ㅢ", "ㅣ"];
const VOWEL_PAIRS = new Map(["8,0", "8,1", "8,20", "13,4", "13,5", "13,20", "18,20"].map((key, index) => [key, [9, 10, 11, 14, 15, 16, 19][index]]));
const TAIL_PAIRS = new Map([["1,19", 3], ["4,22", 5], ["4,27", 6], ["8,1", 9], ["8,16", 10], ["8,17", 11], ["8,19", 12], ["8,25", 13], ["8,26", 14], ["8,27", 15], ["17,19", 18]]);
const TAIL_SPLITS = new Map([[3, [1, 9]], [5, [4, 12]], [6, [4, 18]], [9, [8, 0]], [10, [8, 6]], [11, [8, 7]], [12, [8, 9]], [13, [8, 16]], [14, [8, 17]], [15, [8, 18]], [18, [17, 9]]]);
const TAIL_TO_LEAD: Record<number, number> = { 1: 0, 2: 1, 4: 2, 7: 3, 8: 5, 16: 6, 17: 7, 19: 9, 20: 10, 21: 11, 22: 12, 23: 14, 24: 15, 25: 16, 26: 17, 27: 18 };

/** 영문 자판으로 잘못 시작한 2벌식 입력을 브라우저 안에서 한글로 복원한다. */
export function convertDubeolsik(input: string) {
  let output = "";
  let lead: number | null = null;
  let vowel: number | null = null;
  let tail = 0;

  const flush = () => {
    if (lead !== null && vowel !== null) output += String.fromCharCode(0xac00 + (lead * 21 + vowel) * 28 + tail);
    else if (lead !== null) output += COMPAT_LEADS[lead];
    else if (vowel !== null) output += COMPAT_VOWELS[vowel];
    lead = null; vowel = null; tail = 0;
  };

  for (const key of input) {
    const nextVowel = VOWELS[key];
    const nextLead = LEADS[key];
    if (nextVowel !== undefined) {
      if (lead === null) { vowel = nextVowel; flush(); continue; }
      if (vowel === null) { vowel = nextVowel; continue; }
      if (tail) {
        const split = TAIL_SPLITS.get(tail);
        if (split) { tail = split[0]; const next = split[1]; flush(); lead = next; vowel = nextVowel; }
        else { const next = TAIL_TO_LEAD[tail]; tail = 0; flush(); lead = next; vowel = nextVowel; }
        continue;
      }
      const combined = VOWEL_PAIRS.get(`${vowel},${nextVowel}`);
      if (combined !== undefined) vowel = combined;
      else { flush(); vowel = nextVowel; flush(); }
      continue;
    }
    if (nextLead !== undefined) {
      if (lead === null) { lead = nextLead; continue; }
      if (vowel === null) { flush(); lead = nextLead; continue; }
      const nextTail = TAILS[key];
      if (nextTail === undefined) { flush(); lead = nextLead; continue; }
      if (!tail) { tail = nextTail; continue; }
      const combined = TAIL_PAIRS.get(`${tail},${nextTail}`);
      if (combined !== undefined) tail = combined;
      else { flush(); lead = nextLead; }
      continue;
    }
    flush(); output += key;
  }
  flush();
  return output;
}
