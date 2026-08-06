import Image from "next/image";
import Link from "next/link";
import { BRAND, NATMALGI_ONLINE } from "@/config/product";
import { WINDOWS_RELEASE } from "@/config/release";
import { OPENCHAT } from "@/config/community";

const FOOTER_LINKS = [
  { href: "/download/windows", label: "Windows 다운로드" },
  { href: "/games/typing", label: "30초 타자 게임" },
  { href: "/help", label: "사용 가이드" },
  { href: "/updates", label: "업데이트 로그" },
  { href: "/trends", label: "인기 검색어" },
  { href: "/install-help", label: "설치 도움말" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보 처리방침" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <Image src="/logo.png" alt="" width={40} height={40} className="h-10 w-10 rounded-xl" />
          <div>
            <p className="font-display text-lg">{BRAND.name}</p>
            <p className="ko-copy mt-1 text-xs leading-5 text-muted">
              {BRAND.tagline}<br />
              {NATMALGI_ONLINE.name} · Windows v{WINDOWS_RELEASE.version}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a href={OPENCHAT.url} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-foreground">
            공지·문의 채널
          </a>
        </div>
      </div>
    </footer>
  );
}
