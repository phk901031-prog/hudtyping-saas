import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 2026-08-14~26: 포털(Work/Play/Study) 실험을 위해 낱말지기 페이지들을
  // /work/natmalgi/* 로 옮겼다가, 2026-08-26 다시 낱말지기 단일 제품 사이트로
  // 되돌리면서 전부 최상위 경로로 원복. 그 사이 색인되거나 북마크된 URL이
  // 깨지지 않도록 permanent(308) 리다이렉트로 새 위치로 자동 이동.
  async redirects() {
    return [
      {
        source: "/work/natmalgi",
        destination: "/",
        permanent: true,
      },
      {
        source: "/work/natmalgi/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/play/typing",
        destination: "/",
        permanent: true,
      },
      {
        source: "/games/typing",
        destination: "/",
        permanent: true,
      },
      {
        source: "/study/bogochigi",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
