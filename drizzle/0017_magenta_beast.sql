CREATE TYPE "public"."game_border_style" AS ENUM('soft', 'line', 'glow');--> statement-breakpoint
CREATE TYPE "public"."game_name_color" AS ENUM('mint', 'coral', 'violet', 'sky', 'gold');--> statement-breakpoint
CREATE TYPE "public"."typing_mode" AS ENUM('short', 'long');--> statement-breakpoint
CREATE TABLE "game_profiles" (
	"clerk_id" text PRIMARY KEY NOT NULL,
	"nickname" text NOT NULL,
	"name_color" "game_name_color" DEFAULT 'mint' NOT NULL,
	"border_style" "game_border_style" DEFAULT 'soft' NOT NULL,
	"region" text,
	"is_stenographer" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_profiles_nickname_unique" UNIQUE("nickname")
);
--> statement-breakpoint
CREATE TABLE "typing_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"mode" "typing_mode" NOT NULL,
	"body" text NOT NULL,
	"source" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "typing_results" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" text NOT NULL,
	"clerk_id" text NOT NULL,
	"content_id" integer NOT NULL,
	"net_speed" integer NOT NULL,
	"raw_speed" integer,
	"accuracy_basis_points" integer NOT NULL,
	"error_count" integer NOT NULL,
	"duration_ms" integer NOT NULL,
	"suspicious" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "typing_results_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
ALTER TABLE "game_profiles" ADD CONSTRAINT "game_profiles_clerk_id_users_clerk_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_results" ADD CONSTRAINT "typing_results_clerk_id_users_clerk_id_fk" FOREIGN KEY ("clerk_id") REFERENCES "public"."users"("clerk_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "typing_results" ADD CONSTRAINT "typing_results_content_id_typing_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."typing_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "typing_contents_mode_active_idx" ON "typing_contents" USING btree ("mode","is_active");--> statement-breakpoint
CREATE INDEX "typing_results_clerk_id_idx" ON "typing_results" USING btree ("clerk_id");--> statement-breakpoint
CREATE INDEX "typing_results_content_id_idx" ON "typing_results" USING btree ("content_id");--> statement-breakpoint
CREATE INDEX "typing_results_created_at_idx" ON "typing_results" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "typing_results_net_speed_idx" ON "typing_results" USING btree ("net_speed");