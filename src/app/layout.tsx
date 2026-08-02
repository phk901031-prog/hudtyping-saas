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
  title: "낱말지기 | 한글 문서 위 우리말샘 HUD",
  description:
    "속기사·회의록 작성자가 한글 문서 작업 중 Alt+Tab 없이 우리말샘 검색 결과를 즉시 확인할 수 있는 Windows HUD 도구.",
  keywords: ["속기", "우리말샘", "회의록", "한글", "HUD", "단축키"],
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
        <body className="flex min-h-full flex-col">{children}</body>
      </html>
    </ClerkProvider>
  );
}
