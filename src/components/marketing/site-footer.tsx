import Link from "next/link";
import { OPENCHAT } from "@/config/community";

const FOOTER_LINKS = [
  { href: "/work-steno", label: "WORK STENO" },
  { href: "/download/windows", label: "Windows 다운로드" },
  { href: "/help", label: "사용 가이드" },
  { href: "/updates", label: "업데이트 로그" },
  { href: "/install-help", label: "설치 도움말" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보 처리방침" },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-5 py-10 sm:px-8">
        <div>
          <p className="text-base font-black tracking-[-0.025em]">
            PLAYSTENO<span className="text-accent">.</span>
          </p>
          <p className="ko-copy mt-2 text-xs leading-5 text-muted">
            속기사의 기록 작업을 돕는 작은 도구를 만듭니다.
          </p>
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs">
          {FOOTER_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a href={OPENCHAT.url} target="_blank" rel="noopener noreferrer" className="text-muted transition hover:text-foreground">
            공지·문의 채널
          </a>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted">© PlaySteno</p>
      </div>
    </footer>
  );
}
