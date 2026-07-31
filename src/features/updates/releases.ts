// src/features/updates/releases.ts
// GitHub Releases 를 홈페이지에서 보여주기 위한 도메인 어댑터 (② Application).
//
// - 인증 없는 public API 사용 (레포가 public 이므로)
// - Vercel 서버 캐시 (revalidate) 1시간 → 시간당 최대 1회 호출로 rate limit 여유
// - 릴리스 노트는 markdown 이지만 별도 라이브러리 없이 lightweight 렌더러로 표시.

const GITHUB_RELEASES_API =
  "https://api.github.com/repos/phk901031-prog/hudtyping-saas/releases?per_page=20";

export interface ReleaseInfo {
  tag: string; // e.g. "v0.2.26"
  title: string; // release title
  bodyMarkdown: string; // raw markdown body
  publishedAt: string; // ISO
  htmlUrl: string; // permalink
  isLatest: boolean;
}

interface RawRelease {
  tag_name?: string;
  name?: string | null;
  body?: string | null;
  published_at?: string | null;
  html_url?: string | null;
  draft?: boolean;
  prerelease?: boolean;
}

export async function fetchReleases(): Promise<ReleaseInfo[]> {
  const res = await fetch(GITHUB_RELEASES_API, {
    // Vercel 서버 캐시 1시간 (revalidate). 로컬 캐시도 자동으로 활용.
    next: { revalidate: 3600 },
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!res.ok) {
    console.error("[updates] GitHub Releases fetch 실패:", res.status);
    return [];
  }

  const raw = (await res.json()) as RawRelease[];

  return raw
    .filter((r): r is RawRelease & { tag_name: string } => {
      return !!r.tag_name && !r.draft;
    })
    .map((r, idx) => ({
      tag: r.tag_name,
      title: r.name?.trim() || r.tag_name,
      bodyMarkdown: r.body ?? "",
      publishedAt: r.published_at ?? "",
      htmlUrl:
        r.html_url ??
        `https://github.com/phk901031-prog/hudtyping-saas/releases/tag/${encodeURIComponent(
          r.tag_name
        )}`,
      isLatest: idx === 0,
    }));
}
