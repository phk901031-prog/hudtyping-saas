# Phase 3: 우리말샘 검색 + Redis 캐싱 — 완료

날짜: 2026-05-05

## 완료된 Step
- [x] 3-1: Upstash Redis 가입 + URL/TOKEN `.env.local` 저장, WOORI_KEY 추가
- [x] 3-2: `/api/search` 라우트 (인증 → Redis 캐시 → 우리말샘 → Redis 저장)
- [x] 3-3: 검색 페이지 UI (검색바 + 결과 카드 + 캐시 hit/miss 표시)
- [x] 3-4: `search_logs` 테이블 + Next.js 16 `after()`로 백그라운드 로깅

## 만들어진 파일
- `src/lib/redis.ts` — Upstash Redis 클라이언트 (`Redis.fromEnv()`)
- `src/lib/dictionary-api.ts` — 우리말샘 호출 + snake_case → camelCase 정규화
- `src/app/api/search/route.ts` — 인증 → 캐시 → API → 로깅
- `src/app/(dashboard)/search/page.tsx` — 클라이언트 검색 UI
- `src/app/(dashboard)/dashboard/page.tsx` 수정 — "🔍 우리말샘 검색" 진입 카드
- `src/db/schema.ts` 수정 — `searchLogs` 테이블 + 3개 인덱스
- `drizzle/0001_spooky_chimera.sql` — 자동 생성 마이그레이션

## 패키지
- `@upstash/redis@1.37`

## 주요 발견
- **Next.js 16 `after()`**: 응답 즉시 보내고 백그라운드 작업 실행 → 로깅이 응답 지연 0
- **공유 캐시 전략**: 사용자별 분리 안 함 → 1만 명이 같은 단어 검색해도 우리말샘은 1회만 호출
- **0건 결과도 캐시**: 오타 반복으로 외부 호출 발사되는 거 차단

## 검증 결과
- 검색 페이지 정상 (캐시 miss → 약 250ms, hit → 약 5ms)
- 같은 단어 두 번째부터 hit 표시 ✓
- search_logs에 row 자동 기록 (백그라운드)

## Phase 4 방향 변경
원래 "TipTap 회의록 워크스페이스" → **"로컬 Electron HUD 통합"**으로 교체.
이유: 바다는 한글 워드프로세서에서 회의록 작성 → 워크스페이스 시나리오 미해당.
SaaS는 로컬 HUD 보급 + 인증/검색 백엔드로 재정의.

자세한 내용: `C:\Users\바다\.claude\projects\c--app-new-hudtyping-saas\memory\project_direction.md`

## 다음 Phase
Phase 4 새 정의:
- 4-1: 랜딩 다운로드 CTA
- 4-2: 사용자별 API 키 발급 시스템
- 4-3: 로컬 HUD가 SaaS의 /api/search 호출하도록 수정 (`C:\app\hudtyping`)
- 4-4: .exe 빌드 + GitHub Releases 호스팅
- 4-5: 사용 통계 대시보드 (search_logs 활용)
