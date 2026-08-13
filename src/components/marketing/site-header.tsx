import Image from "next/image";
import Link from "next/link";
import { BRAND, NATMALGI_ONLINE } from "@/config/product";
import { AccountActions } from "@/components/marketing/account-actions";

const NAV_LINKS = [
  { href: "/work/natmalgi", label: "낱말지기" },
  { href: "/work/natmalgi/help", label: "사용 가이드" },
  { href: "/work/natmalgi/updates", label: "업데이트" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
        <Link href="/" className="group inline-flex min-w-0 items-center gap-3" aria-label={`${BRAND.name} 홈`}>
          <Image
            src="/logo.png"
            alt=""
            width={44}
            height={44}
            priority
            className="h-10 w-10 shrink-0 rounded-xl sm:h-11 sm:w-11"
          />
          <span className="min-w-0 leading-none">
            <span className="block truncate font-display text-lg sm:text-xl">{BRAND.name}</span>
            <span className="mt-1 block truncate text-[10px] font-medium text-muted sm:text-[11px]">
              {BRAND.tagline} · {NATMALGI_ONLINE.name}
            </span>
          </span>
        </Link>

        <nav aria-label="주요 메뉴" className="hidden items-center gap-5 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <AccountActions />
        </div>
      </div>
      <nav aria-label="모바일 메뉴" className="flex gap-5 overflow-x-auto border-t border-border px-5 py-2.5 text-sm lg:hidden">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="shrink-0 font-medium text-muted transition hover:text-foreground">
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
