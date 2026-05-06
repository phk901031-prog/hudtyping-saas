# 00. 프로젝트 개요

## new-hudtyping-saas란?
hudtyping 데스크톱 앱(`C:\app\hudtyping`)의 SaaS(웹 서비스) 버전.
브라우저에서는 다른 앱(한글 등)을 자동으로 검색할 수 없으므로,
**SaaS 안에 회의록/문서 작성 워크스페이스를 직접 제공**하여
그 안에서 단어를 검색하며 글을 쓸 수 있게 하는 통합 환경이다.

## 학습 문서 구성
| 파일 | 다루는 단계 |
|------|-----------|
| 00-overview.md | 전체 개요 (이 문서) |
| 01-nextjs-setup.md | Phase 1, Step 1-1: Next.js 프로젝트 초기화 |
| 02-clerk-auth.md | Phase 1, Step 1-2~1-5: Clerk 인증 |
| 03-neon-db.md | Phase 2: Neon DB + 회원 관리 |
| 04-search-cache.md | Phase 3: 우리말샘 검색 + Redis 캐싱 |
| 05-editor-workspace.md | Phase 4: TipTap 에디터 워크스페이스 |
| 06-admin-page.md | Phase 5: 관리자 페이지 |
| glossary.md | 용어 사전 |

## 진행 원칙
- **레이어별 정확한 구현 우선**: 빠른 완성보다 한 단계씩 이해하며 쌓기
- **한국어 주석 필수**: 모든 코드에 한글 주석으로 의미 설명
- **각 Step 완료 후 학습 안내**: 무엇을 했고 왜 그렇게 했는지 설명
