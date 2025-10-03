-- Migration: Migrate Data from Static to Dynamic Schema
-- Purpose: Move data from separate product tables to unified menu_items table
-- Run AFTER create_dynamic_product_schema.sql

-- First, check if we have existing static tables to migrate from
DO $$
BEGIN
  RAISE NOTICE 'Starting migration from static product tables to dynamic schema...';
END $$;

-- 1. Create default business (assuming single business for now)
INSERT INTO businesses (id, name, name_ar, type, settings)
VALUES (
  'default-business-id'::uuid,
  'FlexiPOS Restaurant',
  'مطعم فليكسي بوس',
  'restaurant',
  '{
    "currency": "SAR",
    "timezone": "Asia/Riyadh",
    "language": "en",
    "vat_rate": 0.15,
    "features": ["modifiers", "categories", "multi_language"]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- 2. Create categories based on existing product types
INSERT INTO categories (id, business_id, name, name_ar, slug, description, display_order, icon, color)
VALUES 
  (gen_random_uuid(), 'default-business-id'::uuid, 'Pizza', 'بيتزا', 'pizza', 'Delicious pizzas with various toppings', 1, '🍕', '#FF6B6B'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Burger', 'برغر', 'burger', 'Juicy burgers with fresh ingredients', 2, '🍔', '#4ECDC4'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Appetizers', 'مقبلات', 'appetizers', 'Tasty starters and appetizers', 3, '🥗', '#45B7D1'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Beverages', 'مشروبات', 'beverages', 'Refreshing drinks and beverages', 4, '🥤', '#96CEB4'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Sandwich', 'سندويش', 'sandwich', 'Fresh sandwiches with quality ingredients', 5, '🥪', '#FECA57'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Shawerma', 'شاورما', 'shawerma', 'Traditional Middle Eastern shawerma', 6, '🌯', '#FF9FF3'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Pie', 'فطيرة', 'pie', 'Sweet and savory pies', 7, '🥧', '#54A0FF'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Mini Pie', 'فطيرة صغيرة', 'mini-pie', 'Bite-sized delicious mini pies', 8, '🧁', '#5F27CD'),
  (gen_random_uuid(), 'default-business-id'::uuid, 'Side Order', 'طلبات جانبية', 'side-order', 'Perfect sides to complete your meal', 9, '🍟', '#00D2D3')
ON CONFLICT (business_id, slug) DO NOTHING;

-- 3. Migrate data from existing tables (if they exist)
-- Note: This assumes the old tables exist. Add checks as needed.

-- Migrate pizzas (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pizzas') THEN
    INSERT INTO menu_items (
      business_id, category_id, name, name_ar, description, description_ar, 
      price, image_url, is_active, is_featured, is_available, display_order
    )
    SELECT 
      'default-business-id'::uuid as business_id,
      (SELECT id FROM categories WHERE slug = 'pizza' LIMIT 1) as category_id,
      p.name,
      p.name_ar,
      p.description,
      p.description_ar,
      p.price,
      p.image_url,
      p.is_active,
      p.is_featured,
      p.is_available,
      p.id::int as display_order
    FROM pizzas p
    WHERE NOT EXISTS (
      SELECT 1 FROM menu_items mi 
      WHERE mi.name = p.name AND mi.category_id = (SELECT id FROM categories WHERE slug = 'pizza' LIMIT 1)
    );
    
    RAISE NOTICE 'Migrated pizzas to menu_items';
  ELSE
    RAISE NOTICE 'Pizzas table does not exist, skipping pizza migration';
  END IF;
END $$;

-- Migrate burgers (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'burgers') THEN
    INSERT INTO menu_items (
      business_id, category_id, name, name_ar, description, description_ar, 
      price, image_url, is_active, is_featured, is_available, display_order
    )
    SELECT 
      'default-business-id'::uuid as business_id,
      (SELECT id FROM categories WHERE slug = 'burger' LIMIT 1) as category_id,
      b.name,
      b.name_ar,
      b.description,
      b.description_ar,
      b.price,
      b.image_url,
      b.is_active,
      b.is_featured,
      b.is_available,
      b.id::int as display_order
    FROM burgers b
    WHERE NOT EXISTS (
      SELECT 1 FROM menu_items mi 
      WHERE mi.name = b.name AND mi.category_id = (SELECT id FROM categories WHERE slug = 'burger' LIMIT 1)
    );
    
    RAISE NOTICE 'Migrated burgers to menu_items';
  ELSE
    RAISE NOTICE 'Burgers table does not exist, skipping burger migration';
  END IF;
END $$;

-- Migrate appetizers (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appetizers') THEN
    INSERT INTO menu_items (
      business_id, category_id, name, name_ar, description, description_ar, 
      price, image_url, is_active, is_featured, is_available, display_order
    )
    SELECT 
      'default-business-id'::uuid as business_id,
      (SELECT id FROM categories WHERE slug = 'appetizers' LIMIT 1) as category_id,
      a.name,
      a.name_ar,
      a.description,
      a.description_ar,
      a.price,
      a.image_url,
      a.is_active,
      a.is_featured,
      a.is_available,
      a.id::int as display_order
    FROM appetizers a
    WHERE NOT EXISTS (
      SELECT 1 FROM menu_items mi 
      WHERE mi.name = a.name AND mi.category_id = (SELECT id FROM categories WHERE slug = 'appetizers' LIMIT 1)
    );
    
    RAISE NOTICE 'Migrated appetizers to menu_items';
  ELSE
    RAISE NOTICE 'Appetizers table does not exist, skipping appetizers migration';
  END IF;
END $$;

-- Continue with other product types...
-- (Similar patterns for beverages, sandwiches, shawermas, pies, mini_pies, side_orders)

-- 4. Create some sample data if no existing data was migrated
INSERT INTO menu_items (business_id, category_id, name, name_ar, description, price, is_active, is_featured)
SELECT 
  'default-business-id'::uuid,
  c.id,
  CASE c.slug
    WHEN 'pizza' THEN 'Sample Margherita Pizza'
    WHEN 'burger' THEN 'Sample Classic Burger'
    WHEN 'appetizers' THEN 'Sample Chicken Wings'
    WHEN 'beverages' THEN 'Sample Fresh Juice'
    ELSE 'Sample ' || c.name
  END,
  CASE c.slug
    WHEN 'pizza' THEN 'بيتزا مارغريتا نموذجية'
    WHEN 'burger' THEN 'برغر كلاسيكي نموذجي'
    WHEN 'appetizers' THEN 'أجنحة دجاج نموذجية'
    WHEN 'beverages' THEN 'عصير طازج نموذجي'
    ELSE 'نموذج ' || c.name_ar
  END,
  'Sample item for ' || c.name || ' category',
  25.00,
  true,
  false
FROM categories c
WHERE NOT EXISTS (
  SELECT 1 FROM menu_items mi WHERE mi.category_id = c.id
);

-- 5. Create some sample modifiers
INSERT INTO modifiers (business_id, name, name_ar, type, is_required, max_selections)
VALUES 
  ('default-business-id'::uuid, 'Size', 'الحجم', 'single', true, 1),
  ('default-business-id'::uuid, 'Extra Toppings', 'إضافات إضافية', 'multiple', false, 5),
  ('default-business-id'::uuid, 'Drink Size', 'حجم المشروب', 'single', false, 1)
ON CONFLICT DO NOTHING;

-- 6. Add modifier options
INSERT INTO modifier_options (modifier_id, name, name_ar, price_adjustment, display_order)
SELECT 
  m.id,
  CASE m.name
    WHEN 'Size' THEN unnest(ARRAY['Small', 'Medium', 'Large'])
    WHEN 'Extra Toppings' THEN unnest(ARRAY['Extra Cheese', 'Pepperoni', 'Mushrooms', 'Olives', 'Bell Peppers'])
    WHEN 'Drink Size' THEN unnest(ARRAY['Regular', 'Large'])
  END,
  CASE m.name
    WHEN 'Size' THEN unnest(ARRAY['صغير', 'متوسط', 'كبير'])
    WHEN 'Extra Toppings' THEN unnest(ARRAY['جبن إضافي', 'بيبروني', 'مشروم', 'زيتون', 'فلفل حلو'])
    WHEN 'Drink Size' THEN unnest(ARRAY['عادي', 'كبير'])
  END,
  CASE m.name
    WHEN 'Size' THEN unnest(ARRAY[0.00, 5.00, 10.00])
    WHEN 'Extra Toppings' THEN unnest(ARRAY[3.00, 4.00, 2.00, 1.50, 2.50])
    WHEN 'Drink Size' THEN unnest(ARRAY[0.00, 3.00])
  END,
  row_number() OVER ()
FROM modifiers m;

-- 7. Link some modifiers to menu items (example)
INSERT INTO menu_item_modifiers (menu_item_id, modifier_id)
SELECT 
  mi.id,
  m.id
FROM menu_items mi
CROSS JOIN modifiers m
WHERE mi.category_id IN (
  SELECT id FROM categories WHERE slug IN ('pizza', 'burger', 'beverages')
)
AND (
  (m.name = 'Size' AND mi.category_id IN (SELECT id FROM categories WHERE slug IN ('pizza', 'burger'))) OR
  (m.name = 'Extra Toppings' AND mi.category_id = (SELECT id FROM categories WHERE slug = 'pizza')) OR
  (m.name = 'Drink Size' AND mi.category_id = (SELECT id FROM categories WHERE slug = 'beverages'))
)
ON CONFLICT DO NOTHING;

-- 8. Final summary
DO $$
DECLARE
  business_count int;
  category_count int;
  menu_item_count int;
  modifier_count int;
BEGIN
  SELECT COUNT(*) INTO business_count FROM businesses;
  SELECT COUNT(*) INTO category_count FROM categories;
  SELECT COUNT(*) INTO menu_item_count FROM menu_items;
  SELECT COUNT(*) INTO modifier_count FROM modifiers;
  
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Created % businesses', business_count;
  RAISE NOTICE 'Created % categories', category_count;
  RAISE NOTICE 'Created % menu items', menu_item_count;
  RAISE NOTICE 'Created % modifiers', modifier_count;
END $$;