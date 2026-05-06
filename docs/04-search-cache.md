# 04. 우리말샘 검색 + Redis 캐싱 (Phase 3)

## 결과물
- `@upstash/redis@1.37` 설치, `src/lib/redis.ts`로 클라이언트 1개
- `src/lib/dictionary-api.ts` — 우리말샘 API 호출 + snake_case → camelCase 정규화
- `src/app/api/search/route.ts` — 인증 → 캐시 → 우리말샘 → 캐시 저장 → 백그라운드 로깅
- `src/app/(dashboard)/search/page.tsx` — 검색 UI (검색바 + 결과 카드 + 캐시 hit/miss 표시)
- `search_logs` 테이블 추가 + 마이그레이션 (사용자별 검색 통계)

## 핵심 흐름

```
[브라우저: 검색바에 "사과" 입력 + Enter]
  ↓ fetch("/api/search?q=사과")
[Next.js API 라우트]
  1. auth() → userId 확인 (없으면 401)
  2. Redis: get("search:사과")
       ↳ HIT → 즉시 반환 (~5ms)
       ↳ MISS → 우리말샘 호출 (~200~500ms)
                set("search:사과", result, ex=7d)
  3. 응답 즉시 반환
  4. after(() => insert into search_logs ...)  ← 응답 지연 0
[브라우저: 결과 카드 렌더 + 캐시 hit/miss 표시]
```

## 우리말샘 API 명세

| 항목 | 값 |
|------|------|
| Endpoint | `https://opendict.korean.go.kr/api/search` |
| Method | GET |
| 파라미터 | `key` (API 키), `q` (검색어), `req_type=json` |
| 응답 | `channel.item[].sense[]` 중첩 구조 |
| 한도 | 일 5만 호출 (캐시 적용 시 사실상 무제한) |

응답 정규화 (`searchUrimalsaem()`):
```ts
// 우리말샘 원본 (snake_case)              → 우리 형식 (camelCase)
{ channel: { item: [{ word, sense: [...] }] } }
                        ↓
{ query, total, items: [{ word, senses: [{ definition, pos, cat, origin, link, senseNo }] }] }
```

## 캐시 설계

### 키 구조
```
search:{검색어}
예) search:사과, search:회의록, search:속기
```
사용자별로 분리하지 않음 — **모든 사용자가 같은 캐시 공유**가 핵심 효용.
한 명이 검색하면 다른 모두가 즉시 응답 받음 → 1년 무료 운영의 비용 절감 핵심.

### TTL: 7일
사전 데이터는 거의 안 바뀜 → 7일 캐시도 안전. 짧으면 캐시 효율 떨어지고, 너무 길면 데이터 갱신 지연.

### "결과 없음"도 캐시
검색어가 사전에 없는 경우(`items: []`)도 캐시. 안 그러면 "asdfqwer" 같은 오타를 반복해도 매번 우리말샘 호출됨.

## Next.js 16의 `after()` API

응답을 즉시 보내고, 그 후에 백그라운드 작업을 실행하는 빌트인 헬퍼.

```ts
import { after } from "next/server";

export async function GET() {
  const result = ...;
  after(() => logSearch(...));  // 응답이 나간 뒤에 실행
  return Response.json(result);
}
```

**왜 좋은가**:
- 사용자가 받는 응답 시간 = 검색 결과 반환까지만 (로깅 시간 안 더해짐)
- Vercel serverless 환경에서도 함수가 응답 후 종료되지 않고 백그라운드 작업 마무리

이 패턴이 없을 때:
- `await db.insert(...)` → 응답에 +50ms
- 또는 `db.insert(...)` (await 없음) → Vercel serverless에서 응답 후 함수 종료되며 INSERT 끊길 수 있음

## search_logs 테이블

```sql
CREATE TABLE "search_logs" (
  "id" serial PRIMARY KEY,
  "clerk_id" text NOT NULL REFERENCES users(clerk_id) ON DELETE CASCADE,
  "query" text NOT NULL,
  "cache_hit" boolean NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
CREATE INDEX search_logs_clerk_id_idx ON search_logs(clerk_id);
CREATE INDEX search_logs_query_idx ON search_logs(query);
CREATE INDEX search_logs_created_at_idx ON search_logs(created_at);
```

분석 가능한 것:
- **사용자별 활동량** (1년 후 유료화 협상 카드)
- **인기 검색어 top N** (`GROUP BY query ORDER BY COUNT(*) DESC`)
- **캐시 적중률** (`AVG(cache_hit::int)`)
- **시간대별 패턴**

## 캐시 효과 수치

| 시나리오 | 지연 | 우리말샘 호출 |
|---------|-----|--------------|
| 캐시 HIT | ~5ms | 0회 |
| 캐시 MISS | ~250ms | 1회 |

같은 단어를 1만 사용자가 검색해도 우리말샘은 **1회만 호출** (첫 사용자). 일 5만 한도가 충분한 이유.

## UI 패턴

검색 페이지(`/search`)는 클라이언트 컴포넌트(`"use client"`):
- 검색 입력은 즉각적인 인터랙션 필요 → 클라이언트
- `(dashboard)/layout.tsx`가 자동으로 인증/승인 검사 → 페이지 자체에는 검사 코드 없음
- 캐시 hit/miss를 색상으로 시각화 (학습용 + 디버깅 편리)

## 검증 시나리오 (실제 동작)
1. `/search`에서 "사과" 검색 → "캐시 × 새로 조회" (주황) — 우리말샘 호출
2. 다시 "사과" 검색 → "캐시 ✓ 적중" (초록) — Redis에서 즉시
3. Neon SQL Editor에서:
   ```sql
   SELECT clerk_id, query, cache_hit, created_at FROM search_logs ORDER BY created_at DESC;
   ```
   → 두 줄: `(나, 사과, false, ...)`, `(나, 사과, true, ...)` 표시
4. Upstash Console → Data Browser → `search:사과` 키가 실제로 존재 확인

## 다음 Phase

⚠️ **Phase 4 방향 변경 (2026-05-05)**: 원래 플랜의 TipTap 회의록 워크스페이스 → **로컬 Electron HUD 통합**으로 교체.

이유:
- 바다(주 사용자)는 한글 워드프로세서로 회의록을 작성 (양식 준수)
- 핵심 가치는 "Alt+Tab 없이 단축키로 자동 단어 검색" → 이건 OS 권한이라 웹 불가능
- 따라서 SaaS는 **로컬 HUD 보급 + 인증/검색 백엔드** 역할로 재정의

Phase 4 새 정의:
- 4-1: 랜딩 다운로드 CTA + 사용법 안내
- 4-2: 사용자별 API 키 발급 시스템 (로컬 HUD가 SaaS API 호출할 때 인증용)
- 4-3: 로컬 HUD 코드 수정 (`C:\app\hudtyping`) — 직접 우리말샘 호출 → SaaS의 `/api/search` 호출
- 4-4: .exe 빌드 + GitHub Releases 호스팅
- 4-5: 사용 통계 대시보드 (우리는 Phase 3-4에서 이미 search_logs 깔아놨음)
