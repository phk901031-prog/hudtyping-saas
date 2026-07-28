import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/logout-button";
import { getOrCreateCurrentUser } from "@/features/users/service";
import { OPENCHAT } from "@/config/community";

export default async function PendingPage() {
  const user = await getOrCreateCurrentUser();

  if (!user) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="flex max-w-md flex-col gap-6 text-center">
          <h1 className="text-2xl font-bold">로그인이 필요합니다</h1>
          <p className="text-muted">가입 승인 상태를 확인하려면 먼저 로그인해주세요.</p>
          <Link
            href="/sign-in"
            className="mx-auto rounded-lg bg-foreground px-6 py-2 text-sm font-bold text-background transition hover:opacity-90"
          >
            로그인하기
          </Link>
        </div>
      </main>
    );
  }

  if (user.status === "approved") {
    redirect("/dashboard");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-10">
      <section className="w-full max-w-xl rounded-xl border border-border bg-card p-7 text-center shadow-[0_14px_40px_rgba(17,29,36,0.06)]">
        <p className="text-sm font-bold text-accent">승인 대기</p>
        <h1 className="mt-3 font-display text-3xl">가입 요청이 접수됐습니다</h1>
        <p className="mt-4 leading-7 text-muted">
          관리자가 성명과 가입 정보를 확인한 뒤 사용 권한을 열어드립니다.
          빠른 승인이 필요하면 카카오톡{" "}
          <a
            href={OPENCHAT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-accent underline"
          >
            오픈톡방
          </a>
          에 가입 이메일과 성명을 남겨주세요.
        </p>

        <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted-bg/55 p-4">
            <p className="text-sm font-bold">현재 계정</p>
            <p className="mt-1 break-all text-sm text-muted">{user.email}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted-bg/55 p-4">
            <p className="text-sm font-bold">문의 채널</p>
            <a
              href={OPENCHAT.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-sm text-accent underline underline-offset-2 hover:opacity-80"
            >
              카카오톡 오픈톡방 →
            </a>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/help"
            className="inline-flex items-center justify-center rounded-lg border border-border px-5 py-3 text-sm font-bold transition hover:bg-muted-bg"
          >
            사용 가이드 보기
          </Link>
          <LogoutButton />
        </div>
      </section>
    </main>
  );
}
