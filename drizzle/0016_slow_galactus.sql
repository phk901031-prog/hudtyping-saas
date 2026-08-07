ALTER TABLE "typing_game_results" ADD COLUMN "correct_strokes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "typing_game_results" ADD COLUMN "error_strokes" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "typing_game_results" ADD COLUMN "metric_version" integer DEFAULT 1 NOT NULL;