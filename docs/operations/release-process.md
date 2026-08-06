# 새 .exe Release 절차

> Windows 공개 버전과 다운로드 URL의 애플리케이션 기준점은 `src/config/release.ts`입니다. GitHub Release 생성 후 이 파일의 `version`, `downloadUrl`, 필요 시 `minimumFreshInstallVersion`을 갱신하고 lint/build를 통과시킵니다.

> SaaS 코드 변경(웹)은 `git push`로 Vercel 자동 배포.
> 이 문서는 **로컬 HUD .exe**의 새 버전 출시 절차.

## 단계 1: 사전 준비

```bash
# 1. C:\app\hudtyping의 작업 commit
cd C:\app\hudtyping
git status   # 깨끗한지 확인
git pull     # 최신

# 2. CHANGELOG 갱신 (수동)
# 3. package.json 버전 bump
npm version minor   # 0.2.0 → 0.3.0
# 또는 patch (0.2.0 → 0.2.1) / major (0.2.0 → 1.0.0)
```

## 단계 2: 빌드

```bash
cd C:\app\hudtyping
rm -rf renderer/.next app dist
npm run build
```

빌드 결과:
- `dist/hudtyping-Setup-X.Y.Z.exe`
- `dist/latest.yml` (electron-updater용)
- `dist/hudtyping-Setup-X.Y.Z.exe.blockmap` (delta update용)

## 단계 3: SaaS에 hash 등록

**필수**. 등록 안 된 hash는 SaaS가 거부.

⚠️ **중요**: 등록할 파일은 **`dist/win-unpacked/hudtyping.exe`** (설치된 본체, ~180MB)
NSIS Setup .exe (`hudtyping-Setup-X.Y.Z.exe`)가 아님!

이유: 사용자 PC에서 실제 실행되는 파일 = 설치된 본체. SaaS의 `integrity.ts`가
`process.execPath`로 읽는 게 설치된 본체 .exe라, **그 파일의 hash가 등록돼야** 매치됨.

```bash
cd C:\app\new-hudtyping-saas
node scripts/register-binary.mjs "C:\app\hudtyping\dist\win-unpacked\hudtyping.exe" X.Y.Z
```

출력 예:
```
✓ Registered v0.2.0: 3f88af33...
  Size: 180.3 MB
```

> NSIS Installer (`hudtyping-Setup-X.Y.Z.exe`, ~86MB)는 사용자가 다운받아 설치할 때만 쓰이고,
> 설치 끝나면 본체 (`hudtyping.exe`, ~180MB)를 풀어 놓고 사라짐. 무결성 검증 대상은 본체.

## 단계 4: GitHub Release

수동 (현재) 또는 GitHub Actions (Phase 9):

```bash
cd C:\app\hudtyping
git tag vX.Y.Z
git push origin vX.Y.Z

# GitHub UI에서:
# 1. Releases → Draft new release
# 2. tag: vX.Y.Z
# 3. dist/ 의 3개 파일 업로드 (.exe, latest.yml, .blockmap)
# 4. CHANGELOG 본문 복사
# 5. Publish
```

## 단계 5: 검증

```bash
# SaaS production에서 검증 라우트 호출
curl -X POST https://playsteno.com/api/verify-client \
  -H "Content-Type: application/json" \
  -d "{\"sha256\": \"<빌드된 exe hash>\"}"
# 기대: { "verified": true, ... }

# 다운로드 URL 확인
curl -I https://github.com/phk901031-prog/hudtyping-saas/releases/latest/download/hudtyping-Setup-X.Y.Z.exe
# 기대: 200 또는 302 redirect
```

## 단계 6: 사용자 알림 (선택)

새 버전이 호환성 깨는(breaking) 변경 포함하면 카톡으로 안내. 일반 변경은 electron-updater가 자동 알림 (Phase 9 적용 후).

## 롤백 (문제 발견 시)

```sql
-- official_binaries에서 해당 hash 제거 (즉시 인증 거부)
DELETE FROM official_binaries WHERE version = 'X.Y.Z';
```

또는 Redis 캐시 명시 무효화:
```bash
# Upstash Console → Data Browser → binary:<hash> 키 삭제
```

GitHub Release도 "Pre-release" 또는 삭제로 표시.

## 자주 발생하는 문제

### "공식 빌드가 아닙니다" 오류
- hash 등록 안 됨 → register-binary 다시 실행
- 또는 사용자가 옛 .exe 사용 중 → autoUpdater가 새 버전 강제

### latest.yml 누락
- electron-builder.yml의 `publish: github` 설정 확인
- 빌드 시 GH_TOKEN 환경변수 필요할 수도 (autoUpdater 메타파일 생성용)

### 대용량 .exe (50MB+)
- 정상. Electron + Chromium 포함이라 80~100MB 보통
- 사용자에겐 한 번만 다운, 이후 delta update (.blockmap 사용)
