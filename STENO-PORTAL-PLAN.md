# PlaySteno 통합 플랫폼 로드맵

**작성**: 2026-08-07
**상태**: 초안 · 바다 리뷰 대기
**이전 문서**: 기존 [PORTAL-REFACTOR-PLAN.md](./PORTAL-REFACTOR-PLAN.md) 의 상위 문서. 이 문서 확정 후 그쪽은 세부 라우트 리팩터 절만 남기고 나머지는 이 문서로 옮김.

---

## 0. 이 문서의 목적

PlaySteno 가 "낱말지기 온라인의 랜딩" 에서 **속기 전체를 아우르는 3-카테고리 플랫폼**으로 확장되는 큰 그림을 잡는 문서. 특히 별도 프로덕트로 존재하던 [C:\app\kingoftyping](../kingoftyping/) (전국 타자왕 / no1typing) 을 PlaySteno 산하 "Play Steno" 카테고리로 흡수하는 과정을 다룬다.

**오늘 시점 상태**:
- SaaS = `playsteno.com` (Next.js 16 + Neon + Clerk + Redis)
- 낱말지기(온라인) HUD v0.2.27, 승인 사용자 30명
- 낱말지기(오프라인) 로컬 판 = `C:\app\hudtyping-local` (Electron + SQLite + Ed25519, Phase 4 완료 상태)
- kingoftyping = Supabase 기반 별개 프로덕트. **운영 중 아님**, 실사용자·데이터 이관 필요 없음
- 오늘 SaaS 에 붙였다 뺀 30초 타자 게임은 롤백됨 (홈 노출만 제거, 라우트·API·DB 유지)

---

## 1. 전략 배경 (내부 참조용, 홈페이지 노출 금지)

이 절은 [[project_direction]] 과 [[saas-local-feature-boundary]] 를 상속하며 확장한다.

- **낱말지기 온라인 판**: 유입용 무료 미끼. 성능·기능을 완벽하게 다듬지 않고 "쓸 만하지만 아쉬운" 수준에서 유지.
- **낱말지기 오프라인 판**: 진짜 상품. 매출 지점. 로컬 판 전용 편의 기능(따옴표 자동 제거·활용형 추정 등)은 SaaS 로 이식 금지.
- **PlaySteno 포털**: 낱말지기 외 다른 도구·컨텐츠를 얹어 재방문 유도 + 유입 채널 다변화.
- **Play Steno (타자 게임)**: 흥미·재방문 유도용. **로컬 판 사전 기능을 대체하지 않는 순수 게임**으로만 유지. 어휘 학습·사전 검색과 결합하는 방향은 로컬 판 유입 트리거를 약화시키므로 지양.
- **Study Steno (공부 지원)**: 방향 미정. 커리큘럼·자격증 정보·연습 도구 등 후보 있음. **본 문서 범위 밖**, 자리표시자만 잡는다.
- **Work Steno (속기 툴)**: 낱말지기(온라인·오프라인) 를 필두로 향후 AI 속기 툴들이 들어옴.

---

## 2. PlaySteno 플랫폼 구조

```
PlaySteno · 속기사의 놀이터                (상위 브랜드 · 대제목)
  │
  ├─ Study Steno   속기 공부 지원        (미래, 자리표시자만)
  │
  ├─ Play Steno   속기 게임 지원         (kingoftyping 이식)
  │    ├─ 보고치기 단문
  │    ├─ 보고치기 장문
  │    ├─ 듣고치기 (TTS)                (🔵 결정 필요: 초기 포함 여부)
  │    ├─ 랭킹
  │    ├─ 프로필 · 쿵 상점              (🔵 결정 필요: 이식 범위)
  │    └─ 뱃지 조합 미니게임 (히어로)
  │
  └─ Work Steno    속기 툴 지원
       ├─ 낱말지기(온라인)               (지금 있는 것 · v0.2.27)
       └─ 낱말지기(오프라인)             (외부 링크 · 판매 페이지)
```

### 2.1 URL 구조 (🔵 결정 필요)

세 가지 안을 놓고 골라야 함:

**안 A — 카테고리 접두어**
```
/                     ← 3-카테고리 포털 홈
/work/natmalgi/*      ← 낱말지기
/play/typing/*        ← 타자 게임 (short/long/audio/rankings/shop)
/study/*              ← 미래
```
- 장점: 3-카테고리 구조가 URL 에도 드러남
- 단점: `/work/natmalgi` 는 길고, 검색 유입에는 서비스 이름이 더 자연스러움

**안 B — 서비스 이름 직접**
```
/                     ← 포털 홈
/natmalgi/*           ← 낱말지기
/typing/*             ← 타자 게임
/study/*              ← 미래
```
- 장점: 짧고 검색 유입 · 명함 · 광고에 유리
- 단점: 3-카테고리 개념이 홈에서만 노출됨

**안 C — 하이브리드**
```
/                     ← 포털 홈
/natmalgi/*           ← Work
/typing/*             ← Play (홈에선 "Play Steno" 로 소개, URL 은 짧게)
```
- 안 B 랑 실질 동일. 홈 카피에서만 카테고리를 강조

**✅ 결정: 안 A (카테고리 접두어)** — 3-카테고리 구조를 URL 에도 드러냄.

```
/play/*         ← 게임
/study/*        ← 공부 (미래)
/work/natmalgi/* ← 낱말지기
```

### 2.2 기존 URL 리다이렉트 규칙

낱말지기 페이지들이 `/work/natmalgi/*` 로 이동. 검색 색인 · 기존 링크 보호 필수:

```ts
// next.config.ts
async redirects() {
  return [
    { source: '/download/:path*', destination: '/work/natmalgi/download/:path*', permanent: true },
    { source: '/updates',        destination: '/work/natmalgi/updates',        permanent: true },
    { source: '/trends',         destination: '/work/natmalgi/trends',         permanent: true },
    { source: '/help',           destination: '/work/natmalgi/help',           permanent: true },
    { source: '/install-help',   destination: '/work/natmalgi/install-help',   permanent: true },
  ]
}
```

HUD 앱(v0.2.28 기준) 의 `updateNotes:openLink` 화이트리스트도 새 경로 반영해야 함.

---

## 3. kingoftyping 자산 평가

### 3.1 살릴 가치 큰 것

| 자산 | 위치 | 이식 방식 |
|---|---|---|
| **한글 타수 계산** | `lib/korean/counter.ts` (es-hangul) | SaaS 의 `typing-strokes.ts` 와 통합. 사실상 같은 알고리즘 |
| **서버 재검증 로직** | `app/api/results/route.ts` (typed_text 로 서버 재계산 · 매크로 방지) | 그대로 이식. 매크로 방지 rate limit 은 SaaS `features/security/rate-limit.ts` 재사용 |
| **콘텐츠 300개** | `supabase/seed_01_memes.sql`, `02_suneung.sql`, `03_classics.sql` | 문장 부호 필터링 후 Drizzle seed 로 재등록 (§5) |
| **랭킹 시스템** | 단문/장문 분리, 일간/주간/월간/통합, 사용자당 10개 제한 | 스키마 · 로직 이식. **아침에 발견한 랭킹 도배 문제 해결책이 이미 반영된 형태** |
| **쿵 포인트 · 상점 · 꾸미기** | `003_kung_point_system.sql` · `/shop` · profile | 🔵 결정 필요 (§4.4) |
| **출석 · 일일 미션** | `007_neon_borders.sql` 근방 · `/api/attendance` | 🔵 결정 필요 (§4.4) |
| **뱃지 물리 게임** | `components/HeroPhysicsCanvas.tsx` (matter-js) | 이식. 홈 히어로 or `/typing` 카테고리 홈에 배치 |
| **결과 모달 · 통계 그래프** | `components/typing/ResultModal.tsx` · Recharts | 이식. 이전 최고 대비 · 최근 20회 추이 |
| **레벨 8단계** | `types.ts` `getTypingLevel` | 이식. 브랜드 톤에 맞게 라벨 재검토 |
| **듣고치기 (TTS)** | `/api/tts` (edge-tts) + `audio_contents` + `audio_results` | 🔵 결정 필요 (§4.5) |
| **SNS 결과 이미지** | `/api/og-result` | 이식. 브랜드 로고 교체 |

### 3.2 재검토 · 재설계 대상

- **인증**: Supabase Auth → Clerk. `profiles.id UUID` → `users.clerkId TEXT` 로 관계 재설계. RLS 대신 API 라우트 레벨 인증 (SaaS 는 이 패턴)
- **콘텐츠 문장 부호**: AI 로 자동 생성한 문장에 대괄호 · 가운뎃점 등이 섞여 있어 속기사 키보드로 치기 곤란. 필터링 파이프라인 필요 (§5)
- **UI 스타일**: shadcn+Base UI+tw-animate-css → 지금 SaaS 톤 (Tailwind v4 + lucide 만). shadcn 컴포넌트 최소 이식만
- **랭킹 도배**: kingoftyping 은 "사용자당 10개" 제한이 있어 SaaS 초기 구현보다 나음. 다만 § 4.3 에서 재검토

### 3.3 이관 대상 아님

- 옛 데이터 (사용자 · 결과 · 쿵 내역) — 실사용 없었으므로 폐기
- Supabase Storage 오디오 파일 — TTS 로 재생성 가능
- Supabase 특화 RLS 정책 · RPC 함수 — Clerk+Neon 스택에 부적합, API 로 대체
- Google OAuth 원본 설정 — Clerk 에서 재구성

---

## 4. 결정 사항 (확정)

### 4.1 URL 방식 (§2.1)

**✅ 안 A** — 카테고리 접두어 `/play/*`, `/study/*`, `/work/natmalgi/*`

### 4.2 홈에서 "곧 공개" 카드 노출 여부

**✅ 안 1** — Study Steno 자리에 "곧 공개" 카드 노출. 기대감 조성.

### 4.3 랭킹 시스템

**✅ 커스텀 안** —
- 사용자당 최대 **5개** 기록
- **게임 닉네임 별도 설정** (Clerk 이름과 분리, `game_profiles.nickname`)
- 기간 탭 4개: **일간 · 주간 · 월간 · 역대**

### 4.4 쿵 · 상점 · 출석 · 미션 이식 범위

**✅ 안 D → 안 C 확장** — 초기엔 순수 게임 + 랭킹만. 안정화 후 쿵/꾸미기 추가. 성급함 방지.

### 4.5 듣고치기(TTS) 초기 포함 여부

**✅ 안 B** — 초기 제외, 보고치기만. 안정화 후 붙임.

### 4.6 광고 (AdSense) 포함 여부

**✅ 안 B** — 안 붙임. 브랜드 신뢰 우선. 유입 강화 뒤 재검토.

### 4.7 profiles 스키마

**✅ 안 C** — 별도 `game_profiles` 테이블. SaaS `users` 오염 방지, 게임 닉네임(§4.3) · 지역 · 속기사 여부 등은 여기 저장.

```sql
CREATE TABLE game_profiles (
  clerk_id      TEXT PRIMARY KEY REFERENCES users(clerk_id) ON DELETE CASCADE,
  nickname      TEXT NOT NULL,     -- 게임 표시 이름 (Clerk 이름과 별개)
  region        TEXT,              -- 지역 랭킹 · 표기용
  is_stenographer BOOLEAN DEFAULT FALSE,  -- 속기사 뱃지용
  -- 쿵/꾸미기는 안 C 확장 시점에 추가
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
```

### 4.8 Study Steno 콘셉트

방향 미정. 본 문서 범위 밖. 별도 세션에서 다룸.

### 4.9 승인 흐름 (신규 · 게임 진입 장벽 분리)

**배경**: 지금 SaaS 회원가입은 낱말지기 사용 목적이라 관리자 승인이 필수. 이 흐름을 게임까지 강제하면 진입 장벽이 너무 높아짐.

**✅ 결정: 옵션 1 + 게스트 모드**

- **비회원 게스트** (로그인 없음)
  - 게임 플레이 가능 (누구나 즉시)
  - 닉네임은 `localStorage` 로컬 저장 (DB 안 씀)
  - 랭킹 정식 등록은 안 됨 (세션 안 임시 표시 or 아예 X)
- **회원 (Clerk 가입, 승인 X)**
  - 게임 플레이 · 랭킹 **정식 등록** 가능 (승인 무관)
  - 낱말지기 검색 API `/api/search` 는 403 (기존대로 승인 필요)
  - 대시보드 접속 시 "낱말지기 승인 대기중" 안내
- **승인된 회원** (기존 흐름)
  - 게임 + 낱말지기 둘 다 정상 이용

**구현 원칙**:
- `/api/games/*` 라우트: `status` 체크 안 함. 인증만 요구 (`authenticate()` → `user` 존재 여부).
- `/api/search`, `/api/log`, `/api/word/*` 등 낱말지기 라우트: 기존대로 `status === 'approved'` 요구.
- 게임 페이지(`/play/typing`) 자체는 비회원 접속 가능. 랭킹 등록 시점에만 로그인 안내 모달.
- 게스트 닉네임은 `localStorage` 만. DB 에 게스트 계정 만들지 않음.

**효과**:
- 낱말지기 승인 관리 그대로 유지 (30명 기존 흐름 안 깨짐)
- 게임 유입 장벽 최소 · 자연스러운 재방문 유도
- 게스트 → 회원 → 승인 요청 순 유입 깔때기

---

## 5. 콘텐츠 필터링 정책 (§ 바다 요청)

### 5.1 문제 상황

AI 로 문장 자동 생성 → 대괄호(`[]`), 가운뎃점(`·`), 콜론(`:`), 세미콜론(`;`), 물결(`~`), 슬래시(`/`) 등이 섞여 나옴. 속기사 키보드로 치기 어려운 부호가 노이즈.

### 5.2 정책

**허용 (유지)**:
- 한글 (`가-힣`, `ㄱ-ㅎ`, `ㅏ-ㅣ`)
- 영문 (`A-Za-z`)
- 숫자 (`0-9`)
- 공백
- 문장 부호 **4종만**: 온점(`.`), 쉼표(`,`), 느낌표(`!`), 물음표(`?`)

**제거 (삭제)**:
- 그 외 모든 부호 (대괄호 · 소괄호 · 중괄호 · 가운뎃점 · 콜론 · 세미콜론 · 물결 · 슬래시 · 하이픈 · 인용부호 등)
- 이모지 · 특수 문자

### 5.3 구현 위치

```ts
// src/features/typing/content-sanitizer.ts
export function sanitizeForTyping(text: string): string {
  return text
    .replace(/[^가-힣ㄱ-ㅎㅏ-ㅣA-Za-z0-9\s.,!?]/g, '')  // 허용 문자만 남김
    .replace(/\s+/g, ' ')                                // 공백 정규화
    .trim();
}
```

**적용 지점**:
1. **콘텐츠 등록 API** (관리자 or AI 생성) → 서버에서 자동 적용 후 DB 저장
2. **기존 시드 300개** → 일괄 처리 후 등록
3. **미리보기 UI** (관리자) → sanitize 결과와 원본 비교 확인 가능

**주의**: sanitize 후 문장이 2글자 미만이 되거나, 뜻이 심하게 훼손된 경우 → 폐기 또는 수동 검토 큐로.

---

## 6. 브랜드 UI 통일 원칙

### 6.1 유지 (지금 SaaS 톤)

- Tailwind CSS v4
- lucide-react 아이콘
- `src/app/globals.css` 의 CSS 변수 (`--background`, `--foreground`, `--accent`, `--signal`, `--border` 등)
- `font-display` (제목), `ko-heading`, `ko-copy` 클래스
- 컴포넌트 상수: `src/components/marketing/*` 톤

### 6.2 kingoftyping 에서 이식 시 변환

- **shadcn Button/Card/Badge** → SaaS 자체 컴포넌트로 대체 or 최소 shadcn 셋만 이식
- **Base UI 컴포넌트** → 필요한 경우만 골라서
- **tw-animate-css** → CSS transitions 로 최소화
- **컬러 팔레트** → SaaS 톤으로 매핑 (kingoftyping 은 다크 톤 · 네온 강조, SaaS 는 좀 더 프로페셔널)

### 6.3 게임 특유 요소 예외

물리 낙하 뱃지, 결과 애니메이션 등 게임 UX 는 톤과 별개로 재미가 우선. 브랜드 컬러만 맞춰서 유지.

---

## 7. 작업 순서 (Phase A~F)

각 Phase 는 이전 완료 후 착수. 병렬 금지 (성급함 방지).

### Phase A — 계획 확정 ✅ 완료
- 본 문서 리뷰 · §4 결정 항목 8개 확정 (2026-08-13~14)

### Phase B — 홈 리디자인 ✅ 완료 (2026-08-14)
- ✅ PlaySteno 홈을 3-카테고리 포털로 리디자인 (Play · Study · Work)
- ✅ Study 카드는 "곧 공개" 자리표시
- ✅ Play 카드 → `/play/typing` 임시 페이지 (Phase E 에서 실제 게임)
- ✅ 낱말지기 랜딩 콘텐츠를 `/work/natmalgi` 로 통째로 이동
- ✅ 개별 페이지 이동: `/help` → `/work/natmalgi/help`, `/download/windows` → `/work/natmalgi/download/windows`, `/updates` → `/work/natmalgi/updates`, `/install-help` → `/work/natmalgi/install-help`
- ✅ `next.config.ts` 에 legacy → 신규 URL permanent(308) 리다이렉트 규칙 추가
- ✅ site-header · site-footer · dashboard · auth 페이지 안 링크 다 새 URL 로 갱신
- ✅ 인기검색어 (`/trends`) 홈·nav·footer 노출 제거 (파일은 관리자용으로 남김)
- **HUD 앱 URL 하드코드는 아직 안 건드림** — 리다이렉트가 커버해줌. 여유 있을 때 v0.2.29 등에서 정리.

### Phase C — 인프라 (스키마 · 인증) 🟢 다음 착수
- Drizzle schema: `typing_contents`, `typing_results`, `game_profiles` (§4.7), `game_leaderboard_snapshot` 등
- Clerk 인증 통합 (users 테이블 재활용)
- 마이그레이션 · 시드 파이프라인
- 소요: 2~3일

### Phase D — 콘텐츠 파이프라인
- `sanitizeForTyping()` 구현 (§5.3)
- kingoftyping 시드 300개 필터링 후 등록
- 관리자 콘텐츠 등록 UI (미리보기 · sanitize 결과)
- 소요: 1~2일

### Phase E — 게임 코어 이식
- `TypingEngine`, `TypingDisplay`, `TypingStats`, `TypingTimer`, `ResultModal`
- `/api/games/typing/*` 라우트 (session, result, leaderboard, profile)
- 서버 재검증 로직
- 랭킹 조회 (§4.3 결정 반영)
- 결과 통계 그래프
- 소요: 3~5일

### Phase F — 히어로 · 재미 요소 (선택)
- 뱃지 물리 미니게임 (`HeroPhysicsCanvas`)
- 쿵 · 꾸미기 (§4.4 결정 반영 · 축약 버전)
- SNS OG 이미지 (§3.1)
- 소요: 결정에 따라 3~7일

**릴리스 결정 지점**: Phase E 끝나면 최소 기능으로 릴리스 가능. Phase F 는 여유 될 때만.

---

## 8. 리스크 · 유의 사항

### 8.1 Clerk 인스턴스 · 도메인 관련

- Clerk 대시보드는 즉흥으로 만지지 말 것. [[clerk-instance-safety]] 참고. 프로덕션 인스턴스 전환은 30명 계정 손실 위험.
- `WOORI_KEY` env 값 관리 시 앞뒤 공백 조심 ([[whitespace-in-env-values]] 재발 방지 — 서버 코드가 이미 trim 방어)

### 8.2 로컬 판 침해 방지

- 타자 게임에 우리말샘 사전 검색 · 뜻풀이 · 예문 노출 등 **어휘 학습 게임화 금지**. 순수 타자 재미로만.
- 낙하 뱃지 물리 게임의 단어 조합도 "일반 어휘" 로만. 사전 뜻 노출 X.
- [[saas-local-feature-boundary]] 원칙 적용.

### 8.3 스코프 폭주 방지

- Phase E 로 최소 기능 릴리스 · Phase F 는 결정 필요할 때만.
- 쿵 · 상점 · 미션 · 뱃지 다 담으면 개발이 2주 이상 늘어남. 초기엔 뺐다가 재방문 지표 보고 추가.

### 8.4 URL 리다이렉트 · SEO

- 낱말지기 관련 페이지들이 `/natmalgi/*` 로 이동할 때 검색 엔진 색인 안 깨지도록 permanent redirect 필수.
- OG 태그 · sitemap 재정비 필요.

---

## 9. 오픈 이슈

- [x] ~~URL 방식 확정 (§2.1)~~ → 안 A
- [x] ~~홈 "곧 공개" 카드 노출 여부 (§4.2)~~ → 노출함
- [x] ~~랭킹 방식 (§4.3)~~ → 커스텀 (사용자당 5개 · 게임 닉네임 · 4탭)
- [x] ~~쿵 · 상점 이식 범위 (§4.4)~~ → 안 D → 안 C 확장
- [x] ~~듣고치기 초기 포함 (§4.5)~~ → 안 B
- [x] ~~광고 (§4.6)~~ → 안 붙임
- [x] ~~프로필 스키마 (§4.7)~~ → 안 C (별도 game_profiles)
- [x] ~~승인 흐름 (§4.9)~~ → 옵션 1 + 게스트 모드
- [ ] Study Steno 방향 (§4.8) — 별도 세션
- [ ] 프로젝트 이름·URL 리네이밍 관련 HUD 앱 v0.2.28 이후 반영 시점
- [ ] 페이즈별 시작 트리거 (앞 페이즈 완료 후 며칠 · 안정성 확인 기준)
- [ ] 게스트 랭킹 등록 정책 최종 확정 — 완전히 X, 세션 안 임시 표시, 별표 붙여서 노출 중 어떤 방식?

---

## 10. 다음 단계

1. 바다가 본 문서 리뷰 (특히 §4 결정 필요 7개 항목)
2. 확정된 결정 사항 문서에 반영 · "🔵 결정 필요" 마커 지움
3. Phase B (홈 리디자인) 부터 새 세션에서 착수
