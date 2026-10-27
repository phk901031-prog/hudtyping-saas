// src/app/sitemap.ts
// 검색엔진용 사이트맵 (/sitemap.xml). 공개 소개·안내 페이지만 싣는다.
// 대시보드·관리자·API·다운로드 리다이렉트 경로는 넣지 않는다 (robots.ts 에서 차단).

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

// 경로 → 우선순위 (제품 소개 > 안내 > 약관)
const PAGES: [path: string, priority: number][] = [
  ["/", 1],
  ["/wordkeeper", 0.9],
  ["/sog-player", 0.9],
  ["/download", 0.7],
  ["/download/windows", 0.7],
  ["/help", 0.6],
  ["/sog-player/help", 0.6],
  ["/install-help", 0.5],
  ["/updates", 0.5],
  ["/work-steno", 0.5],
  ["/privacy", 0.2],
  ["/terms", 0.2],
];

export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => new URL(path, SITE_URL).toString();
  return PAGES.map(([path, priority]) => ({ url: url(path), priority }));
}
