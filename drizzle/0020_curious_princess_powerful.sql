CREATE TYPE "public"."license_product" AS ENUM('wordkeeper', 'sog_player');--> statement-breakpoint
ALTER TABLE "licenses" ADD COLUMN "product" "license_product" DEFAULT 'wordkeeper' NOT NULL;--> statement-breakpoint
CREATE INDEX "licenses_product_idx" ON "licenses" USING btree ("product");