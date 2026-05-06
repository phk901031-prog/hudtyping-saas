// src/app/(auth)/sign-up/[[...sign-up]]/page.tsx
// Clerk이 제공하는 기본 회원가입 UI.
// `[[...sign-up]]` catch-all은 OTP 이메일 검증, OAuth 콜백 같은
// 다단계 가입 흐름을 한 페이지에서 처리하기 위함.

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      {/* 가입 완료 후 곧장 승인 대기 페이지로 이동 */}
      <SignUp forceRedirectUrl="/pending" signInUrl="/sign-in" />
    </main>
  );
}
