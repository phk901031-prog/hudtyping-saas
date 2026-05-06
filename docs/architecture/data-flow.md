# 아키텍처 — 데이터 흐름

주요 시나리오의 단계별 흐름. 디버깅·신규 합류자가 전체 그림을 빠르게 파악할 때 참고.

## 1. 회원가입 → 승인 대기

```
사용자                  SaaS                    Clerk                   Neon
  │                      │                       │                       │
  │ 1. /sign-up 접속     │                       │                       │
  │────────────────────▶ │                       │                       │
  │                      │ 2. <SignUp/> 컴포넌트  │                       │
  │ 3. 이메일+비번 입력   │                       │                       │
  │────────────────────▶ │ 4. 가입 요청          │                       │
  │                      │──────────────────────▶│                       │
  │                      │                       │ 5. 사용자 생성        │
  │                      │ 6. user_id 발급      │                       │
  │                      │◀──────────────────────│                       │
  │ 7. /pending 리다이렉트│                       │                       │
  │◀─────────────────────│                       │                       │
  │ 8. /pending 접속     │                       │                       │
  │────────────────────▶ │                       │                       │
  │                      │ 9. auth() → userId   │                       │
  │                      │ 10. getOrCreate()    │                       │
  │                      │──────────────────────▶│ (Clerk에서 이메일 가져옴)│
  │                      │◀──────────────────────│                       │
  │                      │ 11. INSERT users     │                       │
  │                      │   (status='pending') │                       │
  │                      │──────────────────────────────────────────────▶│
  │ 12. "승인 대기" 표시  │                       │                       │
  │◀─────────────────────│                       │                       │
```

핵심:
- **Clerk webhook 안 씀** (JIT가 같은 역할). 사용자가 처음 페이지 진입할 때 DB row 생성.
- **status='pending' 기본값**: schema.ts의 default. 관리자가 'approved'로 바꾸기 전엔 dashboard 진입 불가.

관련 코드:
- `src/db/schema.ts` (users 테이블 + enum)
- `src/db/users.ts` (getOrCreateCurrentUser — JIT 로직)
- `src/app/(auth)/pending/page.tsx`
- `src/app/(dashboard)/layout.tsx` (status≠approved면 /pending로 redirect)

## 2. API 키 발급

```
사용자                  SaaS                       Neon
  │                      │                          │
  │ 1. /api-keys 접속    │                          │
  │────────────────────▶ │                          │
  │ 2. "내 노트북" 입력  │                          │
  │ 3. POST /api/keys    │                          │
  │────────────────────▶ │                          │
  │                      │ 4. auth() + status검사   │
  │                      │ 5. generateApiKey()      │
  │                      │    plain = "hk_live_..." │
  │                      │    hash  = SHA256(plain) │
  │                      │ 6. INSERT api_keys       │
  │                      │   (hash 저장, plain X)   │
  │                      │─────────────────────────▶│
  │ 7. plain 1회 노출    │                          │
  │◀─────────────────────│                          │
  │ 8. 사용자 즉시 복사  │                          │
  │   (다시 못 봄)       │                          │
```

핵심:
- **평문 토큰은 응답에서만 1회**. DB에는 SHA256 해시만.
- **prefix(앞 16자)는 평문**: 키 식별용 표시. 보안 영향 없음.
- 사용자가 키를 잃어버리면 → 새 키 발급 후 옛 키 revoke.

관련 코드:
- `src/lib/auth/api-key.ts` (generateApiKey, hashToken)
- `src/app/api/keys/route.ts` (POST: 발급, GET: 목록)
- `src/app/(dashboard)/api-keys/page.tsx` (UI)

## 3. 검색 (브라우저)

```
사용자             SaaS UI         /api/search    Redis      우리말샘     Neon
  │                  │                │            │            │          │
  │ 1. "사과" + Enter│                │            │            │          │
  │────────────────▶ │                │            │            │          │
  │                  │ 2. fetch       │            │            │          │
  │                  │───────────────▶│            │            │          │
  │                  │                │ 3. auth()  │            │          │
  │                  │                │   +status  │            │          │
  │                  │                │ 4. GET     │            │          │
  │                  │                │  search:사과│            │          │
  │                  │                │───────────▶│            │          │
  │                  │                │            │ HIT? ──┐   │          │
  │                  │                │            │       │   │          │
  │                  │                │  ┌─캐시HIT─┘       │   │          │
  │                  │                │  │  ◀─────────────┘   │          │
  │                  │                │  │  cache: "hit"      │          │
  │                  │                │  │                    │          │
  │                  │                │  └─캐시MISS────────────┘          │
  │                  │                │ 5. fetch + key       │            │
  │                  │                │─────────────────────▶│            │
  │                  │                │ 6. JSON 응답         │            │
  │                  │                │◀─────────────────────│            │
  │                  │                │ 7. SET 캐시(TTL 7일) │            │
  │                  │                │───────────▶│         │            │
  │                  │                │ 8. after()           │            │
  │                  │                │   INSERT search_logs │            │
  │                  │                │─────────────────────────────────▶│
  │                  │ 9. 응답 + cache메타                                 │
  │                  │◀──────────────│                                    │
  │ 10. 카드 렌더    │                │                                    │
  │◀─────────────────│                │                                    │
```

핵심:
- **캐시 HIT 시**: Redis만 거치고 즉시 응답. ~5ms.
- **캐시 MISS 시**: 우리말샘 호출 + 캐시 저장. ~250ms.
- **`after()`로 백그라운드 로깅**: 응답에 지연 0. Vercel 서버리스에서도 로그 손실 없음.
- **공유 캐시**: 사용자별 분리 안 함. 한 명이 검색하면 모두 즉시 응답.

관련 코드:
- `src/app/api/search/route.ts` (전체 흐름)
- `src/lib/redis.ts`, `src/lib/dictionary-api.ts`
- `src/lib/auth/api-key.ts` (verifyApiKeyFromHeader, Bearer 헤더 경로)
- `src/db/users.ts` (getOrCreateCurrentUser, Clerk 쿠키 경로)

## 4. 검색 (로컬 HUD)

```
사용자             한글             로컬HUD          SaaS /api/search    (이하 흐름 3과 동일)
  │                 │                  │                  │
  │ 1. "사과" 블록   │                  │                  │
  │────────────────▶│                  │                  │
  │ 2. F2 누름      │                  │                  │
  │────────────────▶│                  │                  │
  │                 │ 3. 클립보드      │                  │
  │                 │   브로드캐스트   │                  │
  │                 │────────────────▶ │                  │
  │                 │                  │ 4. ipcMain      │
  │                 │                  │   .handle       │
  │                 │                  │   ('search:query')│
  │                 │                  │ 5. searchDictionary()│
  │                 │                  │ 6. fetch + Bearer│
  │                 │                  │─────────────────▶│
  │                 │                  │                   │ ... 흐름 3과 동일
  │                 │                  │ 7. 응답 (camelCase)│
  │                 │                  │◀──────────────────│
  │                 │                  │ 8. snake_case 변환│
  │                 │                  │ 9. IPC로 renderer │
  │                 │                  │   에 전달         │
  │ 10. HUD 결과 표시│                  │                  │
  │◀──────────────────────────────────  │                  │
```

핵심:
- **블록 자동 잡기**: F2(blockSelectAndSearch) 또는 F3(이전 단어 자동 선택)
- **클립보드 단방향**: 한글 → HUD. 사용자 클립보드는 임시로만 사용 후 복원.
- **응답 형식 변환**: `senseNo` (SaaS) → `sense_no` (로컬 UI 호환)

관련 코드 (로컬):
- `C:\app\hudtyping\main\hotkey.ts`, `clipboard-search.ts` (단축키·캡처)
- `C:\app\hudtyping\main\dictionary-api.ts` (SaaS 호출)
- `C:\app\hudtyping\renderer\components\SearchResult.tsx` (결과 렌더)

## 5. 관리자가 회원 승인 (Phase 5에서 구현 예정)

(예정 흐름 — 구현 후 갱신)

```
관리자                SaaS /admin/users         Neon
  │                       │                      │
  │ 1. /admin/users      │                      │
  │ (role=admin 검사)    │                      │
  │─────────────────────▶│                      │
  │                       │ 2. SELECT 대기 회원  │
  │                       │─────────────────────▶│
  │ 3. 목록 표시         │                      │
  │◀──────────────────────│                      │
  │ 4. "승인" 클릭       │                      │
  │ 5. POST /admin/users/:id/approve│            │
  │─────────────────────▶│                      │
  │                       │ 6. UPDATE status='approved'│
  │                       │─────────────────────▶│
  │ 7. 토스트 + 목록 갱신 │                      │
  │◀──────────────────────│                      │
```

추가 예정: 이메일 알림(Resend), 거절 사유 메모.
