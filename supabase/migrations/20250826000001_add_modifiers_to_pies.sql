-- Add modifiers column to pies table
-- This migration adds the missing modifiers column to the pies table

-- Add modifiers column to pies table
ALTER TABLE pies ADD COLUMN modifiers JSONB DEFAULT '[]'::JSONB NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN pies.modifiers IS 'JSON array of modifiers available for this pie item';

-- Notify completion
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Added modifiers column to pies table successfully!';
  RAISE NOTICE 'The modifiers column is now available for storing pie modifier data';
END $$;
