-- Make type columns nullable for menu items where type field is hidden from UI
-- This migration makes type columns optional since they're auto-generated from nameEn

-- Make mini_pies type column nullable
ALTER TABLE mini_pies ALTER COLUMN type DROP NOT NULL;

-- Make pies type column nullable 
ALTER TABLE pies ALTER COLUMN type DROP NOT NULL;

-- Make sandwiches type column nullable
ALTER TABLE sandwiches ALTER COLUMN type DROP NOT NULL;

-- Make pizzas type column nullable
ALTER TABLE pizzas ALTER COLUMN type DROP NOT NULL;

-- Notify completion
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Made type columns nullable for all menu item tables!';
  RAISE NOTICE 'Type fields are now optional since they are auto-generated from English names';
END $$;
