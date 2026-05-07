# 새 .exe Release 체크리스트

> 새 버전 (v0.x.y) 출시할 때마다 이 리스트 따라 진행.
> 자세한 절차는 [docs/operations/release-process.md](../../docs/operations/release-process.md).

## 사전 준비
- [ ] CHANGELOG 갱신 (큰 변경 사항 정리)
- [ ] HUD `package.json` 버전 bump (`npm version patch/minor/major`)
- [ ] git status 깨끗한지 확인 + commit

## 빌드
- [ ] `cd C:\app\hudtyping`
- [ ] `rm -rf renderer/.next app dist`
- [ ] `npm run build`
- [ ] `dist/` 안 3개 파일 확인:
  - hudtyping-Setup-X.Y.Z.exe
  - hudtyping-Setup-X.Y.Z.exe.blockmap
  - latest.yml

## SaaS에 hash 등록
- [ ] `cd C:\app\new-hudtyping-saas`
- [ ] `node scripts/register-binary.mjs "<exe path>" <version>`
- [ ] 출력에 "Registered" 확인
- [ ] (선택) Neon SQL Editor에서 `SELECT * FROM official_binaries ORDER BY released_at DESC LIMIT 5` 확인

## GitHub Release
- [ ] `cd C:\app\hudtyping && git tag vX.Y.Z && git push origin vX.Y.Z`
- [ ] GitHub Releases → "Draft new release"
- [ ] Tag: vX.Y.Z 선택
- [ ] Title: `hudtyping vX.Y.Z`
- [ ] Description: CHANGELOG 본문 (Security, Features, Breaking 섹션)
- [ ] **Attach binaries** 영역에 `dist/`의 3개 파일 모두 드래그
- [ ] Publish release

## 검증
- [ ] `curl -X POST https://papawheels.vercel.app/api/verify-client -H "Content-Type: application/json" -d '{"sha256":"<hash>"}'`
  → `verified: true` 반환
- [ ] 다운로드 URL 동작:
  `curl -I https://github.com/phk901031-prog/hudtyping-saas/releases/download/vX.Y.Z/hudtyping-Setup-X.Y.Z.exe`
- [ ] (선택) 깨끗한 PC에 설치 + 검색 정상 → 끝까지 검증

## 사용자 알림
- [ ] 큰 변경 (breaking) 시 카카오톡 papawheels로 공지
- [ ] (Phase 9 적용 후) electron-updater가 자동 알림

## 롤백 (문제 발견 시)
```sql
DELETE FROM official_binaries WHERE version = 'X.Y.Z';
```
+ Upstash Redis에서 `binary:<hash>` 키 수동 삭제 (캐시 무효화)
+ GitHub Release를 "Pre-release"로 표시 또는 삭제

---

## 첫 v0.2.0 출시 (이번)
- Phase 9 작업 (electron-updater, asar fuses, JS 난독화) 완료 후
- 별도 워크플로우. 이후 v0.3.0+부터 위 체크리스트로 정형화.
