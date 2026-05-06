# 리팩토링 실행 계획

> [layers.md](layers.md)에서 정의한 4-layer 구조로 옮기는 단계별 plan.
> **각 단계 후 자동 검증(curl + tsc) 통과해야 다음 단계 진행.**

## 원칙
- **동작 변경 0**: 응답·UI는 똑같이, 내부 구조만 정리
- **import 경로만 갱신**: 파일을 옮기되 함수 시그니처는 유지
- **점진적**: 한 번에 한 도메인씩

## 목표 폴더 구조

```
src/
├── app/                    # ① Presentation
├── components/             # ① 공유 UI
├── features/               # ②③ 도메인별 모듈
│   ├── search/
│   │   ├── service.ts      # ② searchService.search()
│   │   └── types.ts        # ③ SearchResult, DictItem, ...
│   ├── auth/
│   │   ├── api-keys/
│   │   │   ├── service.ts  # ② apiKeyService.create/list/revoke/verify
│   │   │   └── token.ts    # ③ generateToken / hashToken (순수)
│   │   └── service.ts      # ② authenticate(req) — Bearer or Clerk
│   ├── users/
│   │   └── service.ts      # ② getOrCreateCurrentUser, JIT
│   ├── stats/
│   │   └── service.ts      # ② getMyStats, (Phase5) getGlobalStats
│   └── webhooks/
│       └── clerk.ts        # ② Clerk webhook 이벤트 핸들러
├── infrastructure/         # ④ 외부 어댑터
│   ├── db/
│   │   ├── index.ts        # Drizzle 클라이언트
│   │   └── schema.ts       # 테이블 정의
│   ├── redis.ts            # Upstash Redis
│   ├── clerk.ts            # auth(), clerkClient() 래퍼
│   └── urimalsaem.ts       # 우리말샘 API 클라이언트
└── lib/                    # 도메인-무관 유틸 (현재는 비울 예정)
```

## 단계 (Step 1~5)

### Step 1: Infrastructure 분리 (가장 안전)

**목적**: 외부 시스템 어댑터를 한 곳에 모음. 도메인 로직과 무관하므로 위험 거의 없음.

| 이동 전 | 이동 후 |
|---------|---------|
| `src/lib/redis.ts` | `src/infrastructure/redis.ts` |
| `src/lib/dictionary-api.ts` | `src/infrastructure/urimalsaem.ts` (이름도 명시적으로) |
| `src/db/index.ts` | `src/infrastructure/db/index.ts` |
| `src/db/schema.ts` | `src/infrastructure/db/schema.ts` |

**+ Clerk 어댑터 신규 생성**: `src/infrastructure/clerk.ts`
```ts
// auth(), clerkClient() 등을 한 번 감싸서 import 줄임
export { auth, clerkClient } from "@clerk/nextjs/server";
```

**Import 갱신** (3 ~ 4 파일):
- `src/db/users.ts`: `import { db } from "./index"` → `from "@/infrastructure/db"`
- `src/lib/auth/api-key.ts`: `import { db } from "@/db"` → `from "@/infrastructure/db"`
- `src/app/api/search/route.ts`: redis, urimalsaem 경로
- `src/app/api/keys/route.ts`, `[id]/route.ts`
- `src/app/(dashboard)/stats/page.tsx`
- `src/app/api/webhooks/clerk/route.ts`
- `src/app/(auth)/pending/page.tsx`, `(dashboard)/layout.tsx` (db/users 경로)

**검증**: `tsc --noEmit` + curl로 모든 라우트 재테스트.

### Step 2: features/search 추출

```
src/features/search/
├── service.ts     # searchService.search(user, query): SearchResultWithMeta
└── types.ts       # 도메인 타입
```

`service.ts`가 가져갈 책임 (현재 `/api/search/route.ts`에 있음):
1. Redis 캐시 조회
2. (miss면) 우리말샘 호출
3. Redis 캐시 저장
4. (after) search_logs INSERT
5. cache 메타와 함께 결과 반환

route.ts에 남는 책임:
1. 인증 (헬퍼 호출)
2. 입력 파싱 (`req.nextUrl.searchParams.get("q")`)
3. `searchService.search()` 호출
4. JSON 응답 (`Response.json()`)

→ route.ts가 ~30줄로 줄어듦.

### Step 3: features/auth 추출

```
src/features/auth/
├── api-keys/
│   ├── service.ts  # create, list, revoke, verifyByToken
│   └── token.ts    # generateApiKey, hashToken (순수, lib/auth/api-key.ts에서 추출)
└── service.ts      # authenticate(req): User | null (Bearer 또는 Clerk)
```

**의도**:
- `token.ts` = ③ Domain. SHA256·crypto.randomBytes만 사용. DB 모름. 단위 테스트 가능.
- `api-keys/service.ts` = ② Application. 위 token.ts 사용 + DB 사용. route에서 호출.
- `auth/service.ts` = ② Application. Bearer 헤더 검사 또는 Clerk 쿠키 폴백. searchService에서 사용.

route 변경:
- `/api/keys/route.ts`: `apiKeyService.create({clerkId, name})` 호출만
- `/api/keys/[id]/route.ts`: `apiKeyService.revoke({clerkId, id})` 호출만
- `/api/search/route.ts`: 첫 줄 `const user = await authenticate(req)`만

### Step 4: features/users + stats 추출

`features/users/service.ts`:
- `getOrCreateCurrentUser()` 옮김 (현재 `src/db/users.ts`)

`features/stats/service.ts`:
- `getMyStats(userId)`: 요약 + 최근 + 인기 쿼리 묶음 반환
- `stats/page.tsx`는 이걸 호출만 (DB 직접 X)

### Step 5: 정리

- 비어버린 `src/lib/auth/`, `src/db/users.ts`, `src/lib/redis.ts`, `src/lib/dictionary-api.ts` 삭제
- import alias `@/db`, `@/lib/...` → `@/infrastructure/...`, `@/features/...`로 통일
- `tsconfig.json`의 paths 갱신 (필요 시)

## 검증 체크리스트 (각 단계 후)

```bash
# 1. 컴파일 검사
cd c:/app/new-hudtyping-saas
# (전체 tsc는 무거우므로 next build dry-run으로 대체 가능)

# 2. dev 서버 자동 검증
for path in "/" "/dashboard" "/search" "/api-keys" "/stats" "/api/keys" "/api/search?q=test"; do
  curl -s -o /dev/null -w "$path -> %{http_code}\n" "http://localhost:3000$path"
done
# 기대: /, /api-keys/.../307 (비로그인), /api/* 401, / 200

# 3. 수동 (브라우저)
- /api-keys 새 키 발급 시도 → 정상 동작
- /search "사과" 검색 → 결과 표시 + cache hit/miss
- curl로 Bearer 헤더 검색 → 결과
- /stats 통계 표시 정상
```

## 위험 관리

- **하나씩 커밋**: 각 Step 끝나면 git commit. 깨지면 즉시 revert 가능.
- **import 경로는 IDE의 "find usages"로 추적**: 수동 grep보다 안전.
- **service 함수 시그니처는 단순하게**: 처음부터 너무 추상화 X. 필요해질 때 리팩토링.

## 완료 기준

다음 모두 충족:
- [ ] `src/lib/` 비어있거나 도메인-무관 유틸만 남음
- [ ] `src/db/` 통째로 `src/infrastructure/db/`로 이동
- [ ] 모든 route.ts가 30줄 이내
- [ ] `src/features/` 안에 도메인별 폴더 구조 잡힘
- [ ] curl·브라우저 검증 모두 통과 (응답 변경 0)
- [ ] `.claude/skills/refactoring-layers.md` 작성

## 참고
- 이 plan을 다음 응답에서 단계별로 실행
- Phase 5는 리팩토링 끝난 뒤 새 구조로 작성
