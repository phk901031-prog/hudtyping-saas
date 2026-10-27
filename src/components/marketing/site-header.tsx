import Link from "next/link";
import { AccountActions } from "@/components/marketing/account-actions";

const NAV_LINKS = [
  { href: "/wordkeeper", label: "낱말지기" },
  { href: "/sog-player", label: "속플레이어" },
  { href: "/download", label: "다운로드" },
  { href: "/help", label: "사용 가이드" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-3 px-5 py-5 sm:gap-5 sm:px-8 sm:py-6">
        <Link href="/" className="inline-flex items-baseline gap-2" aria-label="PlaySteno 홈">
          <span className="text-lg font-black tracking-[-0.035em] sm:text-xl">
            PLAYSTENO<span className="text-accent">.</span>
          </span>
          <span className="hidden text-xs font-medium text-muted sm:inline">TOOLS FOR STENOGRAPHERS</span>
        </Link>

        <nav aria-label="주요 메뉴" className="ml-auto hidden items-center gap-5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-muted transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center">
          <AccountActions />
        </div>
      </div>
    </header>
  );
}
