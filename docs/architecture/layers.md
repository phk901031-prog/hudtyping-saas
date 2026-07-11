# 아키텍처 — 레이어 정의

## 변경 시 지켜야 할 모듈 경계

```text
app route/page
  -> components (표현 및 작은 상호작용)
  -> features/<domain> (유스케이스와 정책)
  -> infrastructure (DB, Redis, Clerk, 외부 API)
```

- API route는 입력 검증, 인증/인가, rate limit, HTTP 응답 변환만 담당한다.
- 페이지와 컴포넌트는 Drizzle·Redis·우리말샘을 직접 호출하지 않는다.
- 외부 응답은 식별자와 스키마를 검증한 뒤 캐시한다.
- 정상적인 빈 결과는 짧은 TTL의 negative cache로 표현하고 손상된 캐시와 구분한다.
- 브라우저 상태가 필요한 부분만 Client Component로 분리한다.
- 공개 릴리스 정보는 `src/config/release.ts`를 단일 기준으로 사용한다.
- 순간 호출 제한과 월간 사용량 정책은 각각 `features/security`, `features/quota`가 담당한다.
- 인증된 mutation API(키 발급/폐기, 관리자 변경)는 route에서 인증한 사용자 ID를 `features/security/rate-limit`의 subject로 사용한다.
- 브라우저 쿠키 기반 mutation을 추가할 때는 Clerk 세션 인증과 함께 Origin/CSRF 방어 여부를 검토하고, Bearer 기반 데스크톱 API와 정책을 섞지 않는다.

새 기능은 원칙적으로 `types → service → route → interactive component → page composition` 순서로 추가한다. 이 흐름을 벗어나야 한다면 이 문서에 이유와 새로운 경계를 기록한다.

## 왜 레이어인가

코드가 커지면 한 파일이 여러 책임(인증·DB·외부 API·UI)을 동시에 진다. 결과:
- **변경의 파급**: 우리말샘 API 응답이 바뀌면 route 파일·UI 컴포넌트·로깅 로직을 동시에 수정
- **테스트 어려움**: 비즈니스 로직만 단독으로 검증 불가 (DB·외부 API 의존)
- **온보딩 비용**: 새 합류자가 한 파일 다 읽어야 도메인을 이해

레이어 = 각 코드가 **하나의 관심사**만 다루도록 분리. 변경 영향 격리.

## 레이어 정의

이 프로젝트는 4개 레이어를 둔다:

```
┌──────────────────────────────────────────────────────────────┐
│                  ① Presentation (UI/HTTP)                    │
│  Next.js 페이지·컴포넌트·API Route 핸들러                    │
│  책임: HTTP 입출력, 폼·이벤트, 인증 헤더 추출                 │
│  의존: ② Application                                         │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                ② Application (Service)                        │
│  도메인별 유스케이스 함수                                     │
│  책임: 비즈니스 흐름(캐시→API→로깅 같은 조율)                 │
│  의존: ③ Domain, ④ Infrastructure                            │
└────────────────────────┬─────────────────────────────────────┘
                         ▼
┌─────────────────────┬────────────────────────────────────────┐
│   ③ Domain          │     ④ Infrastructure                    │
│  타입·검증·순수 로직│   외부 시스템 어댑터(DB, Redis, 외부API)│
│  책임: 비즈니스 모델│   책임: SDK 호출, 쿼리, 직렬화          │
│  의존: 없음         │   의존: 외부 SDK                         │
└─────────────────────┴────────────────────────────────────────┘
```

**의존 방향은 위→아래만**. UI가 DB를 직접 부르면 안 되고, Domain은 Infrastructure를 모른다.

## 각 레이어 책임 상세

### ① Presentation
- **위치**: `src/app/**`, `src/components/**`
- **포함**: page.tsx, route.ts, 클라이언트 컴포넌트, 폼
- **금지**: SQL 직접 작성, 외부 API fetch, 토큰 해시 같은 도메인 로직
- **호출**: `import { searchService } from "@/features/search/service"` 후 `searchService.search(...)`

### ② Application (Service)
- **위치**: `src/features/<domain>/service.ts`
- **포함**: 도메인별 유스케이스 함수 (예: `searchService.search(user, q)`)
- **역할**: 흐름 조율 (캐시 조회 → 외부 API → 캐시 저장 → 로깅)
- **금지**: HTTP 응답 만들기, JSX 반환

### ③ Domain
- **위치**: `src/features/<domain>/types.ts`, `src/features/<domain>/<entity>.ts`
- **포함**: 타입 정의, 순수 검증 로직, 토큰 해시 생성 같은 입출력 없는 함수
- **금지**: I/O (DB·HTTP·파일)
- **장점**: 단위 테스트 매우 쉬움 (모킹 불필요)

### ④ Infrastructure
- **위치**: `src/infrastructure/<system>.ts`
- **포함**: Drizzle 클라이언트, Redis 클라이언트, Clerk 래퍼, 우리말샘 API 클라이언트, Webhook 서명 검증
- **역할**: 외부 SDK 직접 다루는 유일한 곳
- **장점**: 라이브러리 교체 시 여기만 수정 (예: Redis → Memcached)

## 현재 상태 (리팩토링 전)

```
src/
├── app/                    # ① Presentation
│   ├── api/
│   │   ├── search/route.ts          [⚠️ ①+②+④ 섞임]
│   │   ├── keys/route.ts            [⚠️ ①+② 섞임]
│   │   ├── keys/[id]/route.ts       [⚠️ ①+② 섞임]
│   │   └── webhooks/clerk/route.ts  [⚠️ ①+②+④ 섞임]
│   └── (dashboard)/
│       ├── search/page.tsx          [① OK, fetch 호출은 클라이언트라 OK]
│       ├── api-keys/page.tsx        [① OK]
│       └── stats/page.tsx           [⚠️ ① + DB 쿼리 직접 ④]
├── components/             # ① Presentation
├── db/
│   ├── index.ts            # ④ Infrastructure (Drizzle 클라)
│   ├── schema.ts           # ③ Domain + ④ Infrastructure 섞임
│   └── users.ts            [⚠️ ②+④ 섞임 (JIT 로직 + Clerk SDK 호출)]
└── lib/
    ├── redis.ts            # ④ Infrastructure
    ├── dictionary-api.ts   # ④ Infrastructure (우리말샘 클라이언트)
    └── auth/api-key.ts     [⚠️ ③+④ 섞임 (해시 생성 + DB 검증)]
```

문제점:
- **`/api/search/route.ts` 한 파일에 5가지 책임** (인증·캐시·외부API·로깅·응답)
- **`db/users.ts`가 JIT 로직(②) + DB 쿼리(④) 섞음**
- **`lib/auth/api-key.ts`가 해시 생성(③) + DB 검증(④) 섞음**
- **`stats/page.tsx`가 DB 쿼리 직접 작성** (UI가 ④에 직접 의존)

## 목표 상태 (리팩토링 후)

```
src/
├── app/                    # ① Presentation 전용
│   ├── api/
│   │   ├── search/route.ts          # 인증 헤더 추출 + searchService.search() 호출
│   │   ├── keys/route.ts            # apiKeyService.create/list() 호출
│   │   ├── keys/[id]/route.ts       # apiKeyService.revoke() 호출
│   │   └── webhooks/clerk/route.ts  # webhookService.handle() 호출
│   └── (dashboard)/
│       ├── stats/page.tsx           # statsService.getMyStats() 호출
│       └── ... (나머지)
├── components/
├── features/               # ②+③ 도메인별 모듈
│   ├── search/
│   │   ├── service.ts      # searchService.search(user, query)
│   │   └── types.ts
│   ├── auth/
│   │   ├── service.ts      # authService.authenticate(req)
│   │   ├── api-keys/
│   │   │   ├── service.ts  # apiKeyService.create/list/revoke/verify
│   │   │   └── token.ts    # generateToken / hashToken (③ 순수)
│   ├── users/
│   │   └── service.ts      # userService.getOrCreateCurrent
│   ├── stats/
│   │   └── service.ts      # statsService.getMyStats / getGlobalStats
│   └── webhooks/
│       └── clerk-handler.ts
├── infrastructure/         # ④ 외부 시스템 어댑터
│   ├── db/
│   │   ├── index.ts        # Drizzle 클라이언트
│   │   └── schema.ts       # 테이블 정의 (③에 가까우나 Drizzle 의존이라 ④에 둠)
│   ├── redis.ts
│   ├── clerk.ts            # auth(), clerkClient() 래퍼
│   └── urimalsaem.ts       # 우리말샘 API fetch
└── lib/                    # 공용 유틸 (도메인 무관)
    └── ...
```

원칙:
- **route.ts는 얇게**: 인증 + 입력 파싱 + 서비스 호출 + 응답. 보통 30줄 이내.
- **service.ts에 비즈니스 흐름 모음**: route 여러 개가 같은 service 호출 가능
- **infrastructure는 SDK 직접 다루는 유일한 곳**: SDK 변경 시 여기만 수정

## 리팩토링 단계 (다음 작업)

위험 최소화를 위해 점진적으로:

### Step 1: Infrastructure 분리 (낮은 위험)
- `src/lib/redis.ts` → `src/infrastructure/redis.ts`
- `src/lib/dictionary-api.ts` → `src/infrastructure/urimalsaem.ts`
- `src/db/index.ts`, `src/db/schema.ts` → `src/infrastructure/db/`
- import 경로만 갱신, 동작 변경 없음

### Step 2: Features 폴더 + Service 추출
- `src/features/search/service.ts` 생성, `/api/search/route.ts`의 흐름 옮김
- `src/features/auth/api-keys/service.ts`, `token.ts` 분리
- `src/features/users/service.ts` (`db/users.ts`에서 옮김)
- `src/features/stats/service.ts` (`stats/page.tsx`의 쿼리 옮김)

### Step 3: 라우트/페이지 슬림화
- 기존 route.ts·page.tsx에서 비즈니스 로직 빼고 service 호출하게 변경
- 응답 구조는 그대로 유지 (UI 코드 변경 없게)

### Step 4: 기존 폴더 정리
- 비어버린 `src/lib/auth/`, `src/db/users.ts` 삭제
- import alias 정리

각 단계 후 자동 검증(curl + 컴파일) 통과 확인 → 다음 단계.

## 새 Phase 작성 가이드

Phase 5(관리자) 이후부터는 **처음부터 이 구조 따름**:

```
새 도메인 추가 시:
1. src/features/<domain>/types.ts (도메인 타입)
2. src/features/<domain>/service.ts (비즈니스 로직)
3. src/infrastructure/<system>.ts (필요시 외부 어댑터 추가)
4. src/app/api/<route>/route.ts (얇은 핸들러, service 호출만)
5. src/app/(dashboard)/<page>/page.tsx (UI, service 호출 또는 fetch)
```
