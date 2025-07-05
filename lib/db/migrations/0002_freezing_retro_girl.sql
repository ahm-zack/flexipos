CREATE TYPE "public"."orders_status" AS ENUM('completed', 'canceled', 'modified');--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DATA TYPE "public"."orders_status" USING "status"::text::"public"."orders_status";--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'completed';--> statement-breakpoint
DROP TYPE "public"."order_status";