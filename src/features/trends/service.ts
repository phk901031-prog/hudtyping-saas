// src/features/trends/service.ts
// 공개용 인기 검색어 집계 (② Application).
//
// 노이즈 필터링:
//   - search_logs 를 dictionary_cache 와 INNER JOIN → 우리말샘에서 실제 뜻이 있는
//     단어만 통과. total = 0 결과(잘못 잡힌 인명·오타·잘못된 어절)는 자연 배제.
//   - query 길이 2자 이상만 (한 글자 노이즈 제외)
//   - status='success' 인 로그만
//
// 개인정보:
//   - clerkId 는 절대 노출하지 않음. 오직 query · count 만.
//   - 특정 사용자가 반복해서 검색한 것도 count 로 aggregate.

import { sql, and, gte } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { searchLogs, dictionaryCache } from "@/infrastructure/db/schema";

export interface TrendRow {
  query: string;
  count: number;
}

export interface TrendWindow {
  label: string;
  rows: TrendRow[];
  since: Date;
}

/** 지정 일수 이내의 인기 검색어 top N. 우리말샘에 실제 결과가 있는 것만. */
export async function fetchTrendTop(input: {
  days: number;
  limit: number;
}): Promise<TrendRow[]> {
  const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

  const rows = await db
    .select({
      query: searchLogs.query,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .innerJoin(dictionaryCache, sql`${dictionaryCache.query} = ${searchLogs.query}`)
    .where(
      and(
        gte(searchLogs.createdAt, since),
        // 우리말샘이 실제로 결과를 준 단어만 (인지명·오타·잘못 잡힌 어절 제외)
        sql`(${dictionaryCache.result}->>'total')::int > 0`,
        // 최소 2자 이상
        sql`char_length(${searchLogs.query}) >= 2`
      )
    )
    .groupBy(searchLogs.query)
    .orderBy(sql`COUNT(*) DESC`)
    .limit(input.limit);

  return rows.map((r) => ({ query: r.query, count: r.count }));
}

/** 홈페이지·트렌드 페이지에서 공통으로 쓰는 두 창(이번 주 · 이번 달). */
export async function fetchTrendWindows(): Promise<{
  weekly: TrendWindow;
  monthly: TrendWindow;
}> {
  const [weeklyRows, monthlyRows] = await Promise.all([
    fetchTrendTop({ days: 7, limit: 30 }),
    fetchTrendTop({ days: 30, limit: 30 }),
  ]);

  return {
    weekly: {
      label: "지난 7일",
      rows: weeklyRows,
      since: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    monthly: {
      label: "지난 30일",
      rows: monthlyRows,
      since: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  };
}
