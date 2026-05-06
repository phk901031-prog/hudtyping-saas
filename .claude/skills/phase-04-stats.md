# Phase 4-5: 사용 통계 대시보드 — 완료

날짜: 2026-05-05

## 결과물
- `/stats` 페이지 (서버 컴포넌트, RSC)
- 대시보드에 "📊 내 검색 통계" 진입 카드 추가

## 표시 섹션
1. **요약 카드**: 총 검색 횟수 / 캐시 적중률 (% + 건수) / 첫 검색일
2. **최근 검색어** 10건: query + cache hit 표시 + 시각
3. **자주 찾은 단어** top 10: query + 횟수

## 핵심 쿼리 (Drizzle)
- 요약: `count()` + `SUM(CASE WHEN cache_hit ...)` + `MIN(created_at)` 한 쿼리에 집계
- 최근: `ORDER BY created_at DESC LIMIT 10`
- 인기: `GROUP BY query ORDER BY COUNT(*) DESC LIMIT 10`
- 모두 `WHERE clerk_id = ?`로 본인 데이터만

## 인덱스 활용
search_logs 테이블의 인덱스가 효과적으로 사용됨:
- `search_logs_clerk_id_idx` → WHERE clerk_id 빠름
- `search_logs_query_idx` → GROUP BY query 빠름
- `search_logs_created_at_idx` → ORDER BY created_at 빠름

(Phase 3-4에서 미리 깔아둔 인덱스가 그대로 쓰임)

## 자동 검증
- /stats 307 (비로그인 → /sign-in, dashboard layout 보호 정상)

## 수동 검증 (바다)
1. 로그인 후 `/dashboard` → "📊" 카드 클릭
2. 요약 카드 + 최근 검색어 + 인기 검색어 표시 확인
3. 검색 더 한 뒤 새로고침 → 숫자 갱신 확인

## 다음
Phase 4-4 (.exe 빌드 + GitHub Releases) — 바다 PC + GitHub 계정 필요
Phase 4-1 (랜딩 다운로드 CTA) — 4-4 후 URL 확정되면
