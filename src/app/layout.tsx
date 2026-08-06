import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { BRAND, NATMALGI_ONLINE } from "@/config/product";
import { SITE_URL } from "@/config/site";
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
  metadataBase: SITE_URL,
  title: {
    default: `${BRAND.name} · ${BRAND.tagline}`,
    template: `%s | ${BRAND.name}`,
  },
  description:
    `${BRAND.name}는 속기사를 위한 도구와 정보를 제공합니다. ${NATMALGI_ONLINE.name}으로 문서 작업 중 우리말샘 뜻풀이와 예문을 Windows HUD에서 확인하세요.`,
  keywords: ["속기", "속기사", "우리말샘", "회의록", "한글", "HUD", "단축키"],
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
