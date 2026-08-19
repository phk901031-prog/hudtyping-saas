// scripts/seed-typing-contents.mjs
//
// kingoftyping(별개 프로덕트, 운영 안 함)의 타이핑 콘텐츠 시드 SQL을 읽어
// STENO-PORTAL-PLAN.md §5 새니타이즈 규칙(한글·영문·숫자·공백·.,!? 만 허용)을
// 적용한 뒤 typing_contents 테이블에 등록한다.
//
// 사용:
//   node scripts/seed-typing-contents.mjs           (기본: typing_contents 비어있을 때만 실행)
//   node scripts/seed-typing-contents.mjs --force    (이미 데이터가 있어도 강제로 추가 삽입)

import { readFile } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const KINGOFTYPING_SEED_DIR = "C:\\app\\kingoftyping\\supabase";
const SEED_FILES = [
  "seed_01_memes.sql",
  "seed_02_suneung.sql",
  "seed_03_classics.sql",
];

// 서버 사이드 sanitizeForTyping 과 동일 규칙 — 스크립트는 TS 빌드 없이 바로 돌리는
// 일회성 도구라 여기서 로직을 복제한다 (src/features/typing-game/sanitizer.ts 참고).
function sanitizeForTyping(text) {
  return text
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9\s.,!?]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// 한 줄 = 한 튜플: ('mode', 'ko', 'title', 'body', 'source', true),
// kingoftyping 시드는 문자열 안에 이스케이프된 홑따옴표('')가 없음을 미리 확인함 —
// 그래서 홑따옴표를 단순 구분자로 취급해도 안전하다.
const ROW_PATTERN =
  /^\('([a-z]+)',\s*'([a-z]+)',\s*'([^']*)',\s*'([^']*)',\s*'([^']*)',\s*(true|false)\)/;

function parseSeedFile(content) {
  const rows = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    const match = trimmed.match(ROW_PATTERN);
    if (!match) continue;
    const [, mode, language, title, body, source] = match;
    if (language !== "ko") continue;
    if (mode !== "short" && mode !== "long") continue;
    rows.push({ mode, title, body, source });
  }
  return rows;
}

// 심하게 훼손된 지문은 폐기 — 새니타이즈 후 2자 미만이거나, 원문 대비 20% 넘게
// 깎여나간 경우(괄호/따옴표 등이 문장 골격에 가까울 만큼 많이 쓰인 경우).
const MIN_SANITIZED_LENGTH = 2;
const MAX_LOSS_RATIO = 0.2;

function evaluate(body) {
  const sanitized = sanitizeForTyping(body);
  const originalLength = body.replace(/\s+/g, " ").trim().length;
  const lossRatio = originalLength === 0 ? 1 : 1 - sanitized.length / originalLength;
  const discard = sanitized.length < MIN_SANITIZED_LENGTH || lossRatio > MAX_LOSS_RATIO;
  return { sanitized, lossRatio, discard };
}

async function main() {
  const force = process.argv.includes("--force");

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL not set in .env.local");
    process.exit(1);
  }
  const sql = neon(process.env.DATABASE_URL);

  const [{ count }] = await sql`SELECT count(*)::int AS count FROM typing_contents`;
  if (count > 0 && !force) {
    console.error(
      `typing_contents 에 이미 ${count}행이 있습니다. 중복 삽입 방지를 위해 중단합니다.`
    );
    console.error("정말 추가로 더 넣으려면 --force 로 다시 실행하세요.");
    process.exit(1);
  }

  let totalParsed = 0;
  let totalKept = 0;
  let totalDiscarded = 0;
  const discardedSamples = [];
  const toInsert = [];

  for (const fileName of SEED_FILES) {
    const filePath = path.join(KINGOFTYPING_SEED_DIR, fileName);
    const content = await readFile(filePath, "utf8");
    const rows = parseSeedFile(content);
    totalParsed += rows.length;

    for (const row of rows) {
      const { sanitized, lossRatio, discard } = evaluate(row.body);
      if (discard) {
        totalDiscarded += 1;
        if (discardedSamples.length < 10) {
          discardedSamples.push({
            title: row.title,
            lossPercent: Math.round(lossRatio * 100),
            sanitized,
          });
        }
        continue;
      }
      totalKept += 1;
      toInsert.push({ mode: row.mode, body: sanitized, source: row.source });
    }
  }

  console.log(`파싱: ${totalParsed}행 (memes/suneung/classics 합산)`);
  console.log(`등록 예정: ${totalKept}행 / 폐기: ${totalDiscarded}행`);
  if (discardedSamples.length > 0) {
    console.log("\n폐기 샘플 (최대 10개):");
    for (const sample of discardedSamples) {
      console.log(`  - [${sample.lossPercent}% 손실] ${sample.title} → "${sample.sanitized}"`);
    }
  }

  // 대량 INSERT — neon-http 드라이버는 트랜잭션 없이 단발 쿼리이므로 배치로 나눠 전송.
  const BATCH_SIZE = 50;
  let inserted = 0;
  for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
    const batch = toInsert.slice(i, i + BATCH_SIZE);
    for (const row of batch) {
      await sql`
        INSERT INTO typing_contents (mode, body, source, is_active)
        VALUES (${row.mode}, ${row.body}, ${row.source}, true)
      `;
      inserted += 1;
    }
    console.log(`  ...${inserted}/${toInsert.length} 삽입`);
  }

  console.log(`\n✓ typing_contents 에 ${inserted}행 등록 완료.`);
}

main().catch((err) => {
  console.error("시딩 실패:", err);
  process.exit(1);
});
