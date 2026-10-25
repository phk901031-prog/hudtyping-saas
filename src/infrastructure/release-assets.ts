// src/infrastructure/release-assets.ts
// 설치 파일·자동 업데이트 파일 원본 저장소(현재 GitHub Releases) 접근 — 서버 전용.
//
// - 원본 저장소 주소에는 GitHub 계정명이 들어 있어서 브라우저·앱에 절대 노출하지 않는다.
//   사용자·앱은 playsteno.com 주소만 보고, 서버가 GitHub API 로 파일을 찾아
//   서명된 임시 다운로드 주소로 넘겨준다.
// - 저장소를 private 으로 돌려도 동작하도록 GITHUB_TOKEN(읽기 전용 토큰)을 쓴다.
//   (토큰이 없으면 public 저장소에서만 동작)
// - 나중에 Cloudflare(R2 등)로 옮길 때는 이 파일만 바꾸면 된다.

import "server-only";

const GITHUB_REPO = "phk901031-prog/hudtyping-saas";
const GITHUB_API = `https://api.github.com/repos/${GITHUB_REPO}`;

// GitHub API 공통 헤더 (토큰이 있으면 private 저장소 접근 + 호출 한도 5000/시간)
function githubHeaders(accept = "application/vnd.github+json"): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: accept,
    "X-GitHub-Api-Version": "2022-11-28",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export interface RawRelease {
  tag_name?: string;
  name?: string | null;
  body?: string | null;
  published_at?: string | null;
  draft?: boolean;
  prerelease?: boolean;
  assets?: Array<{ id: number; name: string }>;
}

/** 최근 릴리스 목록 (업데이트 로그용). 실패하면 빈 배열. */
export async function listReleases(perPage = 20): Promise<RawRelease[]> {
  try {
    const res = await fetch(`${GITHUB_API}/releases?per_page=${perPage}`, {
      // Vercel 서버 캐시 1시간 → 시간당 최대 1회 호출
      next: { revalidate: 3600 },
      headers: githubHeaders(),
    });
    if (!res.ok) {
      console.error("[release-assets] 릴리스 목록 실패:", res.status);
      return [];
    }
    return (await res.json()) as RawRelease[];
  } catch (err) {
    console.error("[release-assets] 릴리스 목록 오류:", err);
    return [];
  }
}

/** 태그로 릴리스 하나 조회 ("latest" 면 최신 릴리스). 5분 캐시. */
async function getRelease(tag: string | "latest"): Promise<RawRelease | null> {
  const path = tag === "latest" ? "latest" : `tags/${encodeURIComponent(tag)}`;
  const res = await fetch(`${GITHUB_API}/releases/${path}`, {
    next: { revalidate: 300 },
    headers: githubHeaders(),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) {
    console.error("[release-assets] 릴리스 조회 실패:", tag, res.status);
    return null;
  }
  return (await res.json()) as RawRelease;
}

/**
 * 릴리스 첨부파일의 서명된 임시 다운로드 주소(약 1시간 유효)를 얻는다.
 * 이 주소엔 계정명이 없다. 실패하면 null.
 */
export async function resolveAssetDownloadUrl(
  tag: string | "latest",
  fileName: string
): Promise<string | null> {
  try {
    const release = await getRelease(tag);
    const asset = release?.assets?.find((a) => a.name === fileName);
    if (!asset) return null;

    // octet-stream 으로 요청하면 GitHub 이 실제 파일 주소로 302 를 준다 → Location 만 읽음
    const res = await fetch(`${GITHUB_API}/releases/assets/${asset.id}`, {
      method: "HEAD",
      redirect: "manual",
      cache: "no-store", // 서명 URL 은 만료되므로 매번 새로 받는다
      headers: githubHeaders("application/octet-stream"),
      signal: AbortSignal.timeout(5000),
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) return location;
    console.error("[release-assets] 파일 주소 응답 이상:", fileName, res.status);
    return null;
  } catch (err) {
    console.error("[release-assets] 파일 주소 확인 실패:", fileName, err);
    return null;
  }
}

/** 첨부파일을 텍스트로 직접 읽는다 (latest.yml 처럼 작은 파일용). 실패하면 null. */
export async function readAssetText(
  tag: string | "latest",
  fileName: string
): Promise<string | null> {
  const url = await resolveAssetDownloadUrl(tag, fileName);
  if (!url) return null;
  try {
    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    return res.ok ? await res.text() : null;
  } catch (err) {
    console.error("[release-assets] 파일 읽기 실패:", fileName, err);
    return null;
  }
}
