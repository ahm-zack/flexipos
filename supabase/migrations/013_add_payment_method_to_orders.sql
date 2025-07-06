-- Add payment_method column to orders table

-- Add payment_method column to orders table (enum already exists from migration 012)
ALTER TABLE "public"."orders" 
ADD COLUMN "payment_method" "payment_method" NOT NULL DEFAULT 'cash';

-- Create index for better performance
CREATE INDEX "idx_orders_payment_method" ON "public"."orders" ("payment_method");
