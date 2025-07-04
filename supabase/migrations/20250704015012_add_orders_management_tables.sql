-- Add orders management system tables
-- Note: We're using a different enum name to avoid conflicts with existing order_status

-- Create enums for orders management system
CREATE TYPE "public"."orders_status" AS ENUM('pending', 'completed', 'canceled', 'modified');
CREATE TYPE "public"."item_type" AS ENUM('pizza', 'pie', 'sandwich', 'mini_pie');
CREATE TYPE "public"."modification_type" AS ENUM('item_added', 'item_removed', 'quantity_changed', 'item_replaced', 'multiple_changes');

-- Create orders table
CREATE TABLE "public"."orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "order_number" text NOT NULL UNIQUE,
    "customer_name" text,
    "items" jsonb NOT NULL,
    "total_amount" numeric(10, 2) NOT NULL,
    "status" "orders_status" DEFAULT 'pending' NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    "created_by" uuid NOT NULL REFERENCES "public"."users"("id")
);

-- Create canceled_orders table
CREATE TABLE "public"."canceled_orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "original_order_id" uuid NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "canceled_at" timestamp with time zone DEFAULT now() NOT NULL,
    "canceled_by" uuid NOT NULL REFERENCES "public"."users"("id"),
    "reason" text,
    "order_data" jsonb NOT NULL
);

-- Create modified_orders table
CREATE TABLE "public"."modified_orders" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "original_order_id" uuid NOT NULL REFERENCES "public"."orders"("id") ON DELETE CASCADE,
    "modified_at" timestamp with time zone DEFAULT now() NOT NULL,
    "modified_by" uuid NOT NULL REFERENCES "public"."users"("id"),
    "modification_type" "modification_type" NOT NULL,
    "original_data" jsonb NOT NULL,
    "new_data" jsonb NOT NULL
);

-- Create indexes for better performance
CREATE INDEX "idx_orders_status" ON "public"."orders" ("status");
CREATE INDEX "idx_orders_created_by" ON "public"."orders" ("created_by");
CREATE INDEX "idx_orders_created_at" ON "public"."orders" ("created_at");
CREATE INDEX "idx_orders_order_number" ON "public"."orders" ("order_number");
CREATE INDEX "idx_canceled_orders_original_order_id" ON "public"."canceled_orders" ("original_order_id");
CREATE INDEX "idx_modified_orders_original_order_id" ON "public"."modified_orders" ("original_order_id");

-- Create trigger to update updated_at on orders
CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_orders_updated_at
    BEFORE UPDATE ON "public"."orders"
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- Add RLS policies for orders management
ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."canceled_orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."modified_orders" ENABLE ROW LEVEL SECURITY;

-- Orders policies
CREATE POLICY "Users can view all orders" ON "public"."orders"
    FOR SELECT USING (true);

CREATE POLICY "Users can create orders" ON "public"."orders"
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update orders they created" ON "public"."orders"
    FOR UPDATE USING (created_by = auth.uid());

-- Canceled orders policies
CREATE POLICY "Users can view canceled orders" ON "public"."canceled_orders"
    FOR SELECT USING (true);

CREATE POLICY "Users can create canceled orders" ON "public"."canceled_orders"
    FOR INSERT WITH CHECK (true);

-- Modified orders policies
CREATE POLICY "Users can view modified orders" ON "public"."modified_orders"
    FOR SELECT USING (true);

CREATE POLICY "Users can create modified orders" ON "public"."modified_orders"
    FOR INSERT WITH CHECK (true);
