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
  uniqueIndex,
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

  // 기간제 무제한 만료 시각(UTC). NULL이면 부여 안 됨. 이 시각 이전에는 monthly_limit
  // 을 무시하고 무제한 검색 허용. 만료되면 자동으로 원래 한도로 복귀 — 별도 크론 불필요.
  unlimitedUntil: timestamp("unlimited_until", { withTimezone: true }),

  // 영구 무제한 플래그. true 면 unlimited_until 값과 무관하게 항상 무제한.
  // admin 이 아닌 VIP 사용자에게 "기간 없이" 무제한을 부여할 때 사용.
  unlimitedPermanent: boolean("unlimited_permanent").notNull().default(false),

  // 타자 게임 순위표에 공개되는 별칭과 제한된 꾸미기 프리셋.
  // 임의 CSS는 받지 않고 서버가 허용한 식별자만 저장한다.
  gameNickname: text("game_nickname"),
  gameNameColor: text("game_name_color").notNull().default("mint"),
  gameBorderStyle: text("game_border_style").notNull().default("soft"),

  // 생성/수정 시각 — 'with timezone'으로 UTC 기준 저장.
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => [
  uniqueIndex("users_game_nickname_unique_idx").on(table.gameNickname),
]);

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
    status: text("status").notNull().default("success"),
    errorCode: text("error_code"),
    responseMs: integer("response_ms"),
    appVersion: text("app_version"),
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

export const desktopConnectionCodes = pgTable(
  "desktop_connection_codes",
  {
    code: text("code").primaryKey(),
    clerkId: text("clerk_id")
      .notNull()
      .references(() => users.clerkId, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("desktop_connection_codes_clerk_id_idx").on(table.clerkId),
    index("desktop_connection_codes_expires_at_idx").on(table.expiresAt),
  ]
);

export const desktopTokens = pgTable(
  "desktop_tokens",
  {
    id: serial("id").primaryKey(),
    clerkId: text("clerk_id")
      .notNull()
      .references(() => users.clerkId, { onDelete: "cascade" }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    hash: text("hash").notNull().unique(),
    lastUsedAt: timestamp("last_used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("desktop_tokens_clerk_id_idx").on(table.clerkId),
    index("desktop_tokens_hash_idx").on(table.hash),
  ]
);

export type DesktopConnectionCode =
  typeof desktopConnectionCodes.$inferSelect;
export type NewDesktopConnectionCode =
  typeof desktopConnectionCodes.$inferInsert;
export type DesktopToken = typeof desktopTokens.$inferSelect;
export type NewDesktopToken = typeof desktopTokens.$inferInsert;

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

// word_detail_cache — 우리말샘 view API 응답(예문 포함) 영구 캐시.
// dictionary_cache가 "검색 결과 목록"이라면 여기는 "특정 target_code의 상세".
// 별도 테이블인 이유: key 형태(target_code) · payload 구조가 완전히 달라서
// 하나에 섞으면 관리 복잡. 3-tier 캐시 정책은 동일 (Redis → 이 테이블 → API).
export const wordDetailCache = pgTable(
  "word_detail_cache",
  {
    targetCode: text("target_code").primaryKey(),
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
    index("word_detail_cache_updated_at_idx").on(table.updatedAt),
    index("word_detail_cache_hit_count_idx").on(table.hitCount),
  ]
);

export type WordDetailCache = typeof wordDetailCache.$inferSelect;
export type NewWordDetailCache = typeof wordDetailCache.$inferInsert;

export const operatorDictionaryEntries = pgTable(
  "operator_dictionary_entries",
  {
    id: serial("id").primaryKey(),
    term: text("term").notNull(),
    matchKey: text("match_key").notNull().unique(),
    label: text("label").notNull().default("운영자 등록 표기"),
    note: text("note").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    createdBy: text("created_by").references(() => users.clerkId, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("operator_dictionary_entries_match_key_idx").on(table.matchKey),
    index("operator_dictionary_entries_enabled_idx").on(table.enabled),
  ]
);

export type OperatorDictionaryEntry =
  typeof operatorDictionaryEntries.$inferSelect;
export type NewOperatorDictionaryEntry =
  typeof operatorDictionaryEntries.$inferInsert;

// ──────────────────────────────────────────────────────────────────────
// 낱말지기(hudtyping-local) 정품 라이선스
//
// licenses — CD-key 형태로 판매/배포하는 라이선스 원장.
//   - lifetime: durationDays/expiresAt 둘 다 항상 NULL (영구)
//   - annual/trial: durationDays 는 발급 시 정해두는 "부여할 기간"(연간=365,
//     체험판=7/14 등). expiresAt 은 **최초 활성화 시점에 activatedAt +
//     durationDays 로 딱 한 번만 계산해서 고정**한다 — 재설치·재활성화로
//     기간이 늘어나는 걸 막기 위한 핵심 규칙 (activate 서비스 로직에서 강제).
export const licensePlanEnum = pgEnum("license_plan", [
  "lifetime",
  "annual",
  "trial",
]);

export const licenses = pgTable(
  "licenses",
  {
    // 사람이 직접 입력하는 키. 예: HDTP-A3F9-B7E2-C1D8
    key: text("key").primaryKey(),
    plan: licensePlanEnum("plan").notNull(),
    // lifetime 이면 NULL. annual/trial 이면 발급 시 부여할 기간(일).
    durationDays: integer("duration_days"),
    issuedToEmail: text("issued_to_email"),
    issuedAt: timestamp("issued_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    // 최초 활성화 시각 — expiresAt 계산의 기준점. 활성화 전에는 NULL.
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    // 최초 활성화 시 1회만 계산되어 저장되고 이후 절대 재계산하지 않음.
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    // 동시에 활성화 가능한 기기 수 (기본 1대).
    maxActivations: integer("max_activations").notNull().default(1),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    notes: text("notes"),
    // 발급한 관리자 (Clerk ID). 관리자 계정 삭제돼도 라이선스는 남아야 하므로 SET NULL.
    createdBy: text("created_by").references(() => users.clerkId, {
      onDelete: "set null",
    }),
  },
  (table) => [
    index("licenses_plan_idx").on(table.plan),
    index("licenses_issued_to_email_idx").on(table.issuedToEmail),
  ]
);

export type License = typeof licenses.$inferSelect;
export type NewLicense = typeof licenses.$inferInsert;
export type LicensePlan = (typeof licensePlanEnum.enumValues)[number];

// licenseActivations — 라이선스 키가 실제로 활성화된 기기(지문) 목록.
// 한 라이선스에 여러 활성화 이력이 쌓일 수 있고(비활성화 후 재활성화 등),
// maxActivations 검사는 deactivatedAt이 NULL인 것만 센다.
export const licenseActivations = pgTable(
  "license_activations",
  {
    id: serial("id").primaryKey(),
    licenseKey: text("license_key")
      .notNull()
      .references(() => licenses.key, { onDelete: "cascade" }),
    fingerprint: text("fingerprint").notNull(),
    deviceName: text("device_name"),
    activatedAt: timestamp("activated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }),
    deactivatedAt: timestamp("deactivated_at", { withTimezone: true }),
    // 'user' | 'admin' | 'expired'
    deactivationReason: text("deactivation_reason"),
  },
  (table) => [
    index("license_activations_license_key_idx").on(table.licenseKey),
    index("license_activations_fingerprint_idx").on(table.fingerprint),
  ]
);

export type LicenseActivation = typeof licenseActivations.$inferSelect;
export type NewLicenseActivation = typeof licenseActivations.$inferInsert;

// 30초 보고 치기 결과. 문제 세션은 Redis에서 짧게 보관하고 검증이 끝난
// 요약 결과만 PostgreSQL에 남긴다. 원문 키 입력 스트림은 저장하지 않는다.
export const typingGameResults = pgTable(
  "typing_game_results",
  {
    id: serial("id").primaryKey(),
    sessionId: text("session_id").notNull().unique(),
    clerkId: text("clerk_id")
      .notNull()
      .references(() => users.clerkId, { onDelete: "cascade" }),
    score: integer("score").notNull(),
    cpm: integer("cpm").notNull(),
    accuracyBasisPoints: integer("accuracy_basis_points").notNull(),
    correctChars: integer("correct_chars").notNull(),
    correctStrokes: integer("correct_strokes").notNull().default(0),
    errorStrokes: integer("error_strokes").notNull().default(0),
    // 1: 옛 음절 기준, 2: 한컴식 자소 기준. 서로 다른 버전은 같은 순위에 섞지 않는다.
    metricVersion: integer("metric_version").notNull().default(1),
    errorCount: integer("error_count").notNull(),
    completedPrompts: integer("completed_prompts").notNull(),
    durationMs: integer("duration_ms").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("typing_game_results_clerk_id_idx").on(table.clerkId),
    index("typing_game_results_created_at_idx").on(table.createdAt),
    index("typing_game_results_score_idx").on(table.score),
  ]
);

export type TypingGameResult = typeof typingGameResults.$inferSelect;
export type NewTypingGameResult = typeof typingGameResults.$inferInsert;
