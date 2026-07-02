// src/db/schema.ts
// 우리 PostgreSQL DB의 테이블 구조를 TypeScript로 선언한다.
// drizzle-kit이 이 파일을 읽고 마이그레이션 SQL을 자동 생성하며,
// 런타임에는 이 스키마 정보로 타입 안전한 쿼리(`db.select().from(users)...`)를 만든다.

import {
  pgTable,
  pgEnum,
  text,
  timestamp,
  serial,
  boolean,
  index,
  integer,
  jsonb,
} from "drizzle-orm/pg-core";

// PostgreSQL의 ENUM 타입을 정의 — DB 레벨에서 잘못된 값 입력을 차단한다.
// 예: status 컬럼에 'banana'를 넣으려 하면 DB가 거부.
export const userStatusEnum = pgEnum("user_status", [
  "pending", // 가입 직후, 관리자 승인 대기 중
  "approved", // 승인됨, 워크스페이스 사용 가능
  "rejected", // 거절됨 (필요하면 나중에 거절 사유도 추가)
]);

export const userRoleEnum = pgEnum("user_role", [
  "user", // 일반 사용자
  "admin", // 관리자 (회원 승인, 통계 조회 권한)
]);

// users 테이블
// - Clerk이 사용자 인증 자체는 처리하지만, 우리 비즈니스 로직(승인 상태, 역할 등)은 우리 DB에서 관리.
// - clerk_id를 PK로 써서 Clerk과 1:1 매핑.
export const users = pgTable("users", {
  // Clerk이 발급한 사용자 ID (예: "user_2abc..."). 이게 곧 우리 PK.
  clerkId: text("clerk_id").primaryKey(),

  // 이메일 (Clerk webhook으로 가입 시 받아와 저장). 중복 방지.
  email: text("email").notNull().unique(),

  // 사용자 성명 (Clerk firstName/lastName).
  // 관리자가 가입자 식별할 때 이메일만으로 부족할 수 있어 별도 보관.
  // NULL 허용: 기존 가입자(이름 없이 가입)와 호환 + Clerk이 이름 정보 안 보낼 케이스 방어.
  firstName: text("first_name"),
  lastName: text("last_name"),

  // 승인 상태 — 기본값 'pending', 관리자가 'approved'로 바꿔야 워크스페이스 입장 가능.
  status: userStatusEnum("status").notNull().default("pending"),

  // 역할 — 기본값 'user'. 관리자 한 명을 직접 'admin'으로 승격해 부트스트랩한다.
  role: userRoleEnum("role").notNull().default("user"),

  // 월 검색 한도. 매월 1일 0시(UTC) 리셋.
  // - 일반 사용자: 기본 500회. 관리자가 사용자별로 조정 가능 (예: VIP에게 5000으로).
  // - admin은 role='admin'으로 한도 체크 자체를 스킵 (이 컬럼 값과 무관하게 무제한).
  monthlyLimit: integer("monthly_limit").notNull().default(500),

  // 생성/수정 시각 — 'with timezone'으로 UTC 기준 저장.
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// 다른 파일에서 타입을 참조할 수 있게 export.
//   const u: User = ...    (조회 결과 타입)
//   const newU: NewUser = { clerkId: "...", email: "..." }    (insert 입력 타입)
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

// enum 값 union — 입력 검증·타입 좁히기에 사용
export type UserStatus = (typeof userStatusEnum.enumValues)[number]; // "pending" | "approved" | "rejected"
export type UserRole = (typeof userRoleEnum.enumValues)[number]; // "user" | "admin"

// ──────────────────────────────────────────────────────────────────────
// official_binaries — 공식 빌드한 .exe 의 SHA-256 화이트리스트
// 새 .exe 빌드 후 hash를 여기 등록하면 그 빌드만 검색 인증 통과.
// 사용자가 .exe 변조 → hash 다름 → SaaS가 인증 거부 → 검색 불가.
// ──────────────────────────────────────────────────────────────────────
export const officialBinaries = pgTable(
  "official_binaries",
  {
    id: serial("id").primaryKey(),
    version: text("version").notNull(), // "0.2.0"
    sha256: text("sha256").notNull().unique(), // 64자 hex
    releasedAt: timestamp("released_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    notes: text("notes"), // 릴리스 노트 메모 (선택)
  },
  (table) => [index("official_binaries_sha256_idx").on(table.sha256)]
);

// search_logs 테이블 — 모든 검색 요청을 1건씩 기록.
// 1년 무료 운영 동안 모인 데이터로 다음을 분석:
//   - 사용자별 활동량 (유료화 협상 시 데이터)
//   - 가장 많이 검색되는 단어 top N
//   - 캐시 적중률
//   - 시간대별 사용 패턴
export const searchLogs = pgTable(
  "search_logs",
  {
    id: serial("id").primaryKey(),
    // users.clerk_id 참조 — 사용자 삭제 시 로그도 cascade 삭제
    clerkId: text("clerk_id")
      .notNull()
      .references(() => users.clerkId, { onDelete: "cascade" }),
    query: text("query").notNull(),
    cacheHit: boolean("cache_hit").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    // 자주 쓸 쿼리들에 인덱스:
    //   - 사용자별 활동: WHERE clerk_id = ? ORDER BY created_at DESC
    //   - 인기 단어 집계: GROUP BY query
    //   - 시간 범위 쿼리: WHERE created_at >= ?
    index("search_logs_clerk_id_idx").on(table.clerkId),
    index("search_logs_query_idx").on(table.query),
    index("search_logs_created_at_idx").on(table.createdAt),
  ]
);

export type SearchLog = typeof searchLogs.$inferSelect;
export type NewSearchLog = typeof searchLogs.$inferInsert;

// api_keys 테이블 — 로컬 HUD가 SaaS의 /api/search 호출 시 인증용 토큰.
//
// 흐름:
//   1) 사용자가 SaaS 대시보드에서 "새 키 발급" 클릭
//   2) 서버에서 hk_live_<32자> 형태의 평문 토큰 생성
//   3) 평문은 응답 1회만 보여주고, DB에는 SHA256 해시만 저장 (탈취 시 안전)
//   4) 사용자가 로컬 HUD 설정에 평문 토큰 붙여넣기
//   5) 이후 모든 검색 요청에 Authorization: Bearer hk_live_... 헤더로 인증
//
// 한 사용자가 여러 키 발급 가능 (예: "노트북", "회사 PC")
export const apiKeys = pgTable(
  "api_keys",
  {
    id: serial("id").primaryKey(),
    // unique() 제약: 사용자당 키 1개만 강제 (DB 레벨 race 차단).
    // 동시에 두 발급 요청이 와도 두 번째는 unique violation으로 실패.
    clerkId: text("clerk_id")
      .notNull()
      .unique()
      .references(() => users.clerkId, { onDelete: "cascade" }),
    // 사용자가 키를 식별하는 이름 (예: "내 노트북")
    name: text("name").notNull(),
    // 키의 앞부분 (예: "hk_live_a1b2c3d4") — 목록 화면에서 어떤 키인지 보여주려고
    prefix: text("prefix").notNull(),
    // SHA256 해시 — 평문은 절대 저장 안 함. 검증 시 입력 토큰을 같은 방식으로 해시해서 비교.
    hash: text("hash").notNull().unique(),
    // 마지막으로 사용된 시각 (검증 성공 시 갱신) — 미사용 키 식별용
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("api_keys_clerk_id_idx").on(table.clerkId),
    // 검증 시 해시로 조회 → 이게 가장 빈번한 쿼리
    index("api_keys_hash_idx").on(table.hash),
  ]
);

export type ApiKey = typeof apiKeys.$inferSelect;
export type NewApiKey = typeof apiKeys.$inferInsert;

export const dictionaryCache = pgTable(
  "dictionary_cache",
  {
    query: text("query").primaryKey(),
    result: jsonb("result").notNull(),
    hitCount: integer("hit_count").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
  },
  (table) => [
    index("dictionary_cache_updated_at_idx").on(table.updatedAt),
    index("dictionary_cache_hit_count_idx").on(table.hitCount),
  ]
);

export type DictionaryCache = typeof dictionaryCache.$inferSelect;
export type NewDictionaryCache = typeof dictionaryCache.$inferInsert;
