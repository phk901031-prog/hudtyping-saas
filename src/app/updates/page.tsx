// src/app/updates/page.tsx
// 업데이트 로그 — GitHub Releases 를 홈페이지 톤으로 미러링.

import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { fetchReleases, type ReleaseInfo } from "@/features/updates/releases";
import { ReleaseNotes } from "@/components/release-notes";

export const metadata: Metadata = {
  title: "업데이트 로그 — HUDTyping",
  description: "HUDTyping Windows 앱의 버전별 변경 사항.",
};

// Vercel 서버에서 1시간 캐시. 새 릴리스 배포 1시간 안에 반영.
export const revalidate = 3600;

export default async function UpdatesPage() {
  const releases = await fetchReleases();

  return (
    <main className="flex-1 bg-background text-foreground">
      <div className="mx-auto w-full max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-foreground"
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
          메인으로
        </Link>

        <header className="mt-6 flex flex-col gap-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
            Updates
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            업데이트 로그
          </h1>
          <p className="max-w-2xl text-base leading-7 text-muted">
            HUDTyping Windows 앱의 버전별 변경 사항입니다. 앱은 자동 업데이트를 지원하며,
            새 버전이 적용되면 앱 상단 배너로도 안내됩니다.
          </p>
        </header>

        {releases.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted">
            지금은 표시할 릴리스가 없습니다. 잠시 후 다시 확인해주세요.
          </p>
        ) : (
          <ol className="mt-10 flex flex-col gap-6">
            {releases.map((release) => (
              <ReleaseItem key={release.tag} release={release} />
            ))}
          </ol>
        )}
      </div>
    </main>
  );
}

function ReleaseItem({ release }: { release: ReleaseInfo }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2">
          <h2 className="font-display text-xl leading-tight">{release.title}</h2>
          {release.isLatest && (
            <span className="rounded-full bg-accent/12 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
              Latest
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-muted">
          {formatReleaseDate(release.publishedAt)}
        </span>
      </div>

      <ReleaseNotes markdown={release.bodyMarkdown} />

      <div className="mt-5 border-t border-border pt-4">
        <a
          href={release.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted transition hover:text-foreground"
        >
          GitHub 에서 보기
          <ExternalLink size={12} strokeWidth={2.4} />
        </a>
      </div>
    </li>
  );
}

function formatReleaseDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
