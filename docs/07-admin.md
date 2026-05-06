# 07. 관리자 페이지 (Phase 5)

## 결과물
- `features/admin/service.ts` — 권한 검사 + 회원 CRUD + 전체 통계 집계
- `app/(dashboard)/admin/layout.tsx` — `role='admin'`만 통과 (아니면 /dashboard로 redirect)
- `app/(dashboard)/admin/page.tsx` — 관리자 진입 화면 (회원/통계 카드)
- `app/(dashboard)/admin/users/page.tsx` — 회원 목록 + status 필터 + 액션 버튼
- `app/(dashboard)/admin/stats/page.tsx` — 사용자 분포 + 검색 요약 + 일별 그래프 + 인기 검색어
- `app/api/admin/users/[id]/route.ts` — PATCH 엔드포인트 (status/role 변경)
- `components/admin/user-action-buttons.tsx` — 클라이언트 컴포넌트 (PATCH + router.refresh)
- 대시보드에 admin 카드 (role=admin인 사용자에게만 표시)

## 권한 모델

```
요청 → (dashboard) layout: 인증 + status='approved' 검사
         ↓
       admin layout: role='admin' 검사
         ↓
       admin 페이지·API
```

이중 보호:
- **layout 레벨**: 페이지 접근 자체를 차단
- **API 레벨**: `/api/admin/*` 라우트도 자체적으로 `assertAdmin(me)` 호출 (외부 도구로 직접 호출 시도해도 막힘)

## 핵심 보안 결정

### 1. 자기 자신 admin 해제 차단
```ts
if (targetClerkId === me.clerkId && body.role === "user") {
  return Response.json({ error: "본인의 관리자 권한은 해제할 수 없어요." }, { status: 400 });
}
```
관리자가 자기 자신을 demote하면 lock-out 발생 → 다른 관리자가 없으면 시스템에서 admin 다시 만들 방법이 SQL 직접 실행밖에 없음. 안전 장치로 차단.

### 2. status 변경 시 updated_at 자동 갱신
`updateUserStatus`/`updateUserRole`에서 `set({ status, updatedAt: new Date() })`. 감사(audit) 로그가 따로 없는 동안에는 updated_at으로 "마지막으로 누가 언제 건드렸는지" 추적 가능.

### 3. WHERE 절에 권한 격리는 admin은 예외
일반 사용자는 본인 키만 다룰 수 있게 `WHERE clerk_id = ?` 강제했지만, admin은 다른 사용자의 row를 다뤄야 하므로 그 제약 없음. 대신 `assertAdmin` 통과가 전제 조건.

## 새 구조 적용 사례

이 Phase는 리팩토링 후 작성된 첫 번째 도메인. 새 구조의 좋은 예:

```
src/
├── features/admin/service.ts      # 비즈니스 로직 (assertAdmin, listUsers, updateUserStatus, ...)
├── app/(dashboard)/admin/         # 페이지 (RSC, service 호출)
│   ├── layout.tsx                  # role 검사
│   ├── page.tsx
│   ├── users/page.tsx
│   └── stats/page.tsx
├── app/api/admin/users/[id]/route.ts  # 30줄 (검증+파싱+service 호출+응답)
└── components/admin/user-action-buttons.tsx   # 클라이언트 인터랙션
```

라우트(40여 줄)는 검증과 입출력만 다루고, 실제 SQL은 service.ts 안에. UI는 RSC로 데이터 가져오고 인터랙션만 클라이언트로 분리.

## 일별 그래프 구현
차트 라이브러리 없이 CSS만으로 막대 그래프:
```tsx
<div className="flex items-end gap-1 h-40">
  {daily.map((d) => (
    <div key={d.day} className="flex-1 ...">
      <div style={{ height: `${(d.cnt / maxDaily) * 100}%` }} />
      <span>{d.day.slice(5)}</span>
    </div>
  ))}
</div>
```
나중에 더 정교한 차트가 필요하면 `recharts`나 `tremor` 같은 거 추가 가능. 지금은 30일 일자별 단순 비교에 충분.

## 검증 시나리오 (수동)

1. `UPDATE users SET role='admin' WHERE email='바다 이메일'` (이미 했으면 스킵)
2. `/dashboard` 접속 → 보라색 "🛠 관리자" 카드 추가 표시
3. 카드 클릭 → `/admin` → 회원/통계 두 카드
4. **회원 관리**:
   - 필터 탭 클릭으로 status별 필터
   - "승인"/"거절"/"관리자로" 버튼 → 즉시 반영
   - 본인 row의 "관리자 해제"는 비활성화
5. **전체 통계**:
   - 사용자 분포 (전체/대기/승인/거절)
   - 검색 요약 (총 검색·캐시 적중률·검색한 사용자 수)
   - 일별 그래프 (최근 30일)
   - 인기 검색어 top 20
6. 비-admin 계정으로 직접 `/admin` 접속 시도 → `/dashboard`로 redirect

## 다음 (Phase 6)
- UI/UX 마무리: 다크/라이트 모드, 반응형, 에러 페이지
- 랜딩 페이지 정비 (다운로드 CTA 자리만 비워둠)
