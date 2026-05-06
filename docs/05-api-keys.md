# 05. API 키 발급 시스템 (Phase 4-2)

## 결과물
- `api_keys` 테이블 추가 (clerk_id FK + name + prefix + sha256 hash + last_used_at)
- 토큰 헬퍼: `generateApiKey()` / `hashToken()` / `verifyApiKeyFromHeader()`
- API 라우트: POST/GET `/api/keys`, DELETE `/api/keys/:id`
- UI: `/api-keys` 페이지 (발급/조회/삭제 + 발급 직후 평문 1회 노출)
- `/api/search` 인증 통합: API 키 헤더 OR Clerk 세션 둘 다 OK
- 보안 강화: 모든 검색에서 status='approved' 강제

## 핵심 보안 원칙

### 1. 평문은 발급 시 1회만 노출
```
[발급 응답] → plain: "hk_live_xxxxxx..." (1회만 보임)
[DB 저장] → hash: "a3b2c1..." (SHA256), prefix: "hk_live_xxxxxx" (식별용)
[사용자 손] → 비밀번호 관리자 또는 로컬 HUD 설정에 즉시 복사
```

### 2. DB 유출되어도 평문 복원 불가
SHA256은 일방향 해시. DB 통째로 유출돼도 사용자 토큰을 복원할 수 없음. 비밀번호와 같은 원리.

### 3. prefix는 식별용
사용자가 키 목록에서 "어, 이게 그 키구나" 알 수 있게 앞 16자만 보여줌. 보안 영향 없음 (해시 입력값 추측 불가).

### 4. 사용자 본인만 자기 키 다룰 수 있음
- GET/POST `/api/keys` → Clerk 세션의 userId로 본인 것만 조회/생성
- DELETE `/api/keys/:id` → `WHERE id=? AND clerk_id=?` 강제 (남의 id 추측해도 못 지움)

### 5. status='pending'은 검색 못 함
승인 안 된 사용자가 키 발급해도, `/api/search`에서 status 검사로 차단. layout이 아닌 API 라우트 자체에서도 안전 장치.

## 토큰 형식

```
hk_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ012345678901234567
└──┬──┘ └──────────────────────┬──────────────────────┘
prefix              base64url(crypto.randomBytes(32))
```

- `hk` = hudtyping
- `live` = 운영 환경 (나중에 'test' 추가해서 테스트 키 분리 가능)
- 32바이트 → 256비트 → 사실상 충돌 불가능

## /api/search의 두 인증 경로

```
요청
 ├─ Authorization: Bearer hk_live_...  → verifyApiKeyFromHeader()
 │     ├─ DB에서 hash 매치 + status='approved' 확인
 │     └─ 통과 → user 반환 + last_used_at 갱신
 │
 └─ (헤더 없음)  → getOrCreateCurrentUser() (Clerk 쿠키)
       ├─ DB에 없으면 JIT 생성
       └─ status='approved' 확인 → 통과
```

→ 브라우저 검색 페이지는 쿠키로, 로컬 HUD는 헤더로. 자연스럽게 분리됨.

## 사용 예 (로컬 HUD 또는 curl)

```bash
# 1) SaaS 대시보드 → /api-keys → "내 노트북" 발급
# 2) 응답에서 평문 복사: hk_live_aBcD...

# 3) curl로 검색 호출
curl -H "Authorization: Bearer hk_live_aBcD..." \
     "https://hudtyping-saas.com/api/search?q=사과"

# {
#   "query": "사과",
#   "total": 5,
#   "items": [...],
#   "cache": "hit"
# }
```

## 검증 시나리오 (수동, 브라우저 + curl)

1. `/dashboard` → "🔑 API 키" 카드 클릭 → `/api-keys`
2. "내 노트북" 입력 → 발급 → 노란 박스에 평문 1회 노출
3. 평문 복사 → 다른 메모장에 붙여넣기 (보관)
4. "확인" 닫고 → 키 목록에 prefix만 표시 확인
5. 터미널에서:
   ```bash
   curl -H "Authorization: Bearer <복사한 평문>" \
        "http://localhost:3000/api/search?q=사과"
   ```
   → 검색 결과 JSON + `"cache": "hit"` (이미 캐시됨)
6. SaaS의 `/api-keys` 새로고침 → "최근 사용" 시각이 방금으로 갱신
7. 키 "삭제" 클릭 → 다시 curl 호출 → `401 Unauthorized`

## 다음 단계 (Phase 4-3)
로컬 HUD(`C:\app\hudtyping`) 코드를 수정해서 우리말샘 직접 호출 → SaaS의 `/api/search` 호출로 전환.
