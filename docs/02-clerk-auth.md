# 02. Clerk 인증 (Phase 1, Step 1-2 ~ 1-5)

## 결과물
- `@clerk/nextjs@7.3.0` SDK 설치 + Next.js 16 호환
- API 키 2개를 `.env.local`에 저장 (gitignore로 보호)
- `src/proxy.ts` (Next.js 16의 새 미들웨어 컨벤션) 작성
- `<ClerkProvider>` 루트 레이아웃 적용
- 페이지 4개: `/`, `/sign-in`, `/sign-up`, `/pending` 모두 HTTP 200

## ⚠️ 두 가지 breaking change 만남

### 1. Next.js 16: `middleware.ts` → `proxy.ts`
프로젝트에 자동 생성된 `AGENTS.md`가 경고했던 그것. `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`에 정식 문서 있음.

| Next.js 14/15 | Next.js 16 |
|---------------|-----------|
| `src/middleware.ts` | `src/proxy.ts` |
| `export function middleware()` | `export function proxy()` 또는 default export |

API는 같다 (`NextRequest`, `NextResponse`, `config.matcher` 등). 이름만 바뀐 것.

> **왜?** Next.js 팀에 따르면, "middleware"라는 이름이 Express.js의 미들웨어와 혼동을 일으킨다고 판단. 또한 이 기능은 "최후의 수단"으로 써야 하는데, 이름이 사용을 부추긴다고 봄. "proxy"는 앱 앞단에 위치한 네트워크 경계임을 더 명확히 표현.

자동 마이그레이션 코드모드도 있음 (기존 14/15 프로젝트용):
```bash
npx @next/codemod@canary middleware-to-proxy .
```

### 2. Clerk 7: `<SignedIn>`/`<SignedOut>` 컴포넌트 제거
Clerk 6까지 있던 조건부 렌더링 컴포넌트 두 개가 사라졌다.

**구버전(Clerk 6)** ❌:
```tsx
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function Page() {
  return (
    <>
      <SignedIn>로그인된 사용자에게만</SignedIn>
      <SignedOut>비로그인 사용자에게만</SignedOut>
    </>
  );
}
```

**Clerk 7 권장 (RSC 패턴)** ✅:
```tsx
import { auth } from "@clerk/nextjs/server";

export default async function Page() {
  const { userId } = await auth();

  if (userId) {
    return <p>로그인된 사용자에게만</p>;
  }
  return <p>비로그인 사용자에게만</p>;
}
```

### RSC + auth() 패턴이 더 좋은 이유
1. **서버에서 분기**: 클라이언트로 "두 버전 다 보낸 뒤 숨기기"가 아니라, 처음부터 한 버전만 보냄.
2. **깜빡임 없음**: `<SignedIn>` 패턴은 클라이언트 hydration 전엔 깜빡일 수 있다.
3. **HTML이 더 가벼움**: 분기에 따라 다른 마크업만 전송.
4. **SEO/소셜 미리보기**: 봇이 받는 HTML이 정확히 분기됨.

대신 클라이언트 컴포넌트(예: 헤더에 동적으로 로그인 버튼이 바뀌어야 할 때)에서는 `useUser()` 훅이나 `<Show when="signedIn">` 컴포넌트(Clerk 7 신규)를 쓰면 된다.

## 코드 구조

### `src/proxy.ts`
```ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
    '/(api|trpc)(.*)',
  ],
};
```
- `clerkMiddleware()`는 함수를 반환하므로 그대로 default export.
- matcher의 첫 줄은 정적 파일/메타데이터 제외, 둘째 줄은 API 라우트 강제 포함.
- **Phase 2에서 추가될 것**: 보호 라우트 정의 + DB의 `users.status`에 따라 `/pending`으로 강제 리다이렉트.

### `src/app/layout.tsx`
- `<ClerkProvider>`로 전체를 감싸야 클라이언트 컴포넌트(`<UserButton>`, `useUser()`) 동작.
- `<html lang="ko">` + 한국어 메타데이터로 변경.

### `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- Clerk 기본 `<SignIn>` 컴포넌트 사용. 이메일/비밀번호 + Google OAuth 모두 처리.
- `[[...sign-in]]`는 **optional catch-all 라우트**: `/sign-in`, `/sign-in/factor-one`, `/sign-in/sso-callback/google` 등 모든 하위 경로를 한 페이지에서 처리.
- `(auth)` route group: URL에는 안 나타나고 폴더 단위로만 묶임.
- `forceRedirectUrl="/pending"`: 로그인 성공 후 무조건 승인 대기 페이지로 (Phase 2에서 status 분기로 교체).

### `src/app/(auth)/pending/page.tsx`
- 회원가입 직후 도착하는 정적 페이지.
- 비로그인 상태로 직접 URL 치면 로그인 안내, 로그인된 상태면 "관리자 검토 중" 안내.
- `<SignOutButton>`으로 로그아웃 가능 (자식 `<button>`을 그대로 감싸 자유롭게 스타일 가능).

## 인증 흐름

```
[회원가입 가입자]
   ↓
1. /sign-up 접속 (Clerk 폼)
   ↓ (이메일 + 비번 입력 또는 "Continue with Google")
2. Clerk 서버에 계정 생성
   ↓
3. forceRedirectUrl 에 의해 /pending 으로 자동 이동
   ↓
4. "승인 대기 중" 안내 페이지

[기존 사용자 로그인]
   ↓
1. /sign-in 접속
   ↓
2. 이메일/비번 또는 구글 OAuth
   ↓
3. /pending 으로 이동 (Phase 1)
   → Phase 2에서: DB에 status='approved'면 /workspace, 아니면 /pending
```

## 검증 (수동, 브라우저에서)

dev 서버가 켜져 있는 상태에서:

1. **http://localhost:3000** 접속 → 한국어 랜딩 + "로그인"/"회원가입" 버튼 보여야 함.
2. **회원가입** 버튼 클릭 → Clerk 가입 폼 표시 (이메일 + Google 둘 다).
3. **이메일로 가입** 진행 (인증 코드 이메일로 받음) → 가입 완료 후 자동으로 `/pending`로 이동.
4. **/pending 페이지** 확인 → "승인 대기 중" 안내 + 로그아웃 버튼.
5. **로그아웃** 후 다시 `/` → 비로그인 UI로 돌아옴.
6. **다시 로그인** → `/pending`로 이동.

## Step 1-4: 구글 로그인
별도 작업 없이 동작. Clerk 가입 시 "Sign-in options"에 Google을 체크해뒀기 때문에,
`<SignIn>` / `<SignUp>` 컴포넌트가 자동으로 "Continue with Google" 버튼을 노출함.

추가 설정이 필요하면 Clerk 대시보드 → **Configure → SSO connections → Google**에서
허용 도메인 등을 조정할 수 있음 (지금은 기본값으로 충분).

## 트러블슈팅: `<SignOutButton>` children 제약 (Clerk 7)

처음에는 `<SignOutButton>`으로 직접 스타일된 button을 감쌌더니 런타임 에러가 났다:

> `@clerk/react: You've passed multiple children components to <SignOutButton/>. You can only pass a single child component or text.`

원인: Clerk 7의 `<SignOutButton>`은 children을 매우 엄격하게 단일 element로 제한한다 (텍스트 노드 + element 조합도 multiple로 친다).

**해결**: 클라이언트 컴포넌트로 분리해서 `useClerk().signOut()`을 직접 호출. 마크업 100% 통제 가능.

```tsx
// src/components/logout-button.tsx
"use client";
import { useClerk } from "@clerk/nextjs";

export function LogoutButton() {
  const { signOut } = useClerk();
  return (
    <button onClick={() => signOut({ redirectUrl: "/" })} className="...">
      로그아웃
    </button>
  );
}
```

이게 Clerk 7의 권장 패턴이기도 하다. `<SignOutButton>`은 Clerk이 만든 기본 버튼을 그대로 쓸 때만 편리하고, 커스텀 스타일이 필요하면 훅 방식이 깔끔.

## 다음 단계
Phase 2: **Neon DB + Drizzle ORM + 회원 승인 시스템**
- Clerk webhook으로 회원가입 시 우리 DB에 사용자 row 생성 (status='pending')
- proxy.ts에서 status 확인 → 'pending'이면 /pending 강제, 'approved'면 /workspace
- 관리자가 DB에서 승인하는 워크플로우는 Phase 5의 관리자 페이지에서 UI로 구현
