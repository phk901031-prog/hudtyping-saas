// scripts/generate-demo-dictionary.mjs
// 홈페이지 브라우저 체험판(HUD 데모)에 쓸 우리말샘 뜻풀이를 미리 받아 정적 JSON 으로 저장.
//
// - 체험판은 방문자마다 우리말샘·Redis·DB 를 호출하지 않도록 이 파일만 읽는다 (비용 0).
// - 단어 목록을 바꾸면 다시 실행: node scripts/generate-demo-dictionary.mjs
// - .env.local 의 WOORI_KEY 사용.
//
// 우리말샘은 동형어(감사: 甘死·感謝·監査…)를 사전순으로 수십 개 돌려준다.
// 데모 문맥에 맞는 동형어를 한자(origin)로 골라 그 순서대로 보여준다.
// 뜻풀이 문구 자체는 우리말샘 응답 그대로 쓴다.

import { readFileSync, writeFileSync } from "node:fs";

// 검색어 → 보여줄 동형어의 한자 (앞에 둔 것이 먼저 표시)
const QUERIES = {
  회의: ["會議"],
  안건: ["案件"],
  정리: ["整理"],
  위원장: ["委員長"],
  질의: ["質疑"],
  제한: ["制限"],
  증인: ["證人"],
  답변: ["答辯"],
  재차: ["再次"],
  확인: ["確認"],
  요청: ["要請"],
  감사: ["監査", "感謝"], // 동형어 표시 예시
  "국정 감사": ["國政監査"],
};

const OUT = "src/features/demo/demo-dictionary.json";
const MAX_SENSES = 2; // 뜻풀이는 단어당 최대 2개

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

// 표제어 비교용: '-'(형태소 경계) 제거, '^'(띄어 씀) → 공백
const headword = (w) => clean(w).replace(/-/g, "").replace(/\^/g, " ");

const result = {};
for (const [q, origins] of Object.entries(QUERIES)) {
  const url = new URL("https://opendict.korean.go.kr/api/search");
  url.searchParams.set("key", key);
  url.searchParams.set("q", q);
  url.searchParams.set("req_type", "json");
  url.searchParams.set("num", "100");
  const raw = await (await fetch(url)).json();
  const exact = (raw.channel?.item ?? []).filter((it) => headword(it.word) === q);

  // 같은 한자의 뜻풀이를 모은다 (우리말샘은 뜻풀이마다 item 이 따로 오기도 함)
  result[q] = origins.map((origin) => {
    const senses = exact
      .flatMap((it) => it.sense ?? [])
      .filter((s) => clean(s.origin) === origin)
      .slice(0, MAX_SENSES)
      .map((s) => ({ pos: clean(s.pos), definition: clean(s.definition) }));
    if (senses.length === 0) throw new Error(`${q}(${origin}) 뜻풀이 없음`);
    return { word: q, origin, senses };
  });
  console.log(q, "→", result[q].map((it) => `${it.origin}: ${it.senses[0].definition}`).join(" / "));
}

writeFileSync(OUT, JSON.stringify(result, null, 2) + "\n");
console.log("저장:", OUT);
