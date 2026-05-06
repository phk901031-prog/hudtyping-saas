# Phase 5: 관리자 페이지 — 완료

날짜: 2026-05-05

## 결과
- features/admin/service.ts (assertAdmin, listUsers, updateUserStatus, updateUserRole, getGlobalStats)
- (dashboard)/admin/layout.tsx (role 검사)
- (dashboard)/admin/page.tsx, /users/page.tsx, /stats/page.tsx
- api/admin/users/[id]/route.ts (PATCH)
- components/admin/user-action-buttons.tsx (클라이언트 인터랙션)
- dashboard에 admin 카드 (role=admin만)

## 자동 검증
- /admin, /admin/users, /admin/stats → 307 (비로그인 redirect)
- /api/admin/users/test → 405 (PATCH만 받음, GET은 거부)
- 컴파일 에러 0

## 보안 가드
- (dashboard) layout: status='approved' 강제
- admin layout: role='admin' 강제
- API 라우트: assertAdmin(me) 추가 (외부 도구 우회 차단)
- 자기 자신 admin 해제 차단 (lock-out 방지)

## schema.ts 추가
- type UserStatus, type UserRole — enum 값 union으로 export. 입력 검증·타입 좁히기에 사용.

## 새 구조 적용 첫 사례
- service.ts에 비즈니스 로직 모음
- route.ts는 ~40줄 (검증·파싱·service 호출·응답만)
- RSC가 service.listUsers() 호출 → DB 직접 X
- 인터랙션은 client component로 분리

## 다음
Phase 6: UI/UX 마무리 + 랜딩 페이지 정비.
