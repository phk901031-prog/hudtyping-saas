import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Windows 다운로드 — 낱말지기 온라인",
  description: "낱말지기 온라인 최신 Windows 설치 파일과 설치 절차.",
  alternates: { canonical: "/work/natmalgi/download/windows" },
};

export default function WindowsDownloadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
