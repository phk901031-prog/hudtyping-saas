// scripts/generate-demo-dictionary.mjs
// 홈페이지 브라우저 체험판(HUD 데모)에 쓸 우리말샘 검색 결과를 미리 받아 정적 JSON 으로 저장.
//
// - 체험판은 방문자마다 우리말샘·Redis·DB 를 호출하지 않도록 이 파일만 읽는다 (비용 0).
// - 단어 목록을 바꾸면 다시 실행: node scripts/generate-demo-dictionary.mjs
// - .env.local 의 WOORI_KEY 사용.
//
// 체험판의 목적은 "띄어쓰기 확인"이다. 그래서 표제어 표기를 우리말샘 그대로 보존한다.
//   공백 = 띄어 씀 (음 소거)
//   ^    = 띄어 씀이 원칙, 붙여 씀 허용 (가해^학생)
//   -    = 한 단어 안의 구성 경계, 붙여 씀 (회의-록)
// 붙여 치든 띄어 치든 같은 표제어가 잡히므로, 공백·^·- 를 모두 지우고 비교한다.

import { readFileSync, writeFileSync } from "node:fs";

// 검색어(문서에 입력된 그대로) → 보여줄 동형어의 한자. null 이면 한자 구분 없이 전부.
const QUERIES = {
  음소거: null,
  가해학생: null,
  사실확인: null, // 표제어 없음 예시
  회의록: null,
  감사: ["監査", "感謝"], // 동형어 표시 예시
  "국정 감사": null, // 연타 확장 예시
};

const OUT = "src/features/demo/demo-dictionary.json";
const MAX_RELATED = 3; // 표제어가 없을 때 보여줄 '이 말이 들어간 표제어' 수

const env = readFileSync(".env.local", "utf8");
const key = /^WOORI_KEY=(.*)$/m.exec(env)?.[1]?.trim().replace(/^"|"$/g, "");
if (!key) throw new Error("WOORI_KEY 없음");

// 우리말샘 뜻풀이에 섞여 오는 태그·특수 기호 정리
const clean = (s) =>
  String(s ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();

// 비교용: 띄어쓰기 표시(공백·^·-)를 모두 지운다
const bare = (w) => clean(w).replace(/[\s^-]/g, "");

const result = {};
for (const [q, origins] of Object.entries(QUERIES)) {
  const url = new URL("https://opendict.korean.go.kr/api/search");
  url.searchParams.set("key", key);
  url.searchParams.set("q", q);
  url.searchParams.set("req_type", "json");
  url.searchParams.set("num", "100");
  const raw = await (await fetch(url)).json();
  const items = raw.channel?.item ?? [];
  const exact = items.filter((it) => bare(it.word) === bare(q));

  // 표제어(표기+한자)별로 첫 뜻풀이 하나만 모은다 (우리말샘은 뜻풀이마다 item 이 따로 오기도 함)
  const entries = [];
  for (const it of exact) {
    for (const s of it.sense ?? []) {
      const word = clean(it.word);
      const origin = clean(s.origin);
      if (origins && !origins.includes(origin)) continue;
      if (entries.some((e) => e.word === word && e.origin === origin)) continue;
      entries.push({ word, origin, pos: clean(s.pos), definition: clean(s.definition) });
    }
  }
  if (origins) entries.sort((a, b) => origins.indexOf(a.origin) - origins.indexOf(b.origin));

  // 표제어가 없으면, 실제 HUD 처럼 이 말이 들어간 더 긴 표제어를 몇 개 보여준다
  const related = entries.length
    ? []
    : [...new Set(items.map((it) => clean(it.word)))].slice(0, MAX_RELATED);

  result[q] = { entries, related };
  console.log(q, "→", entries.map((e) => `${e.word}(${e.origin})`).join(", ") || `없음 / 관련: ${related.join(", ")}`);
}

writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
console.log("저장:", OUT);
