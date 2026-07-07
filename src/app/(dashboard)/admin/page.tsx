import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getGlobalStats } from "@/features/admin/stats";
import { getOperatorDictionarySummary } from "@/features/admin/operator-dictionary";

export default async function AdminHomePage() {
  const [
    { userCounts, searchSummary, dictionarySummary, recentSearches, popular },
    operatorSummary,
  ] = await Promise.all([getGlobalStats(), getOperatorDictionarySummary()]);

  const usersByStatus = Object.fromEntries(
    userCounts.map((row) => [row.status, row.cnt])
  ) as Record<string, number>;
  const totalUsers =
    (usersByStatus.pending ?? 0) +
    (usersByStatus.approved ?? 0) +
    (usersByStatus.rejected ?? 0);
  const cacheHitRate =
    searchSummary.total > 0
      ? (searchSummary.cacheHits / searchSummary.total) * 100
      : 0;
  const activeRate =
    totalUsers > 0 ? (searchSummary.uniqueUsers / totalUsers) * 100 : 0;

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-5 py-6 sm:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="group inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground">
            <span className="keycap h-7 w-7 text-xs">H</span>
            <span>대시보드</span>
          </Link>
          <span className="hidden text-sm text-muted sm:inline">/ 관리자</span>
        </div>
        <UserButton />
      </header>

      <section className="rounded-lg border border-border bg-card p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-medium text-accent">운영 콘솔</p>
            <h1 className="mt-2 font-display text-3xl sm:text-4xl">
              속도, 사용자, 표기 기준을 관리합니다.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              검색 응답 시간, 캐시 적중률, 회원 승인, 운영자 표기 사전을 한곳에서 확인합니다.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <AdminButton href="/admin/users">회원 관리</AdminButton>
            <AdminButton href="/admin/stats">상세 통계</AdminButton>
            <AdminButton href="/admin/operator-dictionary">표기 사전</AdminButton>
            <AdminButton href="/">메인 화면</AdminButton>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="전체 회원" value={totalUsers.toLocaleString()} hint={`승인 ${usersByStatus.approved ?? 0} / 대기 ${usersByStatus.pending ?? 0}`} />
        <MetricCard label="전체 검색" value={searchSummary.total.toLocaleString()} hint={`${searchSummary.uniqueUsers.toLocaleString()}명이 사용`} />
        <MetricCard label="캐시 적중률" value={searchSummary.total > 0 ? `${cacheHitRate.toFixed(1)}%` : "-"} hint={`${searchSummary.cacheHits.toLocaleString()}건 즉시 응답`} tone={cacheHitRate >= 60 ? "green" : "amber"} />
        <MetricCard label="운영자 표기" value={operatorSummary.enabled.toLocaleString()} hint={`사전 캐시 ${dictionarySummary.total.toLocaleString()}개`} tone="green" />
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl">운영 작업</h2>
            {(usersByStatus.pending ?? 0) > 0 && (
              <span className="rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                승인 대기 {usersByStatus.pending}
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <TaskRow title="신규 가입 승인" body="실명과 연락 여부를 확인하고 승인 처리합니다." href="/admin/users?status=pending" label="확인" urgent={(usersByStatus.pending ?? 0) > 0} />
            <TaskRow title="검색 속도 확인" body="p95/p99 응답 시간과 느린 검색어를 확인하고 인기 검색어를 미리 캐시합니다." href="/admin/stats" label="통계" />
            <TaskRow title="표기 기준 등록" body="보호자확인서, 학교폭력처럼 운영자가 정한 붙여쓰기 기준을 등록합니다." href="/admin/operator-dictionary" label="등록" />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl">최근 검색</h2>
            <span className="text-xs text-muted">활성률 {activeRate.toFixed(1)}%</span>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border">
            {recentSearches.length === 0 ? (
              <p className="p-4 text-sm text-muted">아직 검색 기록이 없습니다.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recentSearches.map((row) => (
                  <li key={`${row.clerkId}-${row.query}-${row.createdAt.toISOString()}`} className="grid gap-2 p-3 text-sm sm:grid-cols-[1fr_auto_auto]">
                    <span className="font-medium">{row.query}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs ${row.cacheHit ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                      {row.cacheHit ? "cache" : "new"}
                    </span>
                    <span className="text-xs text-muted">{formatKst(row.createdAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">인기 검색어</h2>
          <Link href="/admin/stats" className="text-sm font-medium text-accent transition hover:text-accent-hover">
            전체 보기
          </Link>
        </div>
        {popular.length === 0 ? (
          <p className="mt-4 text-sm text-muted">아직 검색어 데이터가 없습니다.</p>
        ) : (
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
            {popular.slice(0, 10).map((row, index) => (
              <div key={row.query} className="rounded-lg border border-border bg-muted-bg/50 p-3">
                <span className="text-xs text-muted">#{index + 1}</span>
                <p className="mt-1 truncate text-sm font-semibold">{row.query}</p>
                <p className="mt-1 text-xs text-muted">{row.cnt.toLocaleString()}회</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function AdminButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="rounded-full border border-border px-4 py-2 text-sm font-semibold transition hover:bg-muted-bg">
      {children}
    </Link>
  );
}

function MetricCard({ label, value, hint, tone }: { label: string; value: string; hint: string; tone?: "green" | "amber" }) {
  const toneClass = tone === "green" ? "text-success" : tone === "amber" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <span className="text-xs font-medium text-muted">{label}</span>
      <p className={`mt-2 text-3xl font-bold ${toneClass}`}>{value}</p>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </div>
  );
}

function TaskRow({ title, body, href, label, urgent }: { title: string; body: string; href: string; label: string; urgent?: boolean }) {
  return (
    <Link href={href} className={`rounded-lg border p-4 transition hover:bg-muted-bg ${urgent ? "border-warning/40 bg-warning/10" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">{body}</p>
        </div>
        <span className="shrink-0 rounded-full bg-card px-3 py-1 text-xs font-medium text-muted">{label}</span>
      </div>
    </Link>
  );
}

function formatKst(date: Date): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
