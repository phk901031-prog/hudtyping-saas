# 01. Next.js 프로젝트 초기화 (Phase 1, Step 1-1)

## 결과물
- Next.js **16.2.4** + React **19.2** + Tailwind CSS **v4** 프로젝트 생성
- `npm run dev`로 dev 서버 정상 동작 확인 (HTTP 200, Ready in 536ms)

## 사용한 명령
```bash
npx --yes create-next-app@latest . \
  --typescript --tailwind --eslint \
  --app --src-dir --import-alias "@/*" \
  --use-npm --turbopack
```

각 옵션이 의미하는 것:
| 옵션 | 의미 | 왜 선택했나 |
|------|------|-----------|
| `--typescript` | TS로 작성 | 타입 안정성. AI가 코드 다룰 때도 유리 |
| `--tailwind` | Tailwind CSS v4 사전 설정 | 빠른 스타일링 + 다크모드 쉬움 |
| `--eslint` | ESLint 규칙 자동 설정 | 코드 일관성 |
| `--app` | App Router 사용 | Next.js 14+의 기본. 서버/클라이언트 컴포넌트 명확 |
| `--src-dir` | `src/` 디렉토리 생성 | 코드/설정 파일 분리로 깔끔함 |
| `--import-alias "@/*"` | `@/lib/...` 같은 절대 경로 가능 | 상대 경로 지옥(`../../../`) 방지 |
| `--turbopack` | Turbopack 번들러 사용 | Webpack보다 빠름. Next.js 16 기본 |

## 생성된 폴더 구조
```
new-hudtyping-saas/
├── src/
│   └── app/
│       ├── layout.tsx       # 모든 페이지의 공통 레이아웃 (HTML <html>, <body>)
│       ├── page.tsx         # 루트 경로(/)에서 보이는 페이지
│       ├── globals.css      # 전역 CSS (Tailwind import 포함)
│       └── favicon.ico
├── public/                  # 정적 파일 (이미지, 아이콘 등)
├── package.json
├── tsconfig.json
├── next.config.ts           # Next.js 설정
├── postcss.config.mjs       # Tailwind v4용 PostCSS 설정
├── eslint.config.mjs
├── AGENTS.md                # ⚠️ Next.js 16 breaking changes 경고
└── CLAUDE.md                # 프로젝트 규칙 (사람용)
```

## 핵심 개념: App Router
- `src/app/` 폴더 안의 폴더 구조가 곧 URL 구조가 된다.
  - `src/app/page.tsx` → `/`
  - `src/app/search/page.tsx` → `/search`
  - `src/app/admin/users/page.tsx` → `/admin/users`
- 폴더 이름이 `(...)`로 묶이면 **route group**: URL에는 안 나타나지만 폴더 단위로 묶을 수 있음.
  - 예: `src/app/(dashboard)/search/page.tsx` → `/search` (괄호 그룹은 URL에 미반영)

이 프로젝트의 향후 라우트 구조 (플랜 기준):
```
src/app/
├── (auth)/         # 로그인/회원가입 페이지 묶음
├── (dashboard)/    # 로그인 후 들어가는 페이지 묶음
│   ├── search/
│   ├── workspace/
│   └── admin/
├── api/
│   └── search/     # 우리말샘 검색 API 라우트
├── layout.tsx
└── page.tsx        # 랜딩 페이지
```

## 핵심 개념: Tailwind CSS v4
- v3와 다르게 `tailwind.config.js`가 없음. CSS 파일에서 `@import "tailwindcss";` 하나로 시작.
- 색상/폰트 등 디자인 토큰은 `globals.css`의 `@theme` 블록에서 정의.
- 다크모드는 `@media (prefers-color-scheme: dark)`로 자동 대응.

## ⚠️ Next.js 16 breaking changes
프로젝트 루트의 `AGENTS.md`에 경고가 있음:
> 이 버전은 학습 데이터와 API/관례/파일 구조가 다를 수 있다.
> 코드 작성 전 `node_modules/next/dist/docs/` 의 가이드를 먼저 읽어라.

→ Phase 1 후반(Clerk 미들웨어 설정)에서 `middleware.ts` 작성 전 해당 문서를 먼저 확인할 예정.

## 검증
```bash
npm run dev
# ▲ Next.js 16.2.4 (Turbopack)
# - Local: http://localhost:3000
# ✓ Ready in 536ms

curl http://localhost:3000
# HTTP 200
```

## 다음 단계
Step 1-2: **Clerk 가입 + API 키 발급** (바다가 직접 진행).
- 가입: https://clerk.com → "Sign up" → `phk901031@gmail.com`으로 가입
- 새 application 생성 (이름: `hudtyping-saas` 추천)
- 인증 방식 선택: **Email + Google** 둘 다 체크
- API 키 2개 복사:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (브라우저 노출 OK)
  - `CLERK_SECRET_KEY` (서버 전용, 절대 노출 금지)
- 두 키를 알려주면 `.env.local`에 설정하고 Step 1-3 진행.
