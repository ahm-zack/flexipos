CREATE TYPE "public"."item_type" AS ENUM('pizza', 'pie', 'sandwich', 'mini_pie');--> statement-breakpoint
CREATE TYPE "public"."mini_pie_size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."mini_pie_type" AS ENUM('Mini Zaatar Pie', 'Mini Cheese Pie', 'Mini Spinach Pie', 'Mini Meat Pie (Ba''lakiya style)', 'Mini Halloumi Cheese Pie', 'Mini Hot Dog Pie', 'Mini Pizza Pie');--> statement-breakpoint
CREATE TYPE "public"."modification_type" AS ENUM('item_added', 'item_removed', 'quantity_changed', 'item_replaced', 'multiple_changes');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('pending', 'completed', 'canceled', 'modified');--> statement-breakpoint
CREATE TYPE "public"."sandwich_size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."sandwich_type" AS ENUM('Beef Sandwich with Cheese', 'Chicken Sandwich with Cheese', 'Muhammara Sandwich with Cheese');--> statement-breakpoint
CREATE TABLE "canceled_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_order_id" uuid NOT NULL,
	"canceled_at" timestamp with time zone DEFAULT now() NOT NULL,
	"canceled_by" uuid NOT NULL,
	"reason" text,
	"order_data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mini_pies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "mini_pie_type" NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"size" "mini_pie_size" NOT NULL,
	"image_url" text NOT NULL,
	"price_with_vat" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modified_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_order_id" uuid NOT NULL,
	"modified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"modified_by" uuid NOT NULL,
	"modification_type" "modification_type" NOT NULL,
	"original_data" jsonb NOT NULL,
	"new_data" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_number" text NOT NULL,
	"customer_name" text,
	"items" jsonb NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid NOT NULL,
	CONSTRAINT "orders_order_number_unique" UNIQUE("order_number")
);
--> statement-breakpoint
CREATE TABLE "sandwiches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "sandwich_type" NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"size" "sandwich_size" NOT NULL,
	"image_url" text NOT NULL,
	"price_with_vat" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pies" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."pie_type";--> statement-breakpoint
CREATE TYPE "public"."pie_type" AS ENUM('Akkawi Cheese', 'Halloumi Cheese', 'Cream Cheese', 'Zaatar', 'Labneh & Vegetables', 'Muhammara + Akkawi Cheese + Zaatar', 'Akkawi Cheese + Zaatar', 'Labneh + Zaatar', 'Halloumi Cheese + Zaatar', 'Sweet Cheese + Akkawi + Mozzarella');--> statement-breakpoint
ALTER TABLE "pies" ALTER COLUMN "type" SET DATA TYPE "public"."pie_type" USING "type"::"public"."pie_type";--> statement-breakpoint
ALTER TABLE "canceled_orders" ADD CONSTRAINT "canceled_orders_original_order_id_orders_id_fk" FOREIGN KEY ("original_order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "canceled_orders" ADD CONSTRAINT "canceled_orders_canceled_by_users_id_fk" FOREIGN KEY ("canceled_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modified_orders" ADD CONSTRAINT "modified_orders_original_order_id_orders_id_fk" FOREIGN KEY ("original_order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modified_orders" ADD CONSTRAINT "modified_orders_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pies" DROP COLUMN "crust";--> statement-breakpoint
DROP TYPE "public"."pie_crust";