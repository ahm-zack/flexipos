-- Quick test to verify payment columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name IN ('cash_amount', 'card_amount', 'cash_received', 'change_amount')
ORDER BY column_name;