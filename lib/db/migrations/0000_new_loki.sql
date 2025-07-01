CREATE TYPE "public"."pie_crust" AS ENUM('regular', 'graham', 'shortbread');--> statement-breakpoint
CREATE TYPE "public"."pie_size" AS ENUM('small', 'medium', 'large');--> statement-breakpoint
CREATE TYPE "public"."pie_type" AS ENUM('Apple', 'Cherry', 'Blueberry', 'Pumpkin', 'Pecan', 'Chocolate');--> statement-breakpoint
CREATE TYPE "public"."pizza_crust" AS ENUM('original', 'thin');--> statement-breakpoint
CREATE TYPE "public"."pizza_extras" AS ENUM('cheese', 'vegetables', 'Pepperoni', 'Mortadella', 'Chicken');--> statement-breakpoint
CREATE TYPE "public"."pizza_type" AS ENUM('Margherita', 'Vegetable', 'Pepperoni', 'Mortadella', 'Chicken');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('superadmin', 'admin', 'manager', 'cashier', 'kitchen');--> statement-breakpoint
CREATE TABLE "pies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "pie_type" NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"size" "pie_size" NOT NULL,
	"crust" "pie_crust" NOT NULL,
	"image_url" text NOT NULL,
	"price_with_vat" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pizzas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "pizza_type" NOT NULL,
	"name_ar" text NOT NULL,
	"name_en" text NOT NULL,
	"crust" "pizza_crust",
	"image_url" text NOT NULL,
	"extras" "pizza_extras",
	"price_with_vat" numeric(10, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" "role" DEFAULT 'cashier' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
