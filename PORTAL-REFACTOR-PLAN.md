# PlaySteno 포털 전환 로드맵

**작성**: 2026-08-04
**상태**: 단계적 전환 진행 중 (Phase A·B 완료)

이 문서는 `papawheels.vercel.app` → `playsteno.com` 도메인 이관과 함께
사이트 성격을 **낱말지기 단일 랜딩** 에서 **속기사 통합 포털** 로 확장할 때
따라갈 로드맵.

## 1. 전략 배경 (내부 참조용, 홈페이지 노출 금지)

- **낱말지기 온라인**: 신규 사용자가 제품 가치를 확인하는 무료 베타. 월 한도 안에서
  신뢰할 수 있는 경험을 제공하고 PlaySteno 가입의 첫 진입점으로 사용한다.
- **낱말지기 로컬버전**: 인터넷 연결 없이 제한 없이 사용하는 향후 유료 상품.
  판매 준비가 끝날 때까지 공개 페이지에 노출하지 않는다.
- **PlaySteno 포털**: 낱말지기 외 다른 도구(타이핑 대결·굿즈·자료실)를 얹어
  재방문 유도 + 유입 채널 다변화. 낱말지기가 이 안의 도구 중 하나가 됨.

내부 지침:
- 온라인판을 의도적으로 불편하게 만들거나 성능을 낮추지 않는다.
- 로컬버전은 오프라인·무제한이라는 분명한 별도 가치로 판매하며, 미공개 단계의
  기능·가격·출시 시점을 홈페이지에서 예고하지 않는다.

## 2. 브랜드 계층

```
PlaySteno · 속기사의 놀이터                (상위 브랜드)
  │
  ├─ 낱말지기 온라인     — 커서 앞 검색 HUD  · 무료 베타
  ├─ 낱말지기 로컬버전   — 오프라인 · 무제한  · 향후 유료
  ├─ 타이핑 대결        — 속도 · 랭킹 게임   (TBD)
  ├─ 굿즈샵            — 키캡 · 티셔츠 등    (TBD)
  └─ 자료실 / 커뮤니티   — 팁 · 링크 · 뉴스   (TBD)
```

## 3. 단계별 진행

### Phase A — 지금 (당장)
- 나브 · 푸터 · 메타 표기만 **PlaySteno** 로 상향
- 페이지 내용은 낱말지기(온라인) 그대로 유지
- 준비 안 된 카테고리 카드 · "준비 중" 라벨 노출 안 함
- URL 구조 그대로 (기존 링크 유지)

### Phase B — 공식 도메인 이관 완료
- [x] Vercel Domains에 `playsteno.com` 추가
- [x] DNS 연결 및 HTTPS 응답 확인
- [x] 고객용·검색엔진 canonical 주소를 `https://playsteno.com`으로 고정
- 기존 `papawheels.vercel.app`은 옛 사용자 링크 호환용으로만 유지하고 외부 안내에 사용하지 않음
- Clerk allowed origins와 HUD 앱 서버 주소는 릴리스 시 `playsteno.com` 기준인지 재확인
- HUD 앱 (`main/dictionary-api.ts` 의 `SAAS_BASE_URL`) 을 새 도메인 가리키게
  재빌드 → autoUpdater 로 배포 (v0.2.28 예상)

### Phase C — 두 번째 도구 붙일 때 (라우트 리팩터)
현재 홈(`/`) = 낱말지기 랜딩. 두 번째 도구가 붙는 시점에 아래처럼 재구성:

```
src/app/
├─ page.tsx                     ← 포털 홈 (여러 도구 카드)
├─ layout.tsx                   ← 전역 나브·푸터 (지금과 동일)
│
├─ natmalgi/
│   ├─ page.tsx                 ← 지금의 홈 내용 이곳으로 이동
│   ├─ download/                ← 지금의 download/ 이동
│   ├─ updates/                 ← 지금의 updates/ 이동
│   └─ trends/                  ← 지금의 trends/ 이동
│
├─ typing/                      ← 새 도구 (라우트만 만들면 자동 생성)
│   └─ page.tsx
│
├─ shop/
│   └─ page.tsx
│
└─ (dashboard)/                 ← 그대로
```

**중요**: 라우트 이동 시 이전 URL 유지 필요 (`/download/windows` 를 검색엔진이
이미 색인). `next.config.ts` 에 리다이렉트 규칙 추가:

```ts
async redirects() {
  return [
    { source: '/download/:path*', destination: '/natmalgi/download/:path*', permanent: true },
    { source: '/updates', destination: '/natmalgi/updates', permanent: true },
    { source: '/trends', destination: '/natmalgi/trends', permanent: true },
  ]
}
```

### Phase D — 카테고리 하나 추가할 때
관리 부담이 얼마나 되나 미리 정리:

1. **폴더 하나 추가**: `src/app/<category>/page.tsx` — 이것만으로 `/<category>` 라우트 자동 생성
2. **포털 홈 카드 하나 추가**: `src/app/page.tsx` 에 새 카테고리 카드 JSX 한 블록
3. **(선택) 나브에 링크 추가**: 나브 컴포넌트에 링크 하나
4. **(선택) 푸터에도 링크 추가**

**기존 카테고리 코드 하나도 안 건드림.** Next.js App Router 가 폴더 단위로
완전히 격리해줌.

## 4. 하드코드된 브랜드 · 도메인 위치 (이관 시 갱신 목록)

### SaaS 코드
- `src/config/community.ts` — OPENCHAT URL (변경 대상 아님, 별도 채널)
- `src/app/layout.tsx` — meta title · description
- `src/app/page.tsx` — 나브 · 푸터 · Hero 텍스트
- `src/features/desktop-connections/service.ts` — 기본 device name

### HUD 앱 (`C:\app\hudtyping`)
- `main/dictionary-api.ts` — `SAAS_BASE_URL` 하드코드 (`papawheels.vercel.app`)
- `main/main.ts` — 업데이트 배너의 홈페이지 URL · `updateNotes:openLink`
  화이트리스트
- `main/tray.ts` — 툴팁 문구
- `package.json.productName` · `electron-builder.yml.productName`

### GitHub Releases (autoUpdater 의존)
- **저장소 이름 `phk901031-prog/hudtyping-saas` 절대 변경 금지** —
  기존 사용자 autoUpdater 가 `latest.yml` 을 이 URL 로 찾음
- 도메인 바뀌어도 저장소는 그대로

## 5. Phase A 실행 상태

2026-08-06 기준 반영 완료:

- [x] 이 문서 저장
- [x] `src/app/layout.tsx` — PlaySteno 메타데이터와 운영 URL 기준 추가
- [x] 공개 페이지를 `(marketing)` 라우트 그룹으로 묶고 공통 헤더·푸터 적용
- [x] 헤더 브랜드 라벨 → PlaySteno, 서브라벨 "속기사의 놀이터 · 낱말지기 온라인"
- [x] 푸터 브랜드 라벨 → PlaySteno, 하위에 낱말지기 온라인 표기
- [x] `src/app/(dashboard)/dashboard/page.tsx` 워크스페이스 헤더 → PlaySteno
- [x] 홈페이지 문구·CSS 시연·설치 신뢰 안내 개선
- [x] 도움말·약관·개인정보 처리방침의 브랜드와 제품 사실 정리

**현재 유지하는 것**:
- 히어로 · 기능 · 작동 방식 · 공지·지원 · FAQ 등 모든 섹션 내용 (여전히 낱말지기 이야기)
- 아이콘 · 로고 (지금 S 로고 그대로 PlaySteno 임시 마크로 사용)
- 공개 URL (help · install-help · terms · privacy · sign-up · download · updates · trends)
- 오픈톡방 카드
- URL 구조
- 다른 도구 카드 · "준비 중" 노출 없음

## 6. Phase B~D 실행 시 참고

각 Phase 착수할 때 이 문서 열어서:
- Phase 3에서 결정한 라우트 계층 그대로 따르기
- 리다이렉트 규칙 반드시 추가 (SEO · 기존 링크 보호)
- HUD 재빌드가 필요한 시점 (도메인 변경 시) 놓치지 않기
- 로컬버전 라이선스 서버는 같은 SaaS 프로젝트에 있으므로 도메인 바뀌면
  `hudtyping-local` 의 activation endpoint URL 도 갱신 필요

## 7. 오픈 이슈

- [ ] PlaySteno 전용 로고 만들 것인지 (지금은 낱말지기 S 로고 재사용)
- [x] `playsteno.com` 연결 확인
- [ ] `natmalgi.com` · `.co.kr` 도 확보해서 리다이렉트 걸어둘지
- [ ] 타자게임 실제 착수 순서 · 시점 (커뮤니티는 타자게임 도입 후 재검토)
- [ ] 로그인 필요 도구와 무료 도구 구분 정책
- [ ] 굿즈샵 결제 인프라 (Stripe · 국내 PG)
