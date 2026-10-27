"use client";

import { useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { ConnectionGuideVideo } from "@/components/guides/connection-guide-video";

interface ConnectionCodeResponse {
  code: string;
  expiresAt: string;
  error?: string;
}

export default function ApiKeysPage() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreateCode() {
    setLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch("/api/desktop/connections", { method: "POST" });
      const data = (await res.json()) as ConnectionCodeResponse;
      if (!res.ok) throw new Error(data.error || `연결 코드 발급 실패 (${res.status})`);
      setCode(data.code);
      setExpiresAt(data.expiresAt);
    } catch (err) {
      setError(err instanceof Error ? err.message : "연결 코드를 발급하지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 py-8">
      <header className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-muted hover:underline">
          ← 대시보드
        </Link>
        <UserButton />
      </header>

      <section className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm font-bold text-accent">처음 한 번만 연결하세요</p>
        <h1 className="mt-2 text-2xl font-bold">낱말지기 프로그램 연결</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          이메일 주소나 비밀번호를 프로그램에 입력하지 않습니다. 승인된 계정으로 연결 코드를 발급한 뒤,
          낱말지기 프로그램의 <strong className="text-foreground">계정 연결</strong> 칸에 그 코드를 입력하세요.
          연결 코드는 10분 동안 한 번만 사용할 수 있습니다.
        </p>

        <ol className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <ConnectionStep number="1" text="아래 버튼으로 코드 발급" />
          <ConnectionStep number="2" text="표시된 코드 복사" />
          <ConnectionStep number="3" text="앱 설정에 붙여넣고 연결" />
        </ol>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleCreateCode}
            disabled={loading}
            className="rounded-lg bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "발급 중" : "연결 코드 발급"}
          </button>
          <Link
            href="/help"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
          >
            사용 가이드 보기
          </Link>
        </div>
      </section>

      {code && (
        <section className="rounded-lg border border-accent/30 bg-accent-soft p-6 text-ink">
          <p className="text-sm font-bold text-accent">연결 코드</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="rounded-lg border border-accent/20 bg-white px-4 py-3 font-mono text-2xl font-bold tracking-[0.08em] text-ink">
              {code}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-white/10 bg-ink px-4 py-3 text-sm font-bold text-white transition hover:opacity-90"
            >
              {copied ? "복사됨" : "복사"}
            </button>
          </div>
          {expiresAt && (
            <p className="mt-3 text-sm text-muted">
              만료 시각: {new Date(expiresAt).toLocaleString("ko-KR")}
            </p>
          )}
        </section>
      )}

      {error && (
        <p className="rounded-lg border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="mb-5">
          <p className="text-sm font-bold text-accent">화면을 보며 따라 하기</p>
          <h2 className="mt-2 text-xl font-bold">영상 21초부터 코드 입력 위치를 확인하세요</h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            발급 버튼 위치, 낱말지기 설정 화면과 연결 완료 상태를 실제 화면으로 보여드립니다.
          </p>
        </div>
        <ConnectionGuideVideo compact />
      </section>
    </main>
  );
}

function ConnectionStep({ number, text }: { number: string; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-lg border border-border bg-muted-bg px-3 py-3">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background">
        {number}
      </span>
      <span className="font-medium text-foreground">{text}</span>
    </li>
  );
}
