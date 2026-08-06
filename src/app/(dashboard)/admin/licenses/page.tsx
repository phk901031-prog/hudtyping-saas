import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { listLicenses } from "@/features/licenses/service";
import { LicenseIssueForm } from "@/components/admin/license-issue-form";
import { LicenseRowActions } from "@/components/admin/license-row-actions";
import type { LicensePlan } from "@/infrastructure/db/schema";

const PLAN_LABELS: Record<LicensePlan, string> = {
  lifetime: "평생판",
  annual: "연간판",
  trial: "체험판",
};

export default async function AdminLicensesPage() {
  const me = await getOrCreateCurrentUser();
  if (!me) return null;

  const list = await listLicenses();

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-7 px-5 py-7 sm:px-8">
      <header className="flex items-center justify-between gap-4">
        <Link
          href="/admin"
          className="text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          관리자 홈
        </Link>
        <UserButton />
      </header>

      <div>
        <p className="text-sm font-semibold text-accent">낱말지기 정품 라이선스</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">라이선스 발급·관리</h1>
      </div>

      <LicenseIssueForm />

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 px-5 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800">
          아직 발급된 라이선스가 없습니다.
        </div>
      ) : (
        <section className="flex flex-col gap-3">
          <h2 className="text-base font-bold">발급 내역 ({list.length}건)</h2>
          <ul className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
            {list.map((license) => {
              const isExpired = license.expired;
              const isRevoked = !!license.revokedAt;
              return (
                <li
                  key={license.key}
                  className="grid gap-3 border-b border-zinc-100 px-4 py-4 last:border-b-0 dark:border-zinc-900 lg:grid-cols-[minmax(0,1fr)_260px]"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="select-all text-sm font-bold">{license.key}</code>
                      <PlanBadge plan={license.plan} />
                      {isRevoked && <StatusBadge tone="rose">회수됨</StatusBadge>}
                      {!isRevoked && isExpired && <StatusBadge tone="amber">만료됨</StatusBadge>}
                      {!isRevoked && !isExpired && license.activatedAt && (
                        <StatusBadge tone="emerald">활성</StatusBadge>
                      )}
                      {!license.activatedAt && !isRevoked && (
                        <StatusBadge tone="zinc">미사용</StatusBadge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-zinc-500">
                      {license.issuedToEmail && <>대상: {license.issuedToEmail} · </>}
                      발급: {formatDate(license.issuedAt)}
                      {license.durationDays != null && <> · 기간 {license.durationDays}일</>}
                      {license.expiresAt && <> · 만료: {formatDate(license.expiresAt)}</>}
                      {" · "}동시 활성화 {license.maxActivations}대
                    </p>
                    {license.notes && (
                      <p className="mt-1 truncate text-xs text-zinc-400">{license.notes}</p>
                    )}
                  </div>
                  <div className="flex items-start justify-end">
                    <LicenseRowActions licenseKey={license.key} revoked={isRevoked} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </main>
  );
}

function PlanBadge({ plan }: { plan: LicensePlan }) {
  const colors: Record<LicensePlan, string> = {
    lifetime: "bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300",
    annual: "bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300",
    trial: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${colors[plan]}`}>
      {PLAN_LABELS[plan]}
    </span>
  );
}

function StatusBadge({
  tone,
  children,
}: {
  tone: "emerald" | "amber" | "rose" | "zinc";
  children: React.ReactNode;
}) {
  const colors: Record<typeof tone, string> = {
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
    rose: "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300",
    zinc: "bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${colors[tone]}`}>
      {children}
    </span>
  );
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "2-digit", day: "2-digit" });
}
