# 06. 로컬 HUD와 SaaS 통합

## 현재 구조

로컬 HUD는 우리말샘 API를 직접 호출하지 않고 SaaS의 `/api/search`를 호출한다.

```text
한글 문서
  -> 커서 앞 검색 단축키
  -> 로컬 HUD
  -> SaaS /api/search
  -> Redis / Neon dictionary_cache
  -> 필요 시 우리말샘 API
  -> HUD 결과 표시
```

## 로컬 HUD 주요 파일

| 파일 | 역할 |
| --- | --- |
| `C:\app\hudtyping\main\hotkey.ts` | 커서 앞 검색 단축키 등록 |
| `C:\app\hudtyping\main\clipboard-search.ts` | 커서 앞 단어 선택, 연속 확장, 클립보드 캡처 |
| `C:\app\hudtyping\main\dictionary-api.ts` | SaaS `/api/search` 호출 |
| `C:\app\hudtyping\main\store.ts` | API 키, 단축키, 투명도 등 설정 저장 |
| `C:\app\hudtyping\renderer\pages\home.tsx` | HUD UI와 설정 화면 |

## 커서 앞 검색 흐름

v0.2.2 기준:

1. 사용자가 지정 단축키를 누른다.
2. 짧은 debounce 시간 동안 연속 입력 횟수를 모은다.
3. 입력 횟수만큼 `Ctrl+Shift+Left`를 실행해 앞쪽 단어까지 선택한다.
4. 선택된 텍스트를 한 번만 복사한다.
5. SaaS에 한 번만 검색 요청한다.
6. 이전 검색이 늦게 도착해도 최신 검색 결과만 HUD에 표시한다.

## 오류 메시지

외부 API 또는 서버 응답이 늦으면 HUD에는 `우리말샘 응답 지연 중`이라고 표시한다.

## 배포

```powershell
cd C:\app\hudtyping
npm.cmd run build
```

생성 산출물:

- `dist\hudtyping-Setup-X.Y.Z.exe`
- `dist\hudtyping-Setup-X.Y.Z.exe.blockmap`
- `dist\latest.yml`
- `dist\win-unpacked\hudtyping.exe`

공식 바이너리 등록은 설치 파일이 아니라 `dist\win-unpacked\hudtyping.exe` 해시로 한다.
