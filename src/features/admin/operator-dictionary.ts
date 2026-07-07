import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import { operatorDictionaryEntries } from "@/infrastructure/db/schema";
import type { OperatorNote } from "@/features/search/types";

export function normalizeOperatorMatchKey(value: string): string {
  return value.trim().toLowerCase().replace(/[\s^]+/g, "");
}

export async function listOperatorDictionaryEntries() {
  return db
    .select()
    .from(operatorDictionaryEntries)
    .orderBy(desc(operatorDictionaryEntries.updatedAt));
}

export async function findOperatorNotes(query: string): Promise<OperatorNote[]> {
  const matchKey = normalizeOperatorMatchKey(query);
  if (!matchKey) return [];

  const rows = await db
    .select({
      term: operatorDictionaryEntries.term,
      label: operatorDictionaryEntries.label,
      note: operatorDictionaryEntries.note,
    })
    .from(operatorDictionaryEntries)
    .where(
      and(
        eq(operatorDictionaryEntries.enabled, true),
        eq(operatorDictionaryEntries.matchKey, matchKey)
      )
    )
    .limit(5);

  return rows;
}

export async function upsertOperatorDictionaryEntry(input: {
  term: string;
  label: string;
  note: string;
  enabled: boolean;
  createdBy: string;
}) {
  const term = input.term.trim();
  const note = input.note.trim();
  const label = input.label.trim() || "운영자 등록 표기";
  const matchKey = normalizeOperatorMatchKey(term);

  if (!term || !matchKey || !note) {
    throw new Error("단어와 설명을 입력해주세요.");
  }

  await db
    .insert(operatorDictionaryEntries)
    .values({
      term,
      matchKey,
      label,
      note,
      enabled: input.enabled,
      createdBy: input.createdBy,
    })
    .onConflictDoUpdate({
      target: operatorDictionaryEntries.matchKey,
      set: {
        term,
        label,
        note,
        enabled: input.enabled,
        updatedAt: new Date(),
      },
    });
}

export async function deleteOperatorDictionaryEntry(id: number) {
  await db
    .delete(operatorDictionaryEntries)
    .where(eq(operatorDictionaryEntries.id, id));
}

export async function getOperatorDictionarySummary() {
  const [summary] = await db
    .select({
      total: sql<number>`COUNT(*)::int`,
      enabled: sql<number>`COALESCE(SUM(CASE WHEN ${operatorDictionaryEntries.enabled} THEN 1 ELSE 0 END), 0)::int`,
    })
    .from(operatorDictionaryEntries);

  return {
    total: Number(summary?.total ?? 0),
    enabled: Number(summary?.enabled ?? 0),
  };
}
