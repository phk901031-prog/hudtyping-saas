# 배포 (Phase 7)

## 사전 체크리스트
- [x] Production build 성공 (`npm run build` 통과 — 16개 라우트 정상)
- [x] `.env*` gitignore 등록 — 비밀 키 노출 위험 없음
- [x] 환경변수 6개 모두 `.env.local`에 있음 (Clerk×2, Neon×1, Upstash×2, 우리말샘×1)
- [x] DB 마이그레이션 적용 완료 (Neon에 users/search_logs/api_keys 테이블 + enum 존재)

## 배포 흐름

```
1. Git commit/push          ← 바다
2. GitHub repo 생성 + push  ← 바다
3. Vercel 가입 + import     ← 바다
4. Vercel 환경변수 설정     ← 바다 (.env.local 6개 그대로)
5. 첫 배포                  ← Vercel 자동
6. 도메인 확정              ← Vercel 자동 (예: hudtyping-saas.vercel.app)
7. 로컬 HUD의 SAAS_BASE_URL 갱신   ← 심 (Phase 4-4 진행)
8. 배포 후 검증             ← 바다 + 심
```

## Vercel 환경변수 (Production)

`.env.local`에 있는 6개를 그대로 Vercel 대시보드 → Settings → Environment Variables에 추가.

| 키 | 값 | 환경 |
|----|-----|------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` 또는 `pk_live_...` | All |
| `CLERK_SECRET_KEY` | `sk_test_...` 또는 `sk_live_...` | All |
| `DATABASE_URL` | `postgresql://.../...neon.tech/...` | All |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io` | All |
| `UPSTASH_REDIS_REST_TOKEN` | (긴 토큰) | All |
| `WOORI_KEY` | (우리말샘 키) | All |

> ⚠️ **`pk_test_`/`sk_test_`는 Clerk 개발 키**. 실 운영 시 Clerk 대시보드에서 Production Instance를 새로 만들어 `pk_live_/sk_live_` 키를 받고 갱신하는 게 권장. 다만 1년 무료 베타 운영 중에는 test 키 그대로 사용해도 동작에 문제 없음.

## 배포 후 작업

### 1. 도메인 확인
Vercel 배포 끝나면 자동 도메인이 나옴: `<repo-name>-<random>.vercel.app` 또는 깔끔하게 `<repo-name>.vercel.app`. 커스텀 도메인은 나중에.

### 2. 로컬 HUD 갱신 (Phase 4-4의 핵심)
`C:\app\hudtyping\main\dictionary-api.ts`의 `SAAS_BASE_URL` 수정:
```ts
const SAAS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://hudtyping-saas.vercel.app'  // ← 실제 도메인으로 교체
  : 'http://localhost:3000'
```
그 후 .exe 빌드 + GitHub Releases 업로드.

### 3. 검증 시나리오
```
✓ https://<도메인>/             → 랜딩 페이지 정상
✓ https://<도메인>/sign-up      → Clerk 가입 폼 (실 환경)
✓ 새 계정 가입 → /pending       → 승인 대기 페이지
✓ Neon SQL: UPDATE users SET status='approved' WHERE email='...'
✓ /dashboard 진입               → 환영 페이지
✓ /api-keys → 키 발급           → 평문 노출 + 목록 갱신
✓ /search "사과" 검색           → 결과 + cache miss → 재검색 cache hit
✓ Neon SQL: SELECT * FROM search_logs   → row 자동 기록
```

## DB 마이그레이션 정책

운영 DB 스키마 변경 시 **로컬에서 적용 후 배포** 순서:

```bash
# 1. 로컬에서 schema.ts 수정
# 2. 마이그레이션 SQL 생성
npm run db:generate

# 3. 생성된 SQL 검토 (drizzle/000X_*.sql)

# 4. Neon에 적용 (DATABASE_URL이 운영 DB를 가리키므로 .env.local의 URL이 운영용임에 주의!)
npm run db:migrate

# 5. 코드 변경 commit + push → Vercel 자동 배포
```

> 향후 운영-개발 DB 분리하려면 `.env.development.local`에 별도 dev DB URL 추가하고, `drizzle.config.ts`에서 환경 분기 처리. 지금은 단일 DB 사용.

## 자주 발생할 문제

### 빌드 실패 — TypeScript 에러
```bash
npm run build
```
로 로컬에서 먼저 확인. 통과해야 Vercel도 통과.

### 배포 후 500 에러 — 환경변수 누락
Vercel 배포 로그(Logs 탭)에서 "환경변수 X가 없습니다" 에러 확인. 빠진 키를 Settings에 추가하고 redeploy.

### Clerk webhook은 별도 활성화
- 코드는 이미 작성됨 (`/api/webhooks/clerk`)
- Clerk 대시보드 → Webhooks → Add Endpoint → URL: `https://<도메인>/api/webhooks/clerk`
- Signing Secret 받아 `CLERK_WEBHOOK_SIGNING_SECRET` 환경변수 추가
- 이벤트: `user.created`, `user.deleted` 체크
- 배포 직후 활성화 필수는 아님 (JIT가 같은 역할). 안정성을 더하고 싶을 때만.

## 다음 단계 (Phase 4-4)

배포 끝난 도메인 알려주면:
1. 로컬 HUD의 SAAS_BASE_URL 갱신
2. .exe 빌드 (`cd C:\app\hudtyping && npm run build`)
3. GitHub Releases 업로드
4. 랜딩의 다운로드 버튼 활성화 (Phase 4-1)
