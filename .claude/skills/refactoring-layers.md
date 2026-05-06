# 리팩토링: 4-layer 아키텍처 적용 — 완료

날짜: 2026-05-05

## 결과
- `src/lib/`, `src/db/` 제거
- `src/infrastructure/`, `src/features/` 신설
- API 라우트 모두 슬림화 (인증 + 입력파싱 + service 호출 + 응답)
- 자동 검증 통과 (`/`, `/dashboard`, `/search`, `/api-keys`, `/stats`, `/api/keys`, `/api/search` 모두 응답 정상)
- 동작 변경 0 (응답·UI 구조 그대로)

## 최종 구조
```
src/
├── app/                       # ① Presentation
├── components/
├── features/                  # ②③ 도메인별
│   ├── search/
│   │   ├── service.ts          # searchWord, logSearch, getMyStats
│   │   └── types.ts
│   ├── auth/
│   │   ├── service.ts          # authenticate (Bearer or Clerk)
│   │   └── api-keys/
│   │       ├── service.ts      # createApiKey/listApiKeys/revokeApiKey/verifyApiKeyFromHeader
│   │       └── token.ts        # generateApiKey/hashToken (순수)
│   ├── users/service.ts        # getOrCreateCurrentUser (JIT)
│   └── webhooks/clerk-handler.ts
├── infrastructure/            # ④ 외부 어댑터
│   ├── db/{index,schema}.ts
│   ├── redis.ts
│   ├── urimalsaem.ts
│   └── clerk.ts
└── proxy.ts
```

## 라우트 슬림화 결과

| 라우트 | 이전 라인 수 | 이후 라인 수 |
|--------|-------------|-------------|
| `/api/search/route.ts` | 95 | 38 |
| `/api/keys/route.ts` | 80 | 56 |
| `/api/keys/[id]/route.ts` | 36 | 30 |
| `/api/webhooks/clerk/route.ts` | 60 | 23 |

`route.ts`들은 이제 인증 검사 + 입력 파싱 + service 호출 + 응답만 다룸.

## 의존 방향
```
app/* (presentation)
   ↓ import
features/*/service.ts (application)
   ↓ import
features/*/types.ts (domain)        infrastructure/* (external adapters)
                                       ↓ import
                                    @clerk/nextjs/server, drizzle-orm, ...
```

상위 → 하위만 import. Domain은 외부 SDK 모름.

## 단계별 진행 메모
- **Step 1** (인프라 이동): `src/lib/{redis,dictionary-api}.ts` + `src/db/*` → `src/infrastructure/`. drizzle.config.ts의 schema 경로도 갱신.
- **Step 2** (search): types.ts 추출, service.ts에 searchWord/logSearch/getMyStats 작성, route.ts 슬림.
- **Step 3** (auth): token.ts(순수) + api-keys/service.ts(DB) + auth/service.ts(authenticate) 분리. `src/lib/` 삭제.
- **Step 4** (users + webhooks): getOrCreateCurrentUser 이동, webhook 핸들러 분리, `src/db/` 삭제.

## 다음
Phase 5: 관리자 페이지 — 새 구조로 처음부터 작성. `features/admin/service.ts` + `app/(dashboard)/admin/users/page.tsx`.
