// src/app/(marketing)/notes/page.tsx
// 표기 노트 목록 — 정적 생성 (DB 호출 없음).

import Link from "next/link";
import type { Metadata } from "next";
import { NOTES } from "@/features/notes/notes";

export const metadata: Metadata = {
  title: "표기 노트 — 낱말지기",
  description: "속기·회의록 작성 중 자주 헷갈리는 맞춤법과 띄어쓰기를 짧게 정리했습니다.",
  alternates: { canonical: "/notes" },
};

export default function NotesPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">표기 노트</p>
      <h1 className="ko-heading mt-4 text-3xl font-black tracking-[-0.03em] sm:text-5xl">
        받아 적을 때 자주 헷갈리는 표기
      </h1>
      <p className="ko-copy mt-5 max-w-2xl text-[15px] leading-7 text-muted">
        발언을 빠르게 옮기다 보면 소리만 듣고 쓰기 쉬운 자리가 있습니다. 한 번에 구별하는 방법만 짧게 정리합니다.
      </p>

      <ol className="mt-12 divide-y divide-border border-y border-border">
        {NOTES.map((note) => (
          <li key={note.slug}>
            <Link href={`/notes/${note.slug}`} className="group grid gap-2 py-7 sm:grid-cols-[1fr_auto] sm:gap-8">
              <div>
                <h2 className="ko-heading text-xl font-bold transition group-hover:text-accent">{note.title}</h2>
                <p className="ko-copy mt-2 text-[15px] leading-7 text-muted">{note.summary}</p>
              </div>
              {note.basis && (
                <span className="font-mono text-[11px] text-muted sm:mt-1.5 sm:whitespace-nowrap">{note.basis}</span>
              )}
            </Link>
          </li>
        ))}
      </ol>
    </main>
  );
}
