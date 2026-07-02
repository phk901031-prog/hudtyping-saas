CREATE TABLE "dictionary_cache" (
	"query" text PRIMARY KEY NOT NULL,
	"result" jsonb NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_used_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "dictionary_cache_updated_at_idx" ON "dictionary_cache" USING btree ("updated_at");--> statement-breakpoint
CREATE INDEX "dictionary_cache_hit_count_idx" ON "dictionary_cache" USING btree ("hit_count");