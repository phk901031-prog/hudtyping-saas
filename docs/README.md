# 문서 인덱스

이 폴더는 hudtyping SaaS의 모든 문서를 모은다. 목적별로 분리.

## 📐 아키텍처 ([architecture/](architecture/))
시스템 구조와 레이어. **코드 작업 전 반드시 읽기.**
- [overview.md](architecture/overview.md) — 전체 시스템 그림 + 외부 의존성
- [layers.md](architecture/layers.md) — 레이어 정의 + 현재 상태 + 리팩토링 목표
- [data-flow.md](architecture/data-flow.md) — 주요 흐름(검색·인증·키 발급)의 단계별 시퀀스

## 📋 제품 스펙 ([spec/](spec/))
사업적 정의와 로드맵. **신규 합류자/투자자에게 보여줄 자료.**
- [product.md](spec/product.md) — 무엇을 누구에게 왜 만드는가
- [roadmap.md](spec/roadmap.md) — Phase별 진행 상황 + 향후 계획

## 📖 사용자 매뉴얼 ([manual/](manual/))
**최종 사용자(속기사)용** 가이드. 스크린샷 포함.
- [user-guide.md](manual/user-guide.md) — SaaS 가입~승인~검색 흐름
- [local-hud-setup.md](manual/local-hud-setup.md) — 로컬 HUD .exe 설치 + API 키 연결

## 📚 Phase별 학습 노트 (이 폴더 직속)
개발 진행하며 배운 점/결정사항을 Phase 단위로 기록. 디버깅·온보딩 자료.
- [00-overview.md](00-overview.md) — 프로젝트 처음 시작 시점의 컨셉
- [01-nextjs-setup.md](01-nextjs-setup.md) — Next.js 16 + Tailwind v4 셋업
- [02-clerk-auth.md](02-clerk-auth.md) — Clerk 7 인증 + Next.js 16 proxy.ts
- [03-neon-db.md](03-neon-db.md) — Neon + Drizzle + JIT provisioning
- [04-search-cache.md](04-search-cache.md) — 우리말샘 + Redis 공유 캐시
- [05-api-keys.md](05-api-keys.md) — API 키 발급 + SHA256 해시 저장
- [06-local-hud-integration.md](06-local-hud-integration.md) — 로컬 Electron HUD 통합

## 🛠 운영/유지보수 (운영 시작 후 추가 예정)
- (미작성) `operations/incident-response.md` — 장애 대응 매뉴얼
- (미작성) `operations/migrations.md` — DB 스키마 변경 절차
- (미작성) `operations/cost.md` — 무료 한도 모니터링 + 1년 후 유료화 전환

## 어디부터 읽어야 하나

| 역할 | 추천 순서 |
|------|---------|
| 신규 개발자 합류 | architecture/overview → architecture/layers → spec/product → 작업 도메인의 phase 노트 |
| 사업/투자자 | spec/product → spec/roadmap → manual/user-guide |
| 사용자 (속기사) | manual/user-guide → manual/local-hud-setup |
| 유지보수 (운영) | architecture/data-flow → 해당 도메인 phase 노트 → operations/ |

## 작성 규칙

- **md를 1차, html은 자동 변환**: 모든 문서는 마크다운으로 우선 작성. HTML 노출은 `/docs` 라우트에서 마크다운 렌더로 처리(Phase 6).
- **이미지는 [manual/screenshots/](manual/screenshots/)**: 사용자 매뉴얼 외엔 이미지 최소화 (텍스트가 검색 가능, 버전 관리 쉬움).
- **변경 이력은 git으로**: 문서 안에 "변경 이력" 섹션 만들지 말 것 (git log가 진실).
