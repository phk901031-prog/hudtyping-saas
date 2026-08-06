"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export function AccountActions() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <span aria-hidden="true" className="h-9 w-24 rounded-lg bg-muted-bg" />;
  }

  if (isSignedIn) {
    return (
      <>
        <Link href="/dashboard" className="rounded-lg border border-border px-3 py-2 text-sm font-semibold transition hover:bg-muted-bg sm:px-4">
          대시보드
        </Link>
        <UserButton />
      </>
    );
  }

  return (
    <>
      <Link href="/sign-in" className="hidden text-sm font-medium text-muted transition hover:text-foreground sm:inline">
        로그인
      </Link>
      <Link href="/sign-up" className="whitespace-nowrap rounded-lg bg-foreground px-3 py-2 text-sm font-semibold text-background transition hover:opacity-90 sm:px-4">
        시작하기
      </Link>
    </>
  );
}
