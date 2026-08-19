-- 옛 "30초 보고치기" 타자게임(자체 제작, kingoftyping 이식 전) 데이터 폐기.
-- 닉네임 2건 · 결과 37건 — 바다 확인 하에 의도적으로 소실, 백업/이관 없음.
-- 새 스키마(game_profiles / typing_contents / typing_results)는 0017 마이그레이션에서 이미 추가됨.
ALTER TABLE "typing_game_results" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "typing_game_results" CASCADE;--> statement-breakpoint
DROP INDEX "users_game_nickname_unique_idx";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "game_nickname";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "game_name_color";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "game_border_style";