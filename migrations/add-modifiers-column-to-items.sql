-- Migration: Add modifiers column to pizza, pie, mini_pie, and sandwich tables
ALTER TABLE pizza ADD COLUMN modifiers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE pie ADD COLUMN modifiers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE mini_pie ADD COLUMN modifiers jsonb DEFAULT '[]'::jsonb;
ALTER TABLE sandwich ADD COLUMN modifiers jsonb DEFAULT '[]'::jsonb;

-- (Optional) If you want to remove the menuItemModifiers table after migration:
-- DROP TABLE menuItemModifiers;
