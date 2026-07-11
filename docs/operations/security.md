# 보안 운영 정책

## 키/토큰 관리

| 종류 | 위치 | 보호 |
|------|------|------|
| 우리말샘 API 키 (`WOORI_KEY`) | SaaS `.env` (Vercel) | 절대 클라이언트 노출 X |
| Clerk Secret Key | SaaS `.env` (Vercel) | 동일 |
| Clerk Publishable Key | 클라이언트 노출 (`NEXT_PUBLIC_*`) | Clerk이 의도적으로 공개 |
| 사용자 API 키 (`hk_live_...`) | 사용자 디바이스 | DB는 SHA-256 해시만 저장, 평문 1회 노출 |
| Clerk webhook signing secret | SaaS `.env` (Vercel) | webhook 활성화 시 |

## 빌드 보안

### 새 .exe 출시 시
1. 빌드 → SHA-256 계산
2. `scripts/register-binary.mjs <exe> <version>` → SaaS DB에 등록
3. GitHub Release 업로드
4. 검증: 무인증 사용자가 API 호출 → 401 (정상)

### 등록 안 된 hash — 현재 제한 사항

현재는 일부 백신/NSIS 환경에서 정상 설치 파일의 전체 EXE 해시가 달라지는 문제가 있어 `verifyApiKeyFromHeader`가 **모니터링 모드**로 동작한다. 해시 누락·불일치를 기록하지만 API 키와 승인 상태가 유효하면 요청을 허용한다. 따라서 아래의 기존 문구처럼 “등록되지 않은 해시를 즉시 401로 거부”한다고 간주하면 안 된다.

- 위험: 유효한 사용자 토큰이 유출된 경우 공식 바이너리가 아닌 클라이언트에서도 호출할 수 있다.
- 현재 완화책: 토큰 해시 저장, 사용자 승인 확인, 월간 quota, 사용자별 분당 rate limit.
- 키 발급/폐기와 관리자 변경 API에도 짧은 창 rate limit을 적용해 반복 mutation을 제한한다.
- 상세 조회 서비스도 route 밖에서 재사용될 수 있으므로 `target_code` 형식을 서비스 경계에서 다시 검증한다.
- strict 전환 조건: NSIS/백신 후처리의 영향을 받지 않는 ASAR 또는 서명 기반 식별자를 데스크톱 앱이 전송하고, 정상 사용자 표본에서 오탐이 없음을 확인할 것.
- 전환 작업: 데스크톱 v0.3.0에서 새 식별자를 배포한 뒤 서버에서 구버전 유예 기간을 두고 strict 정책을 활성화한다.

## 사고 대응 플레이북

### 사용자 API 키 유출 의심
1. SaaS의 `/admin/users` → 해당 사용자 → 키 삭제 (또는 본인이 `/api-keys`에서 삭제)
2. 새 키 재발급 안내
3. 유출된 키로 검색 시도하면 401 즉시

### 변조된 .exe 발견
1. official_binaries에서 해당 hash 즉시 제거 (DB UPDATE)
2. Redis 캐시도 무효화: `redis.del("binary:<hash>")`
3. 그 .exe 사용자는 즉시 검색 불가
4. 영향 받은 사용자에게 카카오톡 안내

### Vercel 다운
- Vercel 대시보드에서 Status 확인
- 다른 region (icn1 → hnd1)으로 임시 변경
- 사용자에게 카카오톡 공지

### Neon DB 유출
- 즉시 DATABASE_URL 새로 발급 (Neon 대시보드)
- Vercel 환경변수 갱신 + 재배포
- 영향 평가 + 사용자 통지 (개인정보 처리방침 따라)

### Upstash Redis 다운
- Redis 캐시는 부수적 — 우리말샘 직접 호출 fallback
- 다만 quota 캐싱·binary 검증 캐시도 영향 → DB hit 증가
- 사용자 영향: latency만 ↑

## 책임 분담

| 역할 | 책임 |
|------|------|
| Vercel | SaaS 호스팅 + Edge Network + DDoS 보호 |
| Neon | DB 가용성·백업 (point-in-time 7일 무료) |
| Upstash | Redis 가용성 |
| Clerk | 인증·OAuth·세션 |
| 운영자 (바다) | 키 관리·승인·.exe 빌드·hash 등록·사고 대응 |

## 정기 점검 (월 1회 권장)

- [ ] Vercel·Neon·Upstash·Clerk 무료 한도 사용량 확인
- [ ] official_binaries 테이블에 옛 버전 정리 (deprecated 표시)
- [ ] search_logs 양 모니터링 (DB 0.5GB 무료 한도)
- [ ] npm audit (의존 취약점)
- [ ] 비활성 사용자 (90일 미접속) 검토
