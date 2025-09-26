-- Add payment tracking columns to orders table
ALTER TABLE "public"."orders" 
ADD COLUMN "cash_amount" DECIMAL(10,2),
ADD COLUMN "card_amount" DECIMAL(10,2),
ADD COLUMN "cash_received" DECIMAL(10,2),
ADD COLUMN "change_amount" DECIMAL(10,2);

-- Add helpful comments
COMMENT ON COLUMN "public"."orders"."cash_amount" IS 'Amount paid with cash';
COMMENT ON COLUMN "public"."orders"."card_amount" IS 'Amount paid with card';
COMMENT ON COLUMN "public"."orders"."cash_received" IS 'Total cash received from customer';
COMMENT ON COLUMN "public"."orders"."change_amount" IS 'Change given to customer';