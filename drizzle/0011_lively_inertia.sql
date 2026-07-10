CREATE TABLE "word_detail_cache" (
	"target_code" text PRIMARY KEY NOT NULL,
	"result" jsonb NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "word_detail_cache_updated_at_idx" ON "word_detail_cache" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "word_detail_cache_hit_count_idx" ON "word_detail_cache" USING btree ("hit_count");