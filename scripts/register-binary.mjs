// scripts/register-binary.mjs
//
// 빌드된 .exe의 SHA-256을 SaaS DB의 official_binaries 테이블에 등록.
// 이 hash가 등록돼 있어야 그 .exe가 SaaS 인증을 통과 (변조 .exe 차단).
//
// 사용:
//   node scripts/register-binary.mjs <path-to-exe> <version> [notes]
//
// 예:
//   node scripts/register-binary.mjs "C:\app\hudtyping\dist\hudtyping-Setup-0.2.0.exe" 0.2.0 "Security hardening + autoUpdater"

import crypto from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local" });

const [, , exePath, version, ...noteParts] = process.argv;
const notes = noteParts.join(" ").trim() || null;

if (!exePath || !version) {
  console.error("Usage: node scripts/register-binary.mjs <path-to-exe> <version> [notes]");
  process.exit(1);
}

if (!/^\d+\.\d+\.\d+/.test(version)) {
  console.error(`Invalid version format: ${version} (expected x.y.z)`);
  process.exit(1);
}

const absPath = path.resolve(exePath);
const stats = await stat(absPath).catch(() => null);
if (!stats || !stats.isFile()) {
  console.error(`File not found: ${absPath}`);
  process.exit(1);
}

const buf = await readFile(absPath);
const sha256 = crypto.createHash("sha256").update(buf).digest("hex");
const sizeMb = (buf.length / 1024 / 1024).toFixed(1);

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set in .env.local");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

// ON CONFLICT DO NOTHING — 같은 hash 중복 등록 방지 (idempotent)
const result = await sql`
  INSERT INTO official_binaries (version, sha256, notes)
  VALUES (${version}, ${sha256}, ${notes})
  ON CONFLICT (sha256) DO NOTHING
  RETURNING id, released_at
`;

if (result.length === 0) {
  console.log(`⚠️  Hash already registered: ${sha256}`);
  console.log(`    File: ${absPath}`);
  process.exit(0);
}

console.log(`✓ Registered v${version}`);
console.log(`  SHA-256: ${sha256}`);
console.log(`  File:    ${absPath}`);
console.log(`  Size:    ${sizeMb} MB`);
console.log(`  ID:      ${result[0].id}`);
console.log(`  Time:    ${result[0].released_at}`);
console.log("");
console.log("이 hash로 빌드된 .exe만 SaaS 인증 통과합니다.");
console.log("롤백 필요 시: DELETE FROM official_binaries WHERE version = '" + version + "';");
