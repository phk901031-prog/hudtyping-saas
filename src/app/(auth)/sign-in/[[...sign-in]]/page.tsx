// src/app/(auth)/sign-in/[[...sign-in]]/page.tsx
// Clerk이 제공하는 기본 로그인 UI를 그대로 사용한다.
//
// 폴더 이름 `[[...sign-in]]`는 Next.js의 "optional catch-all 라우트".
//   /sign-in            (catch 없음)
//   /sign-in/factor-one (한 단계)
//   /sign-in/sso-callback/google (여러 단계)
// 이 모든 하위 경로를 한 페이지에서 처리할 수 있게 해준다.
// Clerk의 OAuth/2FA 흐름이 다양한 하위 경로를 사용하므로 이 패턴이 필요하다.
//
// `(auth)`는 route group: URL에는 안 나타나고 폴더 단위로만 묶인다.
//   실제 URL은 그냥 `/sign-in`.

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      {/*
        forceRedirectUrl: 로그인 성공 후 무조건 이 경로로 이동.
        Phase 2에서는 status에 따라 (승인됨 → /workspace, 대기 중 → /pending) 분기되도록
        proxy.ts에서 리다이렉트 로직을 추가할 예정. Phase 1에선 임시로 /pending 고정.
      */}
      <SignIn forceRedirectUrl="/pending" signUpUrl="/sign-up" />
    </main>
  );
}
