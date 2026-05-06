# 03. Neon DB + Drizzle ORM + 회원 승인 (Phase 2)

## 결과물
- Neon PostgreSQL 프로젝트 생성 (Tokyo 리전, 무료)
- `drizzle-orm` + `@neondatabase/serverless` + `drizzle-kit` 설치
- `users` 테이블 생성 (clerk_id, email, status enum, role enum, timestamps)
- JIT(Just-In-Time) provisioning으로 가입 사용자 자동 등록
- 보호 라우트 `(dashboard)` 그룹 + status 분기

## 핵심 개념

### 왜 Neon인가
- **서버리스 PostgreSQL**: 트래픽 없을 때 자동 sleep → 비용 0원, 첫 쿼리에 깨어남(0.5~1초)
- **HTTP 드라이버 제공**: Vercel 같은 서버리스 환경에서 TCP 연결 풀 걱정 없이 동작
- **무료 0.5GB**: 우리 사용자 정보 + 문서 저장에 충분 (1년 무료 운영 가능)

### 왜 Drizzle인가
- **타입 안전한 쿼리**: `db.select().from(users).where(eq(users.email, "..."))` — TS가 컬럼/타입 다 추론
- **SQL과 가까움**: Prisma처럼 추상화 두꺼운 게 아니라, 거의 SQL 그대로 — 디버깅·튜닝 쉬움
- **마이그레이션 자동 생성**: 스키마(`schema.ts`)만 바꾸면 `drizzle-kit generate`로 SQL 파일 자동 생성

## 마이그레이션 워크플로우

```
schema.ts 수정
  ↓ npm run db:generate
drizzle/0001_xxx.sql  ← 자동 생성된 SQL (Git에 커밋)
  ↓ npm run db:migrate
Neon DB에 실제 적용
```

NPM scripts (이미 추가됨):
- `db:generate` — 스키마 변경 → 마이그레이션 SQL 파일 생성
- `db:migrate` — 생성된 SQL을 실제 DB에 적용
- `db:push` — 개발 초기에 빠른 반영용 (마이그레이션 파일 안 만듦) ⚠️ DEV에서만
- `db:studio` — 브라우저 GUI로 테이블 확인/편집

## users 테이블 스키마

```ts
export const userStatusEnum = pgEnum("user_status", ["pending", "approved", "rejected"]);
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

export const users = pgTable("users", {
  clerkId: text("clerk_id").primaryKey(),         // Clerk 사용자 ID와 1:1 매핑
  email: text("email").notNull().unique(),
  status: userStatusEnum("status").notNull().default("pending"),
  role: userRoleEnum("role").notNull().default("user"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
```

PG `enum` 타입을 쓰면 DB 레벨에서 잘못된 값(예: `'banana'`) 입력이 차단된다.

## JIT vs Webhook — 두 패턴 비교

회원가입 시 **언제** 우리 DB에 row를 만들지에 대한 두 접근:

| 항목 | Webhook | JIT (Just-In-Time) |
|------|---------|-------------------|
| 트리거 | Clerk이 가입 즉시 우리 서버로 POST | 사용자가 첫 페이지 진입 시 |
| 외부 노출 필요 | ✅ (배포 또는 ngrok) | ❌ |
| row 생성 시점 | 가입 직후 | 첫 페이지 로드 시 |
| 배포 후 안정성 | 매우 안정적 | 안정적 (단, 첫 요청이 약간 느림) |
| 로컬 개발 편의 | 어려움 | 쉬움 |

**우리 선택**: 둘 다 작성. JIT가 즉시 동작하고, webhook은 Phase 7 배포 후 활성화 (가입 이벤트가 즉시 처리되도록 최적화).

### JIT 구현 (`src/db/users.ts`)
```ts
export async function getOrCreateCurrentUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  // 1) 일반 경로: 이미 DB에 있는 경우 (99% 케이스)
  const existing = await db.select().from(users)
    .where(eq(users.clerkId, userId)).limit(1);
  if (existing.length > 0) return existing[0];

  // 2) 처음 본 사용자 → Clerk에서 정보 가져와 INSERT
  const clerk = await clerkClient();
  const clerkUser = await clerk.users.getUser(userId);
  const [created] = await db.insert(users)
    .values({ clerkId: userId, email: clerkUser.emailAddresses[0].emailAddress })
    .onConflictDoNothing()
    .returning();

  return created ?? /* 동시 요청 race fallback */ ...;
}
```

### Webhook 구현 (`src/app/api/webhooks/clerk/route.ts`)
Clerk 7의 `verifyWebhook(req)` 헬퍼가 Svix 서명 검증을 자동 처리. 별도 패키지 불필요.

```ts
export async function POST(req: Request) {
  const event = await verifyWebhook(req); // 검증 실패 시 throw
  if (event.type === "user.created") {
    await db.insert(users)
      .values({ clerkId: event.data.id, email: ... })
      .onConflictDoNothing(); // JIT가 먼저 만들었어도 OK
  }
  return new Response(null, { status: 204 });
}
```

활성화 조건 (Phase 7에서):
1. Clerk 대시보드에 webhook URL 등록 (`https://<배포주소>/api/webhooks/clerk`)
2. `CLERK_WEBHOOK_SIGNING_SECRET` 환경변수 추가

## 보호 라우트 패턴 — `(dashboard)/layout.tsx`

```tsx
export default async function DashboardLayout({ children }) {
  const user = await getOrCreateCurrentUser();

  if (!user) redirect("/sign-in");                  // 비로그인
  if (user.status !== "approved") redirect("/pending"); // 승인 안 됨

  return <>{children}</>;
}
```

이 layout 아래의 모든 페이지(`/dashboard`, 곧 `/search`, `/workspace`, `/admin` 추가)는 **자동으로 인증 + 승인 검사를 통과해야** 렌더된다. 페이지마다 검사 코드를 반복할 필요 없음.

## 검증 결과 (수동, Neon SQL Editor + 브라우저)
1. `/sign-up`에서 가입 → JIT가 자동으로 users row 생성 (status='pending')
2. Neon SQL Editor에서 `SELECT * FROM users` → 가입자 row 확인 ✓
3. `/dashboard` 직접 접속 → status='pending'이라 `/pending`으로 redirect ✓
4. `UPDATE users SET status='approved' WHERE email=...` 실행
5. 브라우저 새로고침 → `/dashboard` 통과 → "환영해요 👋" 페이지 ✓

## 다음 Phase
Phase 3: **우리말샘 검색 + Upstash Redis 캐싱**
- `/api/search?q=단어` API 라우트
- 캐시 → 우리말샘 API → 캐시 저장 흐름
- 검색 페이지 UI
