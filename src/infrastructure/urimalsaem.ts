// src/infrastructure/urimalsaem.ts
// Server-side client for the Urimalsaem Open API.

import type { DictItem, SearchResult } from "@/features/search/types";
import type {
  WordDetail,
  WordDetailSense,
} from "@/features/word-detail/types";

const URIMALSAEM_SEARCH_URL = "https://opendict.korean.go.kr/api/search";
const URIMALSAEM_VIEW_URL = "https://opendict.korean.go.kr/api/view";
const REQUEST_TIMEOUTS_MS = [2500, 3500] as const;

interface RawSearchResponse {
  channel?: {
    total: number;
    item?: Array<{
      target_code?: string | number;
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

// /api/view 응답 형태 — 실제 필드가 살짝 다를 수 있어 optional 로 방어적으로 파싱.
interface RawViewResponse {
  channel?: {
    item?: Array<{
      word_info?: {
        word?: string;
        sense_info?: Array<{
          sense_no?: string | number;
          definition?: string;
          pos?: string;
          cat?: string;
          example_info?: Array<{
            example?: string;
            source?: string;
          }>;
        }>;
      };
    }>;
  };
}

export class UrimalsaemUnavailableError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "UrimalsaemUnavailableError";
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function searchUrimalsaem(query: string): Promise<SearchResult> {
  const apiKey = requireApiKey();

  const url = new URL(URIMALSAEM_SEARCH_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("req_type", "json");

  return callWithRetry("search", query, url, (raw) =>
    normalizeSearchResponse(query, raw as RawSearchResponse)
  );
}

/**
 * 우리말샘 view API — 특정 단어의 상세(예문 포함) 조회.
 * search 결과에서 얻은 target_code로 호출.
 */
export async function viewUrimalsaem(targetCode: string): Promise<WordDetail> {
  const apiKey = requireApiKey();

  const url = new URL(URIMALSAEM_VIEW_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("method", "target_code");
  url.searchParams.set("q", targetCode);
  url.searchParams.set("req_type", "json");

  return callWithRetry("view", targetCode, url, (raw) =>
    normalizeViewResponse(targetCode, raw as RawViewResponse)
  );
}

function requireApiKey(): string {
  const apiKey = process.env.WOORI_KEY;
  if (!apiKey) {
    throw new Error("WOORI_KEY environment variable is missing.");
  }
  return apiKey;
}

async function callWithRetry<T>(
  op: "search" | "view",
  label: string,
  url: URL,
  normalize: (raw: unknown) => T
): Promise<T> {
  let lastError: unknown;
  for (const timeoutMs of REQUEST_TIMEOUTS_MS) {
    try {
      const res = await fetchWithTimeout(url.toString(), timeoutMs);
      if (!res.ok) {
        throw new Error(
          `Urimalsaem ${op} API responded with ${res.status} ${res.statusText}`
        );
      }
      const raw = await res.json();
      return normalize(raw);
    } catch (err) {
      lastError = err;
      console.warn(
        `[urimalsaem/${op}] attempt failed after ${timeoutMs}ms for "${label}":`,
        err
      );
    }
  }
  throw new UrimalsaemUnavailableError(
    `Urimalsaem ${op} API is unavailable or too slow.`,
    { cause: lastError }
  );
}

function normalizeSearchResponse(
  query: string,
  raw: RawSearchResponse
): SearchResult {
  const channel = raw.channel;
  if (!channel) {
    return { query, total: 0, items: [] };
  }

  const items: DictItem[] = (channel.item ?? []).map((it) => ({
    word: it.word,
    targetCode:
      it.target_code == null ? "" : String(it.target_code),
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

function normalizeViewResponse(
  targetCode: string,
  raw: RawViewResponse
): WordDetail {
  const wordInfo = raw.channel?.item?.[0]?.word_info;
  if (!wordInfo) {
    return { targetCode, word: "", senses: [] };
  }

  const senses: WordDetailSense[] = (wordInfo.sense_info ?? []).map((s) => ({
    senseNo: s.sense_no == null ? "" : String(s.sense_no),
    definition: s.definition ?? "",
    pos: s.pos ?? "",
    cat: s.cat ?? "",
    examples: (s.example_info ?? [])
      .map((ex) => ({
        text: (ex.example ?? "").trim(),
        source: ex.source?.trim() || undefined,
      }))
      .filter((ex) => ex.text.length > 0),
  }));

  return {
    targetCode,
    word: wordInfo.word ?? "",
    senses,
  };
}
