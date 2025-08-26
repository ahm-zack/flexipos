-- Add modifiers column to sandwiches table
-- This migration adds the missing modifiers column to the sandwiches table

-- Add modifiers column to sandwiches table
ALTER TABLE sandwiches ADD COLUMN modifiers JSONB DEFAULT '[]'::JSONB NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN sandwiches.modifiers IS 'JSON array of modifiers available for this sandwich item';

-- Notify completion
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Added modifiers column to sandwiches table successfully!';
  RAISE NOTICE 'The modifiers column is now available for storing sandwich modifier data';
END $$;
