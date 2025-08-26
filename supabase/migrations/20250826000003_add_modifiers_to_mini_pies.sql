-- Add modifiers column to mini_pies table
-- This migration adds the missing modifiers column to the mini_pies table

-- Add modifiers column to mini_pies table
ALTER TABLE mini_pies ADD COLUMN modifiers JSONB DEFAULT '[]'::JSONB NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN mini_pies.modifiers IS 'JSON array of modifiers available for this mini pie item';

-- Notify completion
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Added modifiers column to mini_pies table successfully!';
  RAISE NOTICE 'The modifiers column is now available for storing mini pie modifier data';
END $$;
