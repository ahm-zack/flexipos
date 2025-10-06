-- Add missing columns to categories table to match the schema
ALTER TABLE categories ADD COLUMN IF NOT EXISTS name_ar text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug text;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_category_id uuid;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Rename sort_order to display_order to match schema
ALTER TABLE categories RENAME COLUMN sort_order TO display_order;

-- Add unique constraint for business_id + slug combination
ALTER TABLE categories ADD CONSTRAINT IF NOT EXISTS categories_business_slug_unique UNIQUE(business_id, slug);

-- Update existing categories to have slugs (temporary for existing data)
UPDATE categories SET slug = LOWER(REPLACE(name, ' ', '-')) WHERE slug IS NULL;