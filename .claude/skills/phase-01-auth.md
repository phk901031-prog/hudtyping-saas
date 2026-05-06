# Phase 1: 프로젝트 초기화 + Clerk 인증 — 완료

날짜: 2026-05-05

## 완료된 Step
- [x] 1-1: Next.js 16.2.4 + React 19.2 + Tailwind v4 + TypeScript + App Router + Turbopack
- [x] 1-2: Clerk 가입 (phk901031@gmail.com), API 키 `.env.local`에 저장
- [x] 1-3: `@clerk/nextjs@7.3.0` 설치, `src/proxy.ts` 작성, `<ClerkProvider>` 적용, `/sign-in`·`/sign-up` 페이지
- [x] 1-4: 구글 로그인 (Clerk 가입 시 활성화, 추가 코드 불필요)
- [x] 1-5: `/pending` 승인 대기 페이지 (가입 직후 자동 이동)

## 만들어진 파일
- `src/proxy.ts` — Clerk 미들웨어 등록 (Next.js 16 컨벤션)
- `src/app/layout.tsx` — `<ClerkProvider>` + 한국어 메타데이터
- `src/app/page.tsx` — 한국어 랜딩, RSC + auth() 분기
- `src/app/(auth)/sign-in/[[...sign-in]]/page.tsx`
- `src/app/(auth)/sign-up/[[...sign-up]]/page.tsx`
- `src/app/(auth)/pending/page.tsx`

## 발견한 breaking changes (둘 다 `docs/02-clerk-auth.md`에 정리)
1. **Next.js 16**: `middleware.ts` → `proxy.ts`, `function middleware()` → `function proxy()` (또는 default export)
2. **Clerk 7**: `<SignedIn>`/`<SignedOut>` 컴포넌트 제거 → 서버 컴포넌트에서 `auth()` 헬퍼 사용 권장

## 검증 결과 (자동)
| 페이지 | HTTP | proxy.ts 동작 |
|--------|------|--------------|
| `/` | 200 | ✓ |
| `/sign-in` | 200 | ✓ |
| `/sign-up` | 200 | ✓ |
| `/pending` | 200 | ✓ |

dev 서버: `npm run dev` (Turbopack, Ready in 536ms)

## 검증 결과 (수동, 브라우저)
- [ ] 바다가 직접 가입/로그인/로그아웃 흐름 확인 예정

## 다음 Phase
Phase 2: Neon DB + Drizzle ORM + 관리자 승인 시스템
- Clerk webhook으로 회원가입 시 DB에 status='pending' row 생성
- proxy.ts에서 status 확인 → 'pending'이면 /pending, 'approved'면 /workspace
