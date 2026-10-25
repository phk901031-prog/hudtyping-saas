// src/features/updates/releases.ts
// 릴리스 노트를 홈페이지에서 보여주기 위한 도메인 어댑터 (② Application).
//
// - 원본 저장소 접근은 infrastructure/release-assets.ts 에 위임 (계정명 비노출, 토큰 처리)
// - 릴리스 노트는 markdown 이지만 별도 라이브러리 없이 lightweight 렌더러로 표시.
// - 원본 저장소 링크(htmlUrl)는 계정명 노출 때문에 내려주지 않는다.

import { listReleases } from "@/infrastructure/release-assets";

export interface ReleaseInfo {
  tag: string; // e.g. "v0.2.26"
  title: string; // release title
  bodyMarkdown: string; // raw markdown body
  publishedAt: string; // ISO
  isLatest: boolean;
}

export async function fetchReleases(): Promise<ReleaseInfo[]> {
  const raw = await listReleases(20);

  return raw
    .filter((r): r is typeof r & { tag_name: string } => {
      return !!r.tag_name && !r.draft;
    })
    .map((r, idx) => ({
      tag: r.tag_name,
      title: r.name?.trim() || r.tag_name,
      bodyMarkdown: r.body ?? "",
      publishedAt: r.published_at ?? "",
      isLatest: idx === 0,
    }));
}
