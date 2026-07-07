import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { listOperatorDictionaryEntries } from "@/features/admin/operator-dictionary";

export default async function OperatorDictionaryPage() {
  const entries = await listOperatorDictionaryEntries();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link href="/admin" className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          관리자 홈
        </Link>
        <UserButton />
      </header>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-sm font-semibold text-accent">운영자 표기 사전</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          우리말샘에 없어도 보여줄 업무 기준을 등록합니다.
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
          공백과 ^ 표시는 무시하고 매칭합니다. 예를 들어 학교 폭력, 학교^폭력, 학교폭력은 같은 등록어로 처리됩니다.
        </p>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-base font-bold">새 기준 등록</h2>
        <form action="/api/admin/operator-dictionary" method="post" className="mt-4 grid gap-3">
          <input type="hidden" name="action" value="save" />
          <label className="grid gap-1 text-sm font-semibold">
            등록어
            <input name="term" placeholder="예: 보호자확인서" className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 font-normal dark:border-zinc-700" required />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            표시 라벨
            <input name="label" defaultValue="운영자 등록 표기" className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 font-normal dark:border-zinc-700" />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            설명
            <textarea name="note" placeholder="예: 문서명이므로 붙여 씁니다." rows={3} className="rounded-lg border border-zinc-300 bg-transparent px-3 py-2 font-normal dark:border-zinc-700" required />
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="enabled" defaultChecked />
            바로 사용
          </label>
          <button className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-bold text-white dark:bg-zinc-100 dark:text-zinc-950">
            등록
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">등록된 기준</h2>
          <span className="text-xs text-zinc-500">{entries.length.toLocaleString()}개</span>
        </div>
        {entries.length === 0 ? (
          <p className="py-8 text-center text-sm text-zinc-500">아직 등록된 기준이 없습니다.</p>
        ) : (
          <ul className="mt-4 divide-y divide-zinc-100 dark:divide-zinc-900">
            {entries.map((entry) => (
              <li key={entry.id} className="grid gap-3 py-4 sm:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold">{entry.term}</p>
                    <span className={entry.enabled ? "rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-bold text-zinc-500 dark:bg-zinc-900"}>
                      {entry.enabled ? "사용 중" : "꺼짐"}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500 dark:bg-zinc-900">
                      {entry.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">{entry.note}</p>
                  <p className="mt-1 text-xs text-zinc-400">match: {entry.matchKey}</p>
                </div>
                <form action="/api/admin/operator-dictionary" method="post">
                  <input type="hidden" name="action" value="delete" />
                  <input type="hidden" name="id" value={entry.id} />
                  <button className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30">
                    삭제
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
