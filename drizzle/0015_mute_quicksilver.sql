ALTER TABLE "users" ADD COLUMN "game_nickname" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "game_name_color" text DEFAULT 'mint' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "game_border_style" text DEFAULT 'soft' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "users_game_nickname_unique_idx" ON "users" USING btree ("game_nickname");