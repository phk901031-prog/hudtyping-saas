// src/app/(dashboard)/api-keys/page.tsx
// 사용자가 자기 API 키를 발급/조회/삭제하는 페이지.
// 클라이언트 컴포넌트 — 키 발급 응답에서 평문을 받아 즉시 보여주려면 인터랙티브해야 함.

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

// 키 목록 항목 (평문/해시 제외)
interface KeyListItem {
  id: number;
  name: string;
  prefix: string;
  lastUsedAt: string | null;
  createdAt: string;
}

// 발급 직후 응답 — plain이 1회만 포함됨
interface IssuedKey extends KeyListItem {
  plain: string;
  message: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<KeyListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 새 키 발급 폼
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  // 방금 발급된 키 (평문 1회 노출)
  const [justIssued, setJustIssued] = useState<IssuedKey | null>(null);

  // 키 목록 로드
  async function loadKeys() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error(`목록 조회 실패 (${res.status})`);
      const data = (await res.json()) as { keys: KeyListItem[] };
      setKeys(data.keys);
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, []);

  // 새 키 발급
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `발급 실패 (${res.status})`);
      setJustIssued(data as IssuedKey);
      setNewName("");
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    } finally {
      setCreating(false);
    }
  }

  // 키 삭제
  async function handleDelete(id: number) {
    if (!confirm("이 키를 삭제할까요? 이 키를 쓰는 디바이스는 즉시 인증 실패합니다.")) {
      return;
    }
    try {
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        throw new Error(`삭제 실패 (${res.status})`);
      }
      await loadKeys();
    } catch (e) {
      setError(e instanceof Error ? e.message : "알 수 없는 오류");
    }
  }

  return (
    <main className="flex flex-1 flex-col px-6 py-8 gap-6 max-w-3xl w-full mx-auto">
      <header className="flex items-center justify-between">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:underline">
          ← 대시보드
        </Link>
        <UserButton />
      </header>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">API 키</h1>
        <p className="text-sm text-zinc-500 leading-relaxed">
          로컬 HUD 앱에서 검색을 사용하려면 여기서 발급한 키가 필요해요.
          <br />
          <strong>계정당 1개만 발급 가능</strong>해요. 키를 잃어버렸으면 기존 키를 삭제 후 새로 발급받으세요.
        </p>
      </div>

      {/* 발급 직후 평문 노출 영역 */}
      {justIssued && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 dark:bg-amber-950/20 p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🔑</span>
            <strong>“{justIssued.name}” 키 발급 완료</strong>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-300">
            ⚠️ 아래 키는 <strong>지금 한 번만</strong> 보여드려요. 다시 볼 수 없으니
            안전한 곳(비밀번호 관리자, 로컬 HUD 설정 등)에 즉시 복사해주세요.
          </p>
          <div className="flex gap-2">
            <code className="flex-1 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-2 text-sm font-mono break-all">
              {justIssued.plain}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(justIssued.plain)}
              className="rounded bg-foreground text-background px-4 text-sm hover:opacity-90 transition shrink-0"
            >
              복사
            </button>
          </div>
          <button
            type="button"
            onClick={() => setJustIssued(null)}
            className="self-end text-sm text-zinc-600 hover:underline"
          >
            확인 (이 메시지 닫기)
          </button>
        </div>
      )}

      {/* 새 키 발급 폼 — 키가 0개일 때만 표시 (1개 제한) */}
      {!loading && keys.length === 0 && (
        <form
          onSubmit={handleCreate}
          className="flex gap-2 items-end border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4"
        >
          <div className="flex-1 flex flex-col gap-1.5">
            <label htmlFor="new-key-name" className="text-sm font-medium">
              새 키 이름
            </label>
            <input
              id="new-key-name"
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="예: 내 노트북"
              maxLength={50}
              className="rounded-full border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm outline-none focus:border-zinc-500"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
          >
            {creating ? "발급 중…" : "발급"}
          </button>
        </form>
      )}

      {/* 키가 이미 있을 때 안내 */}
      {!loading && keys.length > 0 && !justIssued && (
        <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm text-zinc-500">
          이미 발급된 키가 있어요. 재발급하려면 아래 목록의 키를 삭제 후 다시 발급하세요.
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {/* 키 목록 */}
      <section className="flex flex-col gap-3">
        <h2 className="text-base font-semibold">발급된 키</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">불러오는 중…</p>
        ) : keys.length === 0 ? (
          <p className="text-sm text-zinc-500">아직 발급한 키가 없어요.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {keys.map((key) => (
              <li
                key={key.id}
                className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex items-center justify-between gap-3"
              >
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="font-medium">{key.name}</span>
                  <code className="text-xs text-zinc-500 font-mono truncate">
                    {key.prefix}…
                  </code>
                  <span className="text-xs text-zinc-500">
                    {key.lastUsedAt
                      ? `최근 사용: ${formatDate(key.lastUsedAt)}`
                      : "아직 사용 기록 없음"}
                    {" · "}
                    생성: {formatDate(key.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(key.id)}
                  className="text-sm text-red-600 hover:underline shrink-0"
                >
                  삭제
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
