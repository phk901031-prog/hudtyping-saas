// 낱말지기 로고를 원본 PNG 하나에서 각 플랫폼 자산으로 파생 생성.
// 사용: node scripts/generate-brand-assets.mjs
//
// 산출물:
//   public/logo.png                    원본 그대로 (홈페이지 사용)
//   src/app/icon.png                   32×32 → Next 가 자동으로 favicon.ico 대체
//   src/app/apple-icon.png             180×180
//   src/app/opengraph-image.png        1200×630 (로고 + 텍스트)
//   public/logo-hud.ico                Windows HUD .exe 용 멀티 사이즈 .ico
//                                       (수동으로 C:\app\hudtyping\resources\icon.ico 로 복사)

import sharp from "sharp";
import path from "node:path";
import fs from "node:fs/promises";
import pngToIco from "png-to-ico";

const ROOT = path.resolve(process.cwd());
const SOURCE = path.join(ROOT, "LOG.png");

const OUTPUTS = {
  publicLogo: path.join(ROOT, "public/logo.png"),
  icon: path.join(ROOT, "src/app/icon.png"),
  appleIcon: path.join(ROOT, "src/app/apple-icon.png"),
  og: path.join(ROOT, "src/app/opengraph-image.png"),
  hudIco: path.join(ROOT, "public/logo-hud.ico"),
};

// OG 이미지에 얹을 문구
const OG_TAGLINE = "속기사의 놀이터 · 낱말지기 온라인";
const OG_TITLE = "PlaySteno";

await fs.access(SOURCE).catch(() => {
  console.error(`원본 로고를 찾을 수 없습니다: ${SOURCE}`);
  process.exit(1);
});

// 1) public/logo.png — 홈페이지 사용용 원본 복사
await fs.copyFile(SOURCE, OUTPUTS.publicLogo);
console.log(`✓ ${path.relative(ROOT, OUTPUTS.publicLogo)}`);

// 2) src/app/icon.png — 32×32 (Next auto-serves as favicon)
await sharp(SOURCE)
  .resize(64, 64, { fit: "cover" })
  .png()
  .toFile(OUTPUTS.icon);
console.log(`✓ ${path.relative(ROOT, OUTPUTS.icon)}`);

// 3) src/app/apple-icon.png — 180×180
await sharp(SOURCE)
  .resize(180, 180, { fit: "cover" })
  .png()
  .toFile(OUTPUTS.appleIcon);
console.log(`✓ ${path.relative(ROOT, OUTPUTS.appleIcon)}`);

// 4) src/app/opengraph-image.png — 1200×630 (로고 + 텍스트)
const logoSize = 340;
const logoBuffer = await sharp(SOURCE)
  .resize(logoSize, logoSize, { fit: "cover" })
  .png()
  .toBuffer();

const ogSvgText = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="bg" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#12283a"/>
      <stop offset="60%" stop-color="#091724"/>
      <stop offset="100%" stop-color="#050e17"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <text x="720" y="290" fill="#ffffff" font-family="Pretendard, 'SF Pro Display', system-ui, sans-serif"
        font-size="88" font-weight="800" letter-spacing="-3">${OG_TITLE}</text>
  <text x="720" y="360" fill="#a8fff4" font-family="Pretendard, 'SF Pro Display', system-ui, sans-serif"
        font-size="30" font-weight="500">${OG_TAGLINE}</text>
  <text x="720" y="550" fill="rgba(255,255,255,0.45)" font-family="Pretendard, 'SF Pro Display', system-ui, sans-serif"
        font-size="22" font-weight="600" letter-spacing="4">PLAYSTENO</text>
</svg>
`.trim();
const ogSvg = Buffer.from(ogSvgText);

await sharp(ogSvg)
  .composite([
    {
      input: logoBuffer,
      left: 130,
      top: (630 - logoSize) / 2,
    },
  ])
  .png()
  .toFile(OUTPUTS.og);
console.log(`✓ ${path.relative(ROOT, OUTPUTS.og)}`);

// 5) public/logo-hud.ico — Windows HUD 앱용 멀티 사이즈 .ico
const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const icoBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(SOURCE).resize(size, size, { fit: "cover" }).png().toBuffer()
  )
);
const icoBuffer = await pngToIco(icoBuffers);
await fs.writeFile(OUTPUTS.hudIco, icoBuffer);
console.log(`✓ ${path.relative(ROOT, OUTPUTS.hudIco)}`);

console.log("");
console.log("완료. 다음 단계:");
console.log("  1. SaaS 빌드/배포 — Next 가 icon.png · apple-icon.png · opengraph-image.png 자동 인식");
console.log("  2. HUD (C:\\app\\hudtyping) 재빌드 전에 다음 명령으로 아이콘 교체:");
console.log("       copy /Y public\\logo-hud.ico ..\\hudtyping\\resources\\icon.ico");
console.log("       copy /Y public\\logo-hud.ico ..\\hudtyping-local\\resources\\icon.ico");
