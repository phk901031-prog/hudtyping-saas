CREATE TABLE "official_binaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"version" text NOT NULL,
	"sha256" text NOT NULL,
	"released_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text,
	CONSTRAINT "official_binaries_sha256_unique" UNIQUE("sha256")
);
--> statement-breakpoint
CREATE INDEX "official_binaries_sha256_idx" ON "official_binaries" USING btree ("sha256");