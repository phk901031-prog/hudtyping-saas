ALTER TABLE "users" ADD COLUMN "unlimited_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "unlimited_permanent" boolean DEFAULT false NOT NULL;