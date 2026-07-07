import { desc, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { searchLogs } from "@/infrastructure/db/schema";
import { searchWord } from "@/features/search/service";

export async function prewarmPopularSearches(limit = 50) {
  const safeLimit = Math.max(1, Math.min(100, Math.floor(limit)));

  const popular = await db
    .select({
      query: searchLogs.query,
      cnt: sql<number>`COUNT(*)::int`,
    })
    .from(searchLogs)
    .where(sql`${searchLogs.status} = 'success'`)
    .groupBy(searchLogs.query)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(safeLimit);

  const result = {
    requested: popular.length,
    warmed: 0,
    failed: 0,
    failures: [] as Array<{ query: string; error: string }>,
  };

  for (const row of popular) {
    try {
      await searchWord(row.query);
      result.warmed += 1;
    } catch (err) {
      result.failed += 1;
      result.failures.push({
        query: row.query,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return result;
}
