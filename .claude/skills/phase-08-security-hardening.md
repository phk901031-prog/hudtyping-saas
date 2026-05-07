# Phase 8: 보안 강화 — 완료 기록

날짜: 2026-05-08

## 적용된 SaaS 측 변경

### 새 인프라
- `users.first_name`, `users.last_name` 컬럼 (Phase 8 직전 추가)
- `official_binaries` 테이블 (id, version, sha256 UNIQUE, released_at, notes)

### 새 모듈
- `src/features/security/binary-verification.ts` — `isOfficialBinary(hash)`
- `src/app/api/verify-client/route.ts` — POST {sha256} → {verified: bool}

### 인증 강화
- `verifyApiKeyFromHeader(authHeader, clientHash)` 시그니처 변경
- Bearer 인증은 X-Client-Hash 헤더 필수 — 누락/매치실패 → null
- `authenticate(req)`가 X-Client-Hash 헤더 추출해 전달

### 레이어 분리
- `features/search/service.ts` → `service.ts` + `logger.ts` + `stats.ts`
- `features/admin/service.ts` → `permissions.ts` + `users.ts` + `stats.ts`
- import 경로 갱신: route.ts, page.tsx 5곳

## 자동 검증
- 빌드 통과 (19 routes)
- TypeScript 0 에러
- Drizzle check 정상

## 효과
- 변조된 .exe → SaaS 인증 거부 → 검색 불가
- v0.1.0 사용자 → 강제로 v0.2.0 업그레이드 (X-Client-Hash 없으면 거부)

## 다음 (Phase 9)
- 로컬 HUD 측 작업 (electronFuses, autoUpdater, hash 헤더)
- 새 .exe v0.2.0 빌드
- official_binaries에 등록
- GitHub Release

## 한계 (인정)
- 결정한 공격자의 우회는 본질적으로 불가능
- 일반 사용자 99% 차단으로 충분
- 향후 EV 인증서 + native binary 등으로 추가 강화 가능
