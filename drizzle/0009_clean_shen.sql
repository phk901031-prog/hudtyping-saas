CREATE TABLE "desktop_connection_codes" (
	"code" text PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "desktop_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"clerk_id" text NOT NULL,
	"name" text NOT NULL,
	"prefix" text NOT NULL,
	"hash" text NOT NULL,
	"last_used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "desktop_tokens_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
ALTER TABLE "desktop_connection_codes" ADD CONSTRAINT "desktop_connection_codes_clerk_id_users_clerk_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "desktop_tokens" ADD CONSTRAINT "desktop_tokens_clerk_id_users_clerk_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "desktop_connection_codes_clerk_id_idx" ON "desktop_connection_codes" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "desktop_connection_codes_expires_at_idx" ON "desktop_connection_codes" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "desktop_tokens_clerk_id_idx" ON "desktop_tokens" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "desktop_tokens_hash_idx" ON "desktop_tokens" USING btree ("hash");