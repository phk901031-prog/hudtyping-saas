# Phase 4-2: API 키 발급 시스템 — 완료

날짜: 2026-05-05

## 완료된 작업
- [x] `api_keys` 테이블 추가 + 마이그레이션 (drizzle/0002_workable_wildside.sql)
- [x] 토큰 헬퍼 (`src/lib/auth/api-key.ts`): generateApiKey, hashToken, verifyApiKeyFromHeader
- [x] API 라우트:
  - POST `/api/keys` — 새 키 발급 (응답에 평문 1회만 포함)
  - GET  `/api/keys` — 내 키 목록 (prefix만, 평문/해시 제외)
  - DELETE `/api/keys/:id` — 본인 키만 삭제
- [x] UI 페이지 `/api-keys` (발급 직후 평문 강조 노출 + 키 목록 + 삭제)
- [x] `/api/search`에 두 인증 방식 통합 (Bearer 헤더 OR Clerk 쿠키) + status='approved' 검사

## 보안 결정
- **평문 비저장**: SHA256 해시만 DB에. 평문은 발급 응답으로만 1회 노출.
- **prefix 식별**: 앞 16자만 표시 (보안 영향 없음, UX용)
- **본인만 다룸**: WHERE clerk_id 강제로 권한 격리
- **status 검사 보강**: API 키 인증·세션 인증 둘 다 status='approved' 강제

## 자동 검증
- /api-keys 307 (비로그인 → /sign-in)
- /api/keys 401 (비로그인)
- /api/search?q=test 401 (헤더 없음 또는 잘못된 Bearer)

## 수동 검증 (바다 직접 필요)
docs/05-api-keys.md의 "검증 시나리오" 절 참고.

## 다음
Phase 4-3: 로컬 HUD(`C:\app\hudtyping`)의 `main/dictionary-api.ts` 수정해서
우리말샘 직접 호출 → SaaS의 `/api/search` 호출로 전환.
