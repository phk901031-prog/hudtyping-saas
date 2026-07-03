ALTER TABLE "search_logs" ADD COLUMN "status" text DEFAULT 'success' NOT NULL;--> statement-breakpoint
ALTER TABLE "search_logs" ADD COLUMN "error_code" text;--> statement-breakpoint
ALTER TABLE "search_logs" ADD COLUMN "response_ms" integer;--> statement-breakpoint
ALTER TABLE "search_logs" ADD COLUMN "app_version" text;