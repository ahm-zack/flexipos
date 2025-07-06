CREATE TYPE "public"."eod_order_status" AS ENUM('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."payment_method" AS ENUM('cash', 'card', 'mixed');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE TYPE "public"."report_type" AS ENUM('daily', 'custom', 'weekly', 'monthly');--> statement-breakpoint
CREATE TABLE "eod_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"report_date" date NOT NULL,
	"start_date_time" timestamp with time zone NOT NULL,
	"end_date_time" timestamp with time zone NOT NULL,
	"total_orders" integer DEFAULT 0 NOT NULL,
	"completed_orders" integer DEFAULT 0 NOT NULL,
	"cancelled_orders" integer DEFAULT 0 NOT NULL,
	"pending_orders" integer DEFAULT 0 NOT NULL,
	"total_revenue" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_with_vat" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_without_vat" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"vat_amount" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_cash_orders" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"total_card_orders" numeric(12, 2) DEFAULT '0.00' NOT NULL,
	"cash_orders_count" integer DEFAULT 0 NOT NULL,
	"card_orders_count" integer DEFAULT 0 NOT NULL,
	"average_order_value" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"peak_hour" text,
	"order_completion_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"order_cancellation_rate" numeric(5, 2) DEFAULT '0.00' NOT NULL,
	"payment_breakdown" jsonb,
	"best_selling_items" jsonb,
	"hourly_sales" jsonb,
	"generated_by" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"report_type" "report_type" DEFAULT 'daily' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "payment_method" "payment_method" DEFAULT 'cash' NOT NULL;--> statement-breakpoint
ALTER TABLE "eod_reports" ADD CONSTRAINT "eod_reports_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;