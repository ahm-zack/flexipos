-- Add missing item types to the item_type enum
-- This will extend the enum to include all item types used in the application

ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'beverage';
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'appetizer';
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'burger';
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'shawerma';
ALTER TYPE item_type ADD VALUE IF NOT EXISTS 'side-order';
