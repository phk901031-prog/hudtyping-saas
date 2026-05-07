// src/features/search/logger.ts
// 검색 기록을 search_logs 테이블에 INSERT.
// 실패해도 사용자 응답에 영향 주면 안 되므로 try/catch로 격리.
// 호출자는 보통 `after(() => logSearch(...))`로 백그라운드 실행.

import { db } from "@/infrastructure/db";
import { searchLogs } from "@/infrastructure/db/schema";

export async function logSearch(
  clerkId: string,
  query: string,
  cacheHit: boolean
): Promise<void> {
  try {
    await db.insert(searchLogs).values({ clerkId, query, cacheHit });
  } catch (err) {
    console.error("[search/logSearch] 기록 실패:", err);
  }
}
