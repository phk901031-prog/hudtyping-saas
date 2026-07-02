# 아키텍처 개요

## 구성

```text
사용자 PC
  한글 문서
  로컬 HUD Electron 앱

SaaS
  Next.js 16
  Clerk 인증
  Neon PostgreSQL
  Upstash Redis
  우리말샘 API 프록시
  GitHub Releases 배포
```

## 계층

| 계층 | 위치 | 역할 |
| --- | --- | --- |
| Presentation | `src/app`, `renderer/pages` | 웹 화면, HUD 화면 |
| Application | `src/features/*` | 인증, 검색, 관리자, 통계 유스케이스 |
| Infrastructure | `src/infrastructure/*`, `main/*` | DB, Redis, Clerk, 우리말샘, Electron IPC |
| Domain Data | `src/infrastructure/db/schema.ts` | users, api_keys, search_logs, dictionary_cache |

## 검색 흐름

```text
한글 문서 커서
  -> HUD 커서 앞 검색
  -> SaaS /api/search
  -> 사용자 API 키 검증
  -> 월 한도 확인
  -> Redis 캐시 확인
  -> Neon 장기 사전 캐시 확인
  -> 우리말샘 API 호출
  -> 캐시 저장
  -> 검색 로그 기록
  -> HUD 결과 표시
```

## 제품 UI 원칙

- 사용자에게는 `커서 앞 검색` 하나로 설명한다.
- 블록 검색은 기본 UI에서 제거한다.
- 연속 입력은 검색 결과를 기다리지 않고 입력 횟수만큼 먼저 확장한다.
- 오류 메시지는 짧고 업무 중단을 줄이는 표현을 사용한다.

## 운영 포인트

- 관리자 화면에서 승인, 한도, 사용자별 검색 이력, 인기 검색어를 확인한다.
- 응답 속도는 Redis 캐시와 Neon 장기 캐시로 개선한다.
- 외부 우리말샘 장애 시 신규 단어 검색은 영향을 받을 수 있다.
