CREATE TYPE "public"."modifier_type" AS ENUM('extra', 'without');--> statement-breakpoint
CREATE TABLE "menu_item_modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"menu_item_type" text NOT NULL,
	"name" text NOT NULL,
	"type" "modifier_type" NOT NULL,
	"price" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" text DEFAULT 'true' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_item_modifiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_id" uuid NOT NULL,
	"menu_item_id" uuid NOT NULL,
	"menu_item_type" text NOT NULL,
	"modifier_id" uuid NOT NULL,
	"modifier_name" text NOT NULL,
	"modifier_type" "modifier_type" NOT NULL,
	"price_at_time" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "eod_reports" ADD COLUMN "report_number" text;--> statement-breakpoint
ALTER TABLE "order_item_modifiers" ADD CONSTRAINT "order_item_modifiers_modifier_id_menu_item_modifiers_id_fk" FOREIGN KEY ("modifier_id") REFERENCES "public"."menu_item_modifiers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eod_reports" ADD CONSTRAINT "eod_reports_report_number_unique" UNIQUE("report_number");