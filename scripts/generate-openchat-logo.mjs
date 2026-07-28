import sharp from "sharp";
import path from "node:path";
import os from "node:os";

// Palette — 홈페이지 색상 그대로
const NAVY = "#091724";       // deep foreground / bg
const NAVY_SOFT = "#122436";  // for gradient
const KEY_TOP = "#ffffff";
const KEY_MID = "#f0f4f8";
const KEY_BOTTOM = "#dae2ea";
const KEY_SHADOW = "#04101c";
const KEY_BORDER = "#c7d1dc";
const LETTER = "#091724";

const SIZE = 1024;

/**
 * 카카오톡 프로필은 원형으로 크롭되므로 중요한 요소는 중앙 78% 안에.
 * 배경은 딥 네이비 (앱 홈페이지 --foreground), 중앙에 흰 키캡 + H 글자.
 */
const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SIZE} ${SIZE}" width="${SIZE}" height="${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${NAVY_SOFT}"/>
      <stop offset="100%" stop-color="${NAVY}"/>
    </linearGradient>
    <linearGradient id="key" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${KEY_TOP}"/>
      <stop offset="60%" stop-color="${KEY_MID}"/>
      <stop offset="100%" stop-color="${KEY_BOTTOM}"/>
    </linearGradient>
    <linearGradient id="gloss" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.85)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
    <linearGradient id="ring" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.08)"/>
      <stop offset="100%" stop-color="rgba(255,255,255,0)"/>
    </linearGradient>
  </defs>

  <!-- 배경 -->
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>

  <!-- 원형 크롭 안전 존을 감지하는 은은한 링 (실제로는 배경 톤 변화만 살짝) -->
  <circle cx="${SIZE / 2}" cy="${SIZE / 2}" r="${SIZE * 0.46}" fill="url(#ring)"/>

  <!-- 키캡 밑 그림자 (오프셋) -->
  <rect x="192" y="228" width="640" height="640" rx="112" fill="${KEY_SHADOW}" opacity="0.55"/>

  <!-- 키캡 본체 -->
  <rect x="192" y="192" width="640" height="640" rx="112"
        fill="url(#key)" stroke="${KEY_BORDER}" stroke-width="3"/>

  <!-- 상단 정반사 광택 띠 -->
  <rect x="216" y="216" width="592" height="72" rx="52" fill="url(#gloss)"/>

  <!-- H 글자 -->
  <text x="${SIZE / 2}" y="${SIZE * 0.66}"
        font-family="Inter, 'Pretendard', 'SF Pro Display', system-ui, sans-serif"
        font-weight="900" font-size="440" fill="${LETTER}"
        text-anchor="middle" letter-spacing="-8">H</text>
</svg>
`.trim();

const outPath = path.join(os.homedir(), "Desktop", "hudtyping-openchat-logo.png");
await sharp(Buffer.from(svg))
  .png()
  .toFile(outPath);
console.log(`saved: ${outPath}`);
