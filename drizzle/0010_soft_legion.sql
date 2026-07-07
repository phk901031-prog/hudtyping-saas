CREATE TABLE "operator_dictionary_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"term" text NOT NULL,
	"match_key" text NOT NULL,
	"label" text DEFAULT '운영자 등록 표기' NOT NULL,
	"note" text NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "operator_dictionary_entries_match_key_unique" UNIQUE("match_key")
);
--> statement-breakpoint
ALTER TABLE "operator_dictionary_entries" ADD CONSTRAINT "operator_dictionary_entries_created_by_users_clerk_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("clerk_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "operator_dictionary_entries_match_key_idx" ON "operator_dictionary_entries" USING btree ("match_key");--> statement-breakpoint
CREATE INDEX "operator_dictionary_entries_enabled_idx" ON "operator_dictionary_entries" USING btree ("enabled");