CREATE TABLE "typing_game_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"clerk_id" text NOT NULL,
	"score" integer NOT NULL,
	"cpm" integer NOT NULL,
	"accuracy_basis_points" integer NOT NULL,
	"correct_chars" integer NOT NULL,
	"error_count" integer NOT NULL,
	"completed_prompts" integer NOT NULL,
	"duration_ms" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "typing_game_results_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "typing_game_results" ADD CONSTRAINT "typing_game_results_clerk_id_users_clerk_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "typing_game_results_clerk_id_idx" ON "typing_game_results" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "typing_game_results_created_at_idx" ON "typing_game_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "typing_game_results_score_idx" ON "typing_game_results" USING btree ("score");