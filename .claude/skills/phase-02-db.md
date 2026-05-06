# Phase 2: Neon DB + 회원 승인 시스템 — 완료

날짜: 2026-05-05

## 완료된 Step
- [x] 2-1: Neon 프로젝트 생성 (Tokyo 리전), DATABASE_URL `.env.local` 저장
- [x] 2-2: `drizzle-orm` + `@neondatabase/serverless` + `drizzle-kit` + `dotenv` 설치, `drizzle.config.ts` + `src/db/index.ts` 작성
- [x] 2-3: `src/db/schema.ts` users 테이블 (clerk_id PK, email unique, status/role enum, timestamps)
- [x] 2-4: JIT provisioning (`src/db/users.ts`) + Clerk webhook 라우트 (`/api/webhooks/clerk`, 배포 시 활성화)
- [x] 2-5: 보호 layout (`(dashboard)/layout.tsx`)에서 status 검사 + `/pending` 페이지에 status 분기

## 만들어진 파일
- `drizzle.config.ts` — drizzle-kit 설정 (dotenv로 .env.local 읽기)
- `drizzle/0000_breezy_warhawk.sql` — 자동 생성 마이그레이션
- `src/db/index.ts` — Drizzle 클라이언트 (Neon HTTP)
- `src/db/schema.ts` — users 테이블 + 두 개의 enum
- `src/db/users.ts` — `getOrCreateCurrentUser()` JIT 헬퍼
- `src/app/(dashboard)/layout.tsx` — 보호 layout (인증 + status 검사)
- `src/app/(dashboard)/dashboard/page.tsx` — 임시 환영 페이지
- `src/app/api/webhooks/clerk/route.ts` — Clerk 가입 이벤트 핸들러
- `src/app/(auth)/pending/page.tsx` — status='approved'면 자동으로 /dashboard 이동

## 패키지
- `drizzle-orm@0.45.x`, `@neondatabase/serverless@1.x`, `drizzle-kit@0.31.x` (dev), `dotenv@17.x` (dev)

## 주요 발견
- **Clerk 7 빌트인 webhook 헬퍼**: `verifyWebhook(req)` 사용 → Svix 패키지 직접 다룰 필요 없음
- **Neon HTTP 드라이버 (`drizzle-orm/neon-http`)**: 서버리스 환경에서 TCP 풀 걱정 없이 fetch 기반으로 동작
- **PG enum 타입**: drizzle의 `pgEnum()`으로 정의하면 DB 레벨에서 잘못된 값 차단

## 검증 결과
- `/sign-up` 가입 → JIT 자동 생성 (status='pending')
- `/dashboard` 직접 접속 → `/pending`으로 redirect ✓
- Neon SQL Editor에서 `UPDATE users SET status='approved'` → 새로고침 시 `/dashboard` 통과 ✓
- 환영 페이지 정상 표시 ✓

## 트러블슈팅
- **Turbopack의 "Rendering..." 일시 stuck**: dev 모드에서 가끔 발생, 강력 새로고침(Ctrl+Shift+R)으로 해결

## 다음 Phase
Phase 3: 우리말샘 검색 + Upstash Redis 캐싱
- `/api/search?q=...` API 라우트 (Redis 캐시 → 우리말샘 API → Redis 저장)
- 검색 페이지 UI (검색바 + 결과 카드)
- 캐시 적중 시 ~5ms, 미스 시 200~500ms (캐싱이 실질적 효용의 핵심)
