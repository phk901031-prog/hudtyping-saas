# 버전 정책

## 시맨틱 버전 (Semantic Versioning)

`MAJOR.MINOR.PATCH` (예: 0.2.0)

| 종류 | 의미 | 예시 |
|------|------|------|
| MAJOR | 호환성 깨지는 변경 | API 응답 구조 변경, 인증 방식 변경 |
| MINOR | 새 기능 추가 (호환) | 즐겨찾기 추가, 통계 차트 추가 |
| PATCH | 버그 수정 (호환) | UI 글자 오타 수정, 한도 계산 버그 |

## 두 프로젝트의 버전 분리

| 프로젝트 | 위치 | 현재 | 정식 출시 |
|---------|------|------|----------|
| **SaaS (웹)** | `C:\app\new-hudtyping-saas` | v1.0.0 부터 | Phase 7 배포 = 1.0 |
| **로컬 HUD (.exe)** | `C:\app\hudtyping` | v0.x.y (베타) | v1.0.0 = 유료화 시점 |

→ **SaaS는 1.x.y, HUD는 0.x.y로 별도 lifecycle**.

이유:
- SaaS는 이미 사용 중 (playsteno.com) — 운영 단계로 봐서 1.0
- HUD는 베타 운영 (1년 무료) — 정식 출시 = 유료화 lock 도입 시점

## SaaS API 버전

현재 모든 API 라우트 = v1 묵시적.

향후 호환성 깨질 때:
- 새 API: `/api/v2/search`
- 옛 API: `/api/search` 유지 (deprecation period 최소 30일)
- HUD 버전이 너무 옛날이면 SaaS가 강제 업데이트 메시지

## HUD - SaaS 호환성 매트릭스

| HUD 버전 | SaaS API |
|---------|----------|
| v0.1.0 | v1 (인증 헤더 X-Client-Hash 없음) — Phase 8 적용 후 거부 |
| v0.2.0+ | v1 (X-Client-Hash 헤더 포함) ✓ |

**v0.1.0 사용자는 v0.2.0으로 강제 업그레이드** (어차피 베타 단계 사용자 1~5명 수준).

## 변경 이력 기록

각 버전 출시 시 GitHub Release의 "Description"에 기록:

```markdown
## v0.2.0 (2026-05-08)

### Security
- asar 무결성 검증 (Electron fuses)
- JS 난독화
- SaaS 측 binary hash 검증

### Features
- electron-updater 통합 (자동 업데이트)

### Breaking
- v0.1.0과 호환 X — 새로 다운받아 설치 필요
```

이 기록이 사용자가 보는 changelog. SaaS 매뉴얼의 "버전 노트" 섹션과 동일.

## 버전 bump 명령

### HUD
```bash
cd C:\app\hudtyping
npm version patch    # 0.2.0 → 0.2.1
npm version minor    # 0.2.0 → 0.3.0
npm version major    # 0.2.0 → 1.0.0
```

### SaaS (보통 자동, 명시 안 해도 OK)
```bash
cd C:\app\new-hudtyping-saas
npm version patch
```

→ package.json 버전 갱신 + git tag 자동 생성

## 1.0.0 출시 기준 (HUD)

다음 모두 충족 시 베타 종료 → 1.0:
- [ ] 활성 사용자 50명+ 누적
- [ ] 결제 시스템 (Stripe) 연동 완료
- [ ] EV 코드 서명 인증서 발급
- [ ] electron-updater + GitHub Actions CI 안정 운영 1개월+
- [ ] 주요 버그 신고 0 (1주 기준)
