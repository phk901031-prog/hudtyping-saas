# 로드맵 (Phase별 진행)

날짜는 결정/완료 시점. **마지막 업데이트: 2026-05-05**

## 완료된 Phase

### Phase 1: 인증 인프라 ✓ (2026-05-05)
- Next.js 16 + Tailwind v4 + TypeScript 프로젝트 셋업
- Clerk 인증 (이메일 + Google) + 가입 후 `/pending` 리다이렉트
- 발견: Next.js 16의 `middleware.ts → proxy.ts` 변경, Clerk 7의 `<SignedIn>` 제거

### Phase 2: 데이터 + 회원 관리 ✓ (2026-05-05)
- Neon PostgreSQL + Drizzle ORM
- `users` 테이블 + status enum (pending/approved/rejected) + role enum
- JIT(Just-In-Time) provisioning (webhook 없이 페이지 진입 시 row 생성)
- 보호 layout (`(dashboard)/layout.tsx`)에서 status 검사

### Phase 3: 검색 + 캐시 ✓ (2026-05-05)
- 우리말샘 Open API 연동 (`src/lib/dictionary-api.ts`)
- Upstash Redis 공유 캐시 (TTL 7일, 사용자 분리 안 함)
- Next.js 16 `after()`로 백그라운드 검색 로깅 (응답 지연 0)
- `search_logs` 테이블 + 3개 인덱스

### Phase 4-2: API 키 시스템 ✓ (2026-05-05)
- `api_keys` 테이블 (SHA256 해시 저장, 평문 1회만 노출)
- `/api-keys` UI (발급·조회·삭제)
- `/api/search`에 두 인증 방식 통합 (Bearer 헤더 OR Clerk 쿠키)

### Phase 4-3: 로컬 HUD 통합 ✓ (2026-05-05)
- `C:\app\hudtyping\main\dictionary-api.ts` 전면 수정 (우리말샘 직접 → SaaS API 호출)
- 응답 변환 (camelCase ↔ snake_case)으로 기존 UI 호환 유지

### Phase 4-5: 통계 대시보드 ✓ (2026-05-05)
- `/stats` 페이지 (요약 카드 + 최근 10건 + 인기 단어 top 10)

## 진행 중

### 리팩토링 (다음 작업) 🔄
- 4-layer 분리: Presentation / Application / Domain / Infrastructure
- `src/features/<domain>/service.ts` 패턴 도입
- 상세 plan: `docs/architecture/layers.md`

### Phase 5: 관리자 페이지 (예정)
- `/admin/users` — 회원 승인/거절 (role=admin 검사)
- `/admin/stats` — 전체 사용 통계
- (선택) Resend 이메일 알림

### Phase 6: UI/UX 마무리 + 랜딩
- 다크/라이트 모드
- 반응형 디자인
- 에러 페이지 (404, 500)
- 매뉴얼/스펙 문서를 SaaS 안에서 노출 (`/docs` 라우트, 마크다운 렌더)

### Phase 7: 배포
- Vercel 배포 (도메인 확정)
- 환경변수 운영 모드 설정
- Clerk webhook 활성화 (선택)

### Phase 4-4: .exe 빌드 + GitHub Releases
- **Phase 7 후 진행**. 운영 도메인 확정돼야 `SAAS_BASE_URL` 갱신 가능.
- electron-builder로 .exe 생성
- GitHub Releases에 업로드 (자동 업데이트는 추후)

### Phase 4-1: 랜딩 다운로드 CTA
- **Phase 4-4 후 진행**. 다운로드 URL 확정돼야 연결.
- 메인 페이지에 ".exe 다운로드" 버튼
- 사용법 영상 또는 GIF (선택)

## 향후 (1년 후 ~)

### Phase 8: 유료화 도입
- Stripe 연동
- 무료 사용자: 일 50회 검색 제한
- 구독자: 무제한 + 추가 기능
- 결제 페이지 + 청구서

### Phase 9: 자동 업데이트
- electron-updater 통합
- 새 .exe 릴리스 시 사용자 자동 알림

### Phase 10: 부가 기능 (사용자 피드백 보고 결정)
- 검색 결과 즐겨찾기
- 단어장(개인 단어 모음)
- 모바일 PWA (외부 환경 백업)
- 팀 라이선스 (속기 회사용)

## 결정 이력 (재정의 사항)

### 2026-05-05: TipTap 워크스페이스 → 로컬 HUD 통합으로 교체
- **이전 Phase 4 계획**: TipTap 에디터로 회의록 작성 워크스페이스 제공
- **변경**: 타겟 사용자(속기사)가 한글에서 양식 맞춰 작성하는 게 본질이므로 SaaS 안 워크스페이스는 무용. SaaS는 로컬 HUD의 보급+백엔드 역할로 재정의.
- 자세한 결정 배경: 메모리(`project_direction.md`) 참고.
