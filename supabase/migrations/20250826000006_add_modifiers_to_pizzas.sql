-- Add modifiers column to pizzas table
-- This migration adds the missing modifiers column to the pizzas table

-- Add modifiers column to pizzas table
ALTER TABLE pizzas ADD COLUMN modifiers JSONB DEFAULT '[]'::JSONB NOT NULL;

-- Add comment to document the column
COMMENT ON COLUMN pizzas.modifiers IS 'JSON array of modifiers available for this pizza item';

-- Notify completion
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Added modifiers column to pizzas table successfully!';
  RAISE NOTICE 'The modifiers column is now available for storing pizza modifier data';
END $$;
