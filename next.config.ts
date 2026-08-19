import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 낱말지기 개별 페이지들이 /work/natmalgi/* 로 이동되면서
  // 기존 URL(검색 색인 · 북마크 · 외부 링크 · HUD 앱 하드코드)이 깨지지 않도록
  // permanent(308) 리다이렉트로 새 위치로 자동 이동.
  async redirects() {
    return [
      {
        source: "/download/:path*",
        destination: "/work/natmalgi/download/:path*",
        permanent: true,
      },
      {
        source: "/help",
        destination: "/work/natmalgi/help",
        permanent: true,
      },
      {
        source: "/updates",
        destination: "/work/natmalgi/updates",
        permanent: true,
      },
      {
        source: "/install-help",
        destination: "/work/natmalgi/install-help",
        permanent: true,
      },
      {
        source: "/games/typing",
        destination: "/play/typing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
