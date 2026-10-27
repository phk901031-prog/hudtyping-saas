// src/app/robots.ts
// 검색엔진 수집 규칙 (/robots.txt). 로그인 뒤 화면·API·설치 파일 리다이렉트는 수집하지 않게 막는다.

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",
        "/dashboard",
        "/admin",
        "/api-keys",
        "/pending",
        "/sign-in",
        "/sign-up",
        "/trends",
        "/desktop-updates/",
        "/download/windows/installer",
      ],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
