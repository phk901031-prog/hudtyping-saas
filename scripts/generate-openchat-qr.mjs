// 카톡 오픈톡방 링크의 QR 코드를 SVG 로 생성해 public/ 에 저장.
// 링크가 바뀌면 URL 만 갱신하고 다시 실행.

import QRCode from "qrcode";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const URL = "https://open.kakao.com/o/skntmeGi";
const OUT = path.join(process.cwd(), "public", "openchat-qr.svg");

const svg = await QRCode.toString(URL, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 1,
  color: {
    // 홈페이지 --foreground (라이트 모드) — 카드에서 명료하게 대비
    dark: "#091724",
    light: "#00000000", // 투명 배경 — 어느 카드 색이든 어울리도록
  },
});

await writeFile(OUT, svg, "utf8");
console.log(`saved: ${OUT}`);
