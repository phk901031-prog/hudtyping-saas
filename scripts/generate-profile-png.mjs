// scripts/generate-profile-png.mjs
//
// SVG 디자인을 카카오톡 프로필용 PNG로 변환.
// 사용: node scripts/generate-profile-png.mjs
//
// 디자인 수정 시:
//   1) public/branding/profile-kakao.svg 편집
//   2) 이 스크립트 다시 실행 → PNG 갱신

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const svgPath = path.join(root, "public", "branding", "profile-kakao.svg");
const pngPath = path.join(root, "public", "branding", "profile-kakao.png");

const svg = await readFile(svgPath);

// 1080x1080 — 카카오톡 권장 (작게 줄여 표시되니 충분히 큰 원본)
// density: 300 → SVG 텍스트가 깔끔하게 렌더
const buf = await sharp(svg, { density: 300 })
  .resize(1080, 1080)
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile(pngPath, buf);

const sizeKb = (buf.byteLength / 1024).toFixed(1);
console.log(`✓ ${path.relative(root, pngPath)} (${sizeKb} KB, 1080x1080)`);
