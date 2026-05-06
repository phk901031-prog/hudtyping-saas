// src/proxy.ts
// Next.js 16부터 `middleware.ts`가 `proxy.ts`로 이름이 바뀌었다.
// 이 파일은 모든 요청이 페이지/API에 도달하기 전에 서버에서 먼저 실행된다.
// 여기에서 인증, 리다이렉트, 헤더 조작 등을 수행한다.
//
// 우리 프로젝트에서는 Clerk 미들웨어를 등록해서
// 모든 라우트에서 `auth()` 헬퍼와 `<SignedIn>`, `<SignedOut>` 컴포넌트가 동작하게 만든다.
// (인증을 강제로 요구하지는 않음 — Phase 2에서 보호 라우트를 추가할 때 옵션을 확장한다.)

import { clerkMiddleware } from '@clerk/nextjs/server';

// Next.js 16의 proxy.ts는 default export 또는 `proxy`라는 이름의 named export를 받는다.
// `clerkMiddleware()`는 함수를 반환하므로 그대로 default export 하면 된다.
export default clerkMiddleware();

// matcher: proxy가 어떤 경로에서 실행될지 지정.
// - `_next/static`, `_next/image`, 정적 메타데이터 파일은 제외 (불필요한 실행 방지)
// - 나머지 모든 페이지 + API/trpc 경로에서 실행
export const config = {
  matcher: [
    // 1) Next.js 내부 경로 및 정적 파일을 제외한 모든 페이지
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    // 2) API 라우트는 별도 매처로 항상 실행 (인증 검사가 필요할 수 있음)
    '/(api|trpc)(.*)',
  ],
};
