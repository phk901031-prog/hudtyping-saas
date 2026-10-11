CREATE TABLE "app_settings" (
	"id" integer PRIMARY KEY NOT NULL,
	"default_monthly_limit" integer DEFAULT 500 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "monthly_limit" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "monthly_limit" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "search_logs" ADD COLUMN "source" text;--> statement-breakpoint
-- 전역 설정 싱글톤 row 시딩 (기존 블랭킷 기본값과 동일한 500으로 시작 — 관리자가 이후 조정).
INSERT INTO "app_settings" ("id", "default_monthly_limit") VALUES (1, 500) ON CONFLICT DO NOTHING;--> statement-breakpoint
-- 기존 사용자 행은 전부 옛 컬럼 기본값(500)이 그대로 찍혀 있었다. 정확히 500인 행은
-- "의도적으로 500으로 맞춘 VIP override"가 아니라 "한 번도 손대지 않은 기본값"일
-- 확률이 사실상 100%이므로 NULL로 되돌려 전역 기본값을 따르게 한다. 500이 아닌
-- 값(예: VIP 5000)은 의도된 override이므로 그대로 보존한다.
UPDATE "users" SET "monthly_limit" = NULL WHERE "monthly_limit" = 500;