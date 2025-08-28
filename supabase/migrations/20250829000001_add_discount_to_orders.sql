-- Add discount fields to orders table
ALTER TABLE "public"."orders"
ADD COLUMN "discount_type" text CHECK (discount_type IN ('percentage', 'amount')),
ADD COLUMN "discount_value" numeric(5, 2),
ADD COLUMN "discount_amount" numeric(10, 2) DEFAULT 0;

-- Add comments for clarity
COMMENT ON COLUMN "public"."orders"."discount_type" IS 'Type of discount applied: percentage or amount';
COMMENT ON COLUMN "public"."orders"."discount_value" IS 'Original discount value entered (percentage or amount)';
COMMENT ON COLUMN "public"."orders"."discount_amount" IS 'Actual discount amount applied to the order';

-- Create index for discount queries
CREATE INDEX "idx_orders_discount_amount" ON "public"."orders" ("discount_amount") WHERE discount_amount > 0;
