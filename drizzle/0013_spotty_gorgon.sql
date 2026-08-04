CREATE TYPE "public"."license_plan" AS ENUM('lifetime', 'annual', 'trial');--> statement-breakpoint
CREATE TABLE "license_activations" (
	"id" serial PRIMARY KEY NOT NULL,
	"license_key" text NOT NULL,
	"fingerprint" text NOT NULL,
	"device_name" text,
	"activated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone,
	"deactivated_at" timestamp with time zone,
	"deactivation_reason" text
);
--> statement-breakpoint
CREATE TABLE "licenses" (
	"key" text PRIMARY KEY NOT NULL,
	"plan" "license_plan" NOT NULL,
	"duration_days" integer,
	"issued_to_email" text,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	"activated_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"max_activations" integer DEFAULT 1 NOT NULL,
	"revoked_at" timestamp with time zone,
	"notes" text,
	"created_by" text
);
--> statement-breakpoint
ALTER TABLE "license_activations" ADD CONSTRAINT "license_activations_license_key_licenses_key_fk" FOREIGN KEY ("license_key") REFERENCES "public"."licenses"("key") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_created_by_users_clerk_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("clerk_id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "license_activations_license_key_idx" ON "license_activations" USING btree ("license_key");--> statement-breakpoint
CREATE INDEX "license_activations_fingerprint_idx" ON "license_activations" USING btree ("fingerprint");--> statement-breakpoint
CREATE INDEX "licenses_plan_idx" ON "licenses" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "licenses_issued_to_email_idx" ON "licenses" USING btree ("issued_to_email");