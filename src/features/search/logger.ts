import { db } from "@/infrastructure/db";
import { searchLogs } from "@/infrastructure/db/schema";

export type SearchLogStatus = "success" | "failed";

export async function logSearchAttempt(input: {
  clerkId: string;
  query: string;
  cacheHit?: boolean;
  status: SearchLogStatus;
  errorCode?: string | null;
  responseMs?: number | null;
  appVersion?: string | null;
}): Promise<void> {
  try {
    await db.insert(searchLogs).values({
      clerkId: input.clerkId,
      query: input.query,
      cacheHit: input.cacheHit ?? false,
      status: input.status,
      errorCode: input.errorCode ?? null,
      responseMs: input.responseMs ?? null,
      appVersion: input.appVersion ?? null,
    });
  } catch (err) {
    console.error("[search/logSearchAttempt] failed:", err);
  }
}
