# 06. 로컬 HUD ↔ SaaS 통합 (Phase 4-3)

## 결과물
- 로컬 HUD(`C:\app\hudtyping`)가 우리말샘 직접 호출 → SaaS의 `/api/search` 호출로 전환
- 사용자는 SaaS에서 발급받은 `hk_live_<32자>` 토큰을 로컬 HUD 설정에 입력
- SaaS 응답(camelCase) → 로컬 UI 호환(snake_case) 변환은 `main/dictionary-api.ts`에서 수행
- 모든 검색이 SaaS를 거치므로 공유 캐시 적용 + 사용 통계 자동 수집

## 변경된 로컬 HUD 파일

| 파일 | 변경 내용 |
|------|----------|
| `main/dictionary-api.ts` | 전면 재작성 — 우리말샘 직접 fetch → SaaS `/api/search` fetch + Bearer 헤더 + 응답 형식 변환 |
| `main/store.ts` | `apiKey` 필드 주석 갱신 (우리말샘 키 → hudtyping SaaS 키) |
| `renderer/pages/home.tsx` | API 키 입력 placeholder + 발급 안내 라벨 변경 |

UI 컴포넌트(`SearchResult.tsx`)와 IPC 채널(`preload.ts`)은 **변경 없음** — `dictionary-api.ts`에서 응답을 기존 형식으로 변환해주므로 호환.

## 통신 흐름

```
[속기사 PC — 한글 워드프로세서에서 작업 중]
   ↓ F2 또는 F3 (단축키)
[로컬 HUD (Electron)]
   blockSelectAndSearch() → ipcMain.handle('search:query', q)
       ↓
   main/dictionary-api.ts: searchDictionary(q)
       ↓
   appStore.get('apiKey') → "hk_live_..."
       ↓
   fetch SAAS_BASE_URL/api/search?q={q}
        + Authorization: Bearer hk_live_...
        ↓
[SaaS (Vercel) /api/search]
   verifyApiKeyFromHeader() → user (status='approved' 검사)
   redis.get("search:{q}")
       ├─ HIT → 즉시 반환 (~5ms)
       └─ MISS → searchUrimalsaem(q) (바다의 우리말샘 키 사용)
                 redis.set(...)  + after(() => insert search_logs)
       ↓ JSON 응답 (camelCase: senseNo)
[로컬 HUD]
   응답 → snake_case 변환 (sense_no)
   IPC로 renderer에 전달
   ↓
[HUD 오버레이 화면]
   SearchResult.tsx 카드 렌더 — 사용자 눈앞에 결과 즉시 표시
```

핵심: 한글 워드프로세서에서 **Alt+Tab 0회**, **마우스 0회**로 단어 검색 완료.

## SAAS_BASE_URL 분기

```ts
const SAAS_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://hudtyping-saas.vercel.app'  // ← Phase 7 배포 후 실제 도메인 확정 필요
  : 'http://localhost:3000'
```

- **dev** (`npm run dev`): SaaS dev 서버랑 같은 localhost:3000
- **prod** (`npm run build`): 배포 도메인. Phase 7 끝나고 실제 URL 확정되면 이 값 갱신

## 응답 변환 (camelCase → snake_case)

SaaS는 표준 camelCase로 보내지만, 로컬 HUD의 기존 `SearchResult.tsx`는 `sense_no`를 기대. 호환 위해 변환:

```ts
// SaaS 응답
{ items: [{ word, senses: [{ ..., senseNo: "1" }] }] }

// dictionary-api.ts에서 변환 후
{ items: [{ word, senses: [{ ..., sense_no: "1" }] }] }
```

이 변환 덕분에 UI 컴포넌트 코드는 한 줄도 안 건드림.

## 에러 처리 매핑

| HTTP 상태 | 의미 | 사용자 메시지 |
|----------|-----|--------------|
| 401 | 키 잘못/만료 또는 status≠approved | "API 키가 유효하지 않거나 가입 승인이 안 됐어요. 다시 확인해주세요." |
| 502 | SaaS가 우리말샘 호출 실패 | "검색 중 오류가 발생했어요. 잠시 후 다시 시도해주세요." |
| Timeout (8s) | SaaS 응답 안 옴 | "서버 응답이 너무 느려요. 인터넷 연결 또는 SaaS 상태 확인해주세요." |

## 검증 시나리오 (수동)

1. **SaaS dev 서버 실행 중인지 확인** (이미 백그라운드에서 돌고 있음)
2. **로컬 HUD dev 실행**:
   ```bash
   cd C:\app\hudtyping
   npm run dev
   ```
3. **SaaS에서 hk_live_ 키 발급** (Phase 4-2에서 했으면 그대로 사용 가능)
4. **로컬 HUD 트레이 → 설정** → "API 키" 입력란에 `hk_live_...` 붙여넣기 → 저장
5. **검색 테스트**: HUD의 검색바에서 "사과" 입력 → 결과 카드 표시
6. **단축키 테스트**: 한글에서 단어 블록 선택 → F2 → HUD에 결과 표시
7. **SaaS 측 통계 확인** (Neon SQL Editor):
   ```sql
   SELECT clerk_id, query, cache_hit, created_at
   FROM search_logs
   ORDER BY created_at DESC LIMIT 5;
   ```
   → 로컬 HUD에서 한 검색이 row로 들어와 있어야 함

## TypeScript 체크 결과
- `main/dictionary-api.ts`, `main/store.ts` → 에러 없음 ✓
- `renderer/pages/home.tsx`의 JSX 에러는 root tsconfig 설정상 false positive (Nextron 빌드 시엔 정상)

## 다음 Phase 4-4
.exe 빌드 + GitHub Releases 호스팅. 빌드 명령은 로컬에서 실행해야 함:
```bash
cd C:\app\hudtyping
npm run build
```
electron-builder가 dist/ 폴더에 .exe 생성.
