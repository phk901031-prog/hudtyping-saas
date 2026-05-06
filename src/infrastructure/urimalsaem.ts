// src/infrastructure/urimalsaem.ts
// 우리말샘 Open API 어댑터 (④ Infrastructure).
// **서버 측에서만 호출**한다 (API 키가 노출되면 안 되므로 절대 클라이언트로 import 금지).
//
// Endpoint: https://opendict.korean.go.kr/api/search
// 파라미터: key, q, req_type=json
//
// 도메인 타입(Sense/DictItem/SearchResult)은 `@/features/search/types`에서 import.
// 이 파일은 외부 API → 도메인 타입 변환에만 책임 진다.

import type { DictItem, SearchResult } from "@/features/search/types";

// ── 우리말샘 원본 응답 타입 (snake_case) ─────────────────────────
interface RawResponse {
  channel?: {
    total: number;
    item?: Array<{
      word: string;
      sense?: Array<{
        definition: string;
        pos: string;
        cat: string;
        origin: string;
        link: string;
        sense_no: string;
      }>;
    }>;
  };
}

/**
 * 우리말샘 API에서 검색어를 조회한다.
 * - 결과 0건이면 items가 빈 배열.
 * - 네트워크 오류 또는 비-2xx 응답이면 throw.
 */
export async function searchUrimalsaem(query: string): Promise<SearchResult> {
  const apiKey = process.env.WOORI_KEY;
  if (!apiKey) {
    throw new Error("WOORI_KEY 환경변수가 없습니다.");
  }

  const url = new URL("https://opendict.korean.go.kr/api/search");
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("req_type", "json");

  // Next.js의 자체 fetch 캐시는 끔 — 우리는 Redis로 캐시를 명시적으로 관리한다.
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`우리말샘 API 응답 실패: ${res.status} ${res.statusText}`);
  }

  const raw = (await res.json()) as RawResponse;
  const channel = raw.channel;
  if (!channel) {
    return { query, total: 0, items: [] };
  }

  // snake_case → camelCase 정규화 + 누락 필드 안전 처리
  const items: DictItem[] = (channel.item ?? []).map((it) => ({
    word: it.word,
    senses: (it.sense ?? []).map((s) => ({
      definition: s.definition ?? "",
      pos: s.pos ?? "",
      cat: s.cat ?? "",
      origin: s.origin ?? "",
      link: s.link ?? "",
      senseNo: s.sense_no ?? "",
    })),
  }));

  return {
    query,
    total: typeof channel.total === "number" ? channel.total : items.length,
    items,
  };
}
