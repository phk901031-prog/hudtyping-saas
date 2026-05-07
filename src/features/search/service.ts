// src/features/search/service.ts
// Search 도메인의 비즈니스 흐름 — 검색 자체에만 집중 (② Application).
//
// 다른 책임은 별도 파일:
//   - 로깅: ./logger.ts
//   - 통계 집계: ./stats.ts

import { redis } from "@/infrastructure/redis";
import { searchUrimalsaem } from "@/infrastructure/urimalsaem";
import type { SearchResult, SearchResultWithCacheMeta } from "./types";

// 캐시 TTL: 7일 (사전 데이터는 거의 안 바뀌므로 길게 두어도 안전)
const CACHE_TTL_SECONDS = 60 * 60 * 24 * 7;

/**
 * 한 번의 단어 검색 흐름:
 *   1) Redis 캐시 조회 → HIT면 즉시 반환 (~5ms)
 *   2) MISS면 우리말샘 호출 (~250ms)
 *   3) 결과를 Redis에 저장 (TTL 7일, 0건 결과도 캐시)
 *
 * 외부 호출 실패는 throw — 호출자가 catch해서 HTTP 응답으로 매핑.
 */
export async function searchWord(
  query: string
): Promise<SearchResultWithCacheMeta> {
  const cacheKey = `search:${query}`;

  const cached = await redis.get<SearchResult>(cacheKey);
  if (cached) {
    return { ...cached, cache: "hit" };
  }

  const result = await searchUrimalsaem(query);
  await redis.set(cacheKey, result, { ex: CACHE_TTL_SECONDS });

  return { ...result, cache: "miss" };
}
