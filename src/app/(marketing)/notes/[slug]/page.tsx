// src/app/(marketing)/notes/[slug]/page.tsx
// 표기 노트 본문 — generateStaticParams 로 빌드 시 정적 생성 (DB 호출 없음).

import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { NOTES, getNote } from "@/features/notes/notes";

export const dynamicParams = false;

export function generateStaticParams() {
  return NOTES.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const note = getNote((await params).slug);
  if (!note) return {};
  return {
    title: `${note.title} — 표기 노트`,
    description: note.summary,
    alternates: { canonical: `/notes/${note.slug}` },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const note = getNote((await params).slug);
  if (!note) notFound();

  // 다음에 읽을 노트 (목록 순환)
  const idx = NOTES.indexOf(note);
  const next = NOTES[(idx + 1) % NOTES.length];

  return (
    <main className="mx-auto w-full max-w-4xl px-5 pb-24 pt-14 sm:px-8 sm:pt-20">
      <Link href="/notes" className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        ← 표기 노트
      </Link>
      <h1 className="ko-heading mt-5 max-w-3xl text-3xl font-black leading-tight tracking-[-0.03em] sm:text-[2.6rem]">
        {note.title}
      </h1>
      <p className="ko-copy mt-5 max-w-2xl text-lg leading-8 text-foreground/90">{note.summary}</p>
      {note.basis && <p className="mt-4 font-mono text-xs text-muted">근거 · {note.basis}</p>}

      <div className="mt-12 max-w-2xl space-y-12">
        {note.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="ko-heading text-xl font-bold">{section.heading}</h2>
            {section.body.map((p, i) => (
              <p key={i} className="ko-copy mt-3 text-[15px] leading-7 text-muted">{p}</p>
            ))}
            {section.examples && (
              <ul className="mt-5 divide-y divide-border border-y border-border">
                {section.examples.map((ex) => (
                  <li key={ex.right} className="grid gap-1.5 py-4 sm:grid-cols-2 sm:gap-6">
                    <p className="text-[15px] leading-7 text-muted line-through decoration-danger/60">{ex.wrong}</p>
                    <p className="text-[15px] font-bold leading-7">{ex.right}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <div className="mt-16 max-w-2xl border-t border-border pt-8">
        <p className="ko-copy text-sm leading-6 text-muted">
          표기가 헷갈릴 때마다 사전을 열기 번거롭다면, 낱말지기로 문서 안에서 바로 확인할 수 있습니다.{" "}
          <Link href="/#try" className="font-bold text-accent underline underline-offset-4">체험해 보기</Link>
        </p>
        {next.slug !== note.slug && (
          <Link href={`/notes/${next.slug}`} className="group mt-8 block">
            <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">다음 노트</span>
            <span className="ko-heading mt-1 block text-lg font-bold transition group-hover:text-accent">
              {next.title} →
            </span>
          </Link>
        )}
      </div>
    </main>
  );
}
