# new-hudtyping-saas

## 프로젝트 개요
hudtyping의 SaaS(웹 서비스) 버전. 로컬 데스크톱 버전(`C:\app\hudtyping`)과는 **별도 프로젝트**.

타겟: 속기사, 회의록 작성자, 글쓰기 전문가.
1년간 무료 운영 후 사용 패턴 보고 유료화 도입 예정.

## 핵심 컨셉 (2026-05-05 재정의)
SaaS는 **로컬 Electron HUD 앱(`C:\app\hudtyping`)의 보급 + 인증/검색 백엔드** 역할.
속기사가 한글에서 단축키 한 번에 자동 단어 검색 → 그 검색이 SaaS API를 통해 처리되도록 한다.
모든 검색이 SaaS를 거치므로 (1) 우리말샘 키 보호, (2) 공유 캐시로 호출량 절감,
(3) 사용 통계 수집, (4) 1년 후 유료화 lock 가능.

## SaaS의 역할
1. **로컬 HUD .exe 다운로드 호스팅** (랜딩 → 다운로드 CTA)
2. **사용자 인증 + 관리자 승인** (Clerk + Neon)
3. **검색 API 백엔드** (`/api/search` — 모든 검색이 여기를 거침)
4. **공유 캐시** (Upstash Redis — 한 명이 검색하면 모두에게 즉시 응답)
5. **사용 통계** (Neon `search_logs` — 1년 후 유료화 데이터)
6. **(나중에) 결제 lock** (Stripe — 구독 안 하면 검색 불가)

## 로컬 버전과의 관계
| 항목 | 로컬 HUD | SaaS |
|------|----------|------|
| 형태 | Electron 데스크톱 앱(.exe) | Next.js 웹 서비스 |
| 역할 | 한글에서 단축키로 자동 검색 | 인증·검색 API·다운로드 호스팅 |
| 사용자 화면 | HUD 오버레이 | 가입·로그인·통계 대시보드·관리자 |
| 검색 호출 | (변경 예정) SaaS의 `/api/search` 호출 | 우리말샘 직접 호출 (서버) |
| 결제·라이선스 | SaaS 토큰으로 lock 가능 | Stripe 등 붙이기 쉬움 |

## 기술 스택
- **프론트엔드**: Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **DB**: Neon (PostgreSQL serverless, Tokyo) + Drizzle ORM
- **인증**: Clerk (이메일 + 구글 로그인 + 관리자 승인)
- **캐시**: Upstash Redis (우리말샘 API 응답 캐싱 - 핵심)
- **외부 API**: 우리말샘 Open API (바다 키 1개로 통일, 일 5만 한도)
- **배포**: Vercel + GitHub Releases (.exe 호스팅)
- **계정**: 바다 본인 구글 계정 `phk901031@gmail.com`

## 타겟 사용자
- **1차**: 한글 워드프로세서로 회의록 작성하는 속기사 (로컬 HUD 사용)
- **2차** (옵션): 모바일/외부 환경에서 단어만 빠르게 찾는 사용자 (SaaS 웹 검색만)
- **비-타겟**: SaaS 안에서 글을 쓰는 시나리오 (TipTap 워크스페이스는 Phase 4 재정의로 빠짐)

## 작업 규칙
- 모든 코드에 한글 주석 필수
- 각 Phase 전환 시 코드 설명 + 학습 안내
- docs/ 폴더에 Phase별 학습 문서 작성
- .claude/skills/에 Phase별 완료 상태 기록
- 빠른 완성보다 레이어별 정확한 구현 우선
- 소통: 반말, 심(Claude) ↔ 바다(사용자)
- bash 명령은 자율 실행 (동의 안 구함)
- Electron이 아니므로 PowerShell/Git Bash 모두 가능

## 에이전트 구조
- 심 (총사령관): 코드 작성, 설명, 전체 관리
- 수정봇: 에러 진단 → 수정안 보고
- 문서봇: docs/ 학습 문서 작성
- 검증봇: 빌드/기능 검증 → 결과 보고

## 참고 자료
- 로컬 버전 코드: `C:\app\hudtyping\` (참고만, 직접 복사 금지)
- 로컬 버전 학습 문서: `C:\app\hudtyping\docs\`
- 우리말샘 API 설명: `C:\app\hudtyping\docs\04-dictionary-api.md`
- 전체 플랜: `C:\Users\바다\.claude\plans\fancy-petting-bunny.md`

## 진행 단계
- Phase 1: Next.js + Clerk 인증 ✓
- Phase 2: Neon DB + 관리자 승인 시스템 ✓
- Phase 3: 우리말샘 검색 + Redis 캐싱 + 사용 통계 ✓
- Phase 4-2: 사용자별 API 키 발급 시스템 ✓
- Phase 4-3: 로컬 HUD가 SaaS의 `/api/search` 호출하도록 수정 ✓
- Phase 4-5: 사용 통계 대시보드 ✓
- 리팩토링: 4-layer 아키텍처 적용 (features/ + infrastructure/) ✓
- Phase 5: 관리자 페이지 (회원 승인 + 전체 통계) ✓
- Phase 6: UI/UX + 랜딩 마무리 (다음 작업)
- Phase 7: Vercel 배포 (도메인 확정)
- Phase 4-4: .exe 빌드 + GitHub Releases (Phase 7 후)
- Phase 4-1: 랜딩 다운로드 CTA (4-4 후)
