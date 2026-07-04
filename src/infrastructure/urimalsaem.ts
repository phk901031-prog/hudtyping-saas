// src/infrastructure/urimalsaem.ts
// Server-side client for the Urimalsaem Open API.

import type { DictItem, SearchResult } from "@/features/search/types";

const URIMALSAEM_SEARCH_URL = "https://opendict.korean.go.kr/api/search";
const REQUEST_TIMEOUTS_MS = [2500, 3500] as const;

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
  const apiKey = process.env.WOORI_KEY;
  if (!apiKey) {
    throw new Error("WOORI_KEY environment variable is missing.");
  }

  const url = new URL(URIMALSAEM_SEARCH_URL);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("q", query);
  url.searchParams.set("req_type", "json");

  let lastError: unknown;
  for (const timeoutMs of REQUEST_TIMEOUTS_MS) {
    try {
      const res = await fetchWithTimeout(url.toString(), timeoutMs);
      if (!res.ok) {
        throw new Error(
          `Urimalsaem API responded with ${res.status} ${res.statusText}`
        );
      }

      const raw = (await res.json()) as RawResponse;
      return normalizeResponse(query, raw);
    } catch (err) {
      lastError = err;
      console.warn(
        `[urimalsaem] attempt failed after ${timeoutMs}ms for "${query}":`,
        err
      );
    }
  }

  throw new UrimalsaemUnavailableError(
    "Urimalsaem API is unavailable or too slow.",
    { cause: lastError }
  );
}

function normalizeResponse(query: string, raw: RawResponse): SearchResult {
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
    })),
  }));

  return {
    query,
    total: typeof channel.total === "number" ? channel.total : items.length,
    items,
  };
}
