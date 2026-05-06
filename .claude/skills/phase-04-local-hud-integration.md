# Phase 4-3: 로컬 HUD ↔ SaaS 통합 — 코드 변경 완료

날짜: 2026-05-05

## 변경된 파일 (`C:\app\hudtyping`)
- [x] `main/dictionary-api.ts` — 전면 재작성 (우리말샘 직접 → SaaS `/api/search`)
- [x] `main/store.ts` — apiKey 주석 갱신 (의미 변경)
- [x] `renderer/pages/home.tsx` — placeholder + 발급 안내 라벨

## 변경 안 한 파일 (호환성 유지)
- `renderer/components/SearchResult.tsx` — `sense_no` 그대로 사용 (dictionary-api에서 변환)
- `main/preload.ts` — IPC 채널 동일
- `main/main.ts` — IPC 핸들러 동일

## 핵심 설계
- 응답 변환은 `dictionary-api.ts` 내부에서 (camelCase ↔ snake_case)
- SAAS_BASE_URL은 `NODE_ENV` 분기 (dev: localhost:3000, prod: TODO Phase 7)
- 8초 타임아웃 + 401/502 별도 안내

## 자동 검증
- TypeScript 에러: 우리 변경 파일에는 없음 (다른 파일의 JSX 에러는 root tsconfig 한계, Nextron 빌드 시 정상)

## 수동 검증 (바다 직접)
1. SaaS dev 서버 켜져 있는 상태에서
2. `cd C:\app\hudtyping && npm run dev` 실행
3. 트레이 → 설정 → hk_live_ 키 입력
4. HUD 검색바 또는 한글 단축키로 단어 검색
5. SaaS의 `search_logs` 테이블에 row 들어옴 확인

## 다음 Phase 4-4
.exe 빌드 + GitHub Releases 호스팅. 빌드는 바다 PC에서 실행 필요 (electron-builder).
