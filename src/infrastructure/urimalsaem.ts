// src/infrastructure/urimalsaem.ts
// Server-side client for the Urimalsaem Open API.

import "server-only";
import type { DictItem, SearchResult } from "@/features/search/types";
import type {
  WordDetail,
  WordDetailSense,
} from "@/features/word-detail/types";

const URIMALSAEM_SEARCH_URL = "https://opendict.korean.go.kr/api/search";
const URIMALSAEM_VIEW_URL = "https://opendict.korean.go.kr/api/view";
// 3회 재시도. 짧은 첫 시도 → 중간 → 마지막은 넉넉히.
// 총합 ≤ 11s (HUD fetch abort 12s 안쪽으로 유지).
const REQUEST_TIMEOUTS_MS = [2500, 3500, 5000] as const;

interface RawSearchResponse {
  channel?: {
    total: number;
    item?: Array<{
      word: string;
      // target_code는 sense 안에 있음(뜻풀이별로 다름). item 레벨엔 없음.
      sense?: Array<{
        definition: string;
        pos: string;
        cat: string;
        origin: string;
        link: string;
        sense_no: string;
        target_code?: string | number;
      }>;
    }>;
  };
}

// /api/view?method=target_code 응답 형태.
// - channel.item 은 **object** (search와 달리 array 아님)
// - wordInfo / senseInfo 는 camelCase, senseInfo 는 **object 1개** (target_code당 뜻풀이 1개)
// - example_info[].example 원문에 "{단어}" 중괄호 마커가 붙어 있어 화면 표시 시 그대로 보임.
interface RawViewResponse {
  channel?: {
    item?: {
      wordInfo?: {
        word?: string;
      };
      senseInfo?: {
        sense_no?: string | number;
        definition?: string;
        pos?: string;
        cat?: string;
        example_info?: Array<{
          example?: string;
          source?: string;
        }>;
      };
      target_code?: string | number;
    };
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
    senses: (it.sense ?? []).map((s) => ({
      definition: s.definition ?? "",
      pos: s.pos ?? "",
      cat: s.cat ?? "",
      origin: s.origin ?? "",
      link: s.link ?? "",
      senseNo: s.sense_no ?? "",
      targetCode: s.target_code == null ? "" : String(s.target_code),
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
  const item = raw.channel?.item;
  if (!item) {
    return { targetCode, word: "", senses: [], found: false };
  }

  const word = item.wordInfo?.word ?? "";
  const s = item.senseInfo;

  if (!s) {
    return { targetCode, word, senses: [], found: false };
  }

  const sense: WordDetailSense = {
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
  };

  return {
    targetCode,
    word,
    senses: [sense],
    // 외부 응답이 일부만 내려온 경우도 정상 상세로 캐시하지 않는다.
    found: Boolean(word && (sense.definition || sense.examples.length > 0)),
  };
}
