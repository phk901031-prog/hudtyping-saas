"use client";

import Link from "next/link";
import { UserButton, useAuth } from "@clerk/nextjs";

export function AccountActions() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return <span aria-hidden="true" className="h-5 w-16 bg-muted-bg" />;
  }

  if (isSignedIn) {
    return (
      <>
        <Link href="/dashboard" className="text-sm font-bold text-foreground underline decoration-border underline-offset-4 transition hover:decoration-accent">
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
      <Link href="/sign-up" className="ml-4 whitespace-nowrap text-sm font-bold text-foreground underline decoration-border underline-offset-4 transition hover:decoration-accent">
        가입하기
      </Link>
    </>
  );
}
