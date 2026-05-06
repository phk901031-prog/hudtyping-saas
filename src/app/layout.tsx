// src/app/layout.tsx
// 루트 레이아웃 — HTML 골격 + 폰트 + 인증 컨텍스트 + 메타데이터.
//
// 폰트 전략:
//   - 본문/UI: Pretendard Variable (globals.css에서 CDN 로드, 한국어 시인성 우수, 무료)
//   - 영문 fallback: Geist Sans
//   - 코드: Geist Mono

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "hudtyping — 회의록 쓰면서, 단어 찾는 시간을 줄여요",
  description:
    "한글에서 단축키 한 번이면 우리말샘 사전이 옆에 떠요. 속기사·회의록 작성자를 위한 데스크톱 HUD 도구.",
  keywords: ["속기", "우리말샘", "사전", "회의록", "한글", "HUD", "단축키"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="ko"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
