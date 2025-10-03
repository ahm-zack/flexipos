-- Migration: Create Dynamic Product Schema
-- Purpose: Create unified tables to replace separate product tables
-- Run on dynamic database (ports 54421-54426)

-- 1. Create businesses table (multi-tenant support)
CREATE TABLE IF NOT EXISTS businesses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  name_ar text,
  type text NOT NULL DEFAULT 'restaurant',
  settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 2. Create categories table (replaces hardcoded product types)
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  slug text NOT NULL,
  description text,
  description_ar text,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  icon text,
  color text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_id, slug)
);

-- 3. Create menu_items table (unified product table)
CREATE TABLE IF NOT EXISTS menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  description text,
  description_ar text,
  price decimal(10,2) NOT NULL DEFAULT 0.00,
  cost_price decimal(10,2) DEFAULT 0.00,
  sku text,
  image_url text,
  is_active boolean DEFAULT true,
  is_featured boolean DEFAULT false,
  is_available boolean DEFAULT true,
  stock_quantity integer DEFAULT 0,
  low_stock_threshold integer DEFAULT 10,
  preparation_time integer DEFAULT 0, -- in minutes
  calories integer,
  allergens text[],
  tags text[],
  metadata jsonb DEFAULT '{}', -- For extensibility
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(business_id, sku) DEFERRABLE INITIALLY DEFERRED
);

-- 4. Create modifiers table
CREATE TABLE IF NOT EXISTS modifiers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id uuid REFERENCES businesses(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  type text NOT NULL DEFAULT 'single', -- 'single', 'multiple'
  is_required boolean DEFAULT false,
  max_selections integer DEFAULT 1,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 5. Create modifier_options table
CREATE TABLE IF NOT EXISTS modifier_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  modifier_id uuid REFERENCES modifiers(id) ON DELETE CASCADE,
  name text NOT NULL,
  name_ar text,
  price_adjustment decimal(10,2) DEFAULT 0.00,
  is_active boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 6. Create menu_item_modifiers junction table
CREATE TABLE IF NOT EXISTS menu_item_modifiers (
  menu_item_id uuid REFERENCES menu_items(id) ON DELETE CASCADE,
  modifier_id uuid REFERENCES modifiers(id) ON DELETE CASCADE,
  PRIMARY KEY (menu_item_id, modifier_id)
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_featured ON menu_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(is_available);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_modifiers_business_id ON modifiers(business_id);

-- 8. Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifiers_updated_at BEFORE UPDATE ON modifiers
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifier_options_updated_at BEFORE UPDATE ON modifier_options
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Enable RLS (Row Level Security)
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;

-- 10. Create RLS policies (basic - can be refined later)
CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON menu_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON menu_items FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON menu_items FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON categories FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON categories FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON categories FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for all users" ON businesses FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users only" ON businesses FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON businesses FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON businesses FOR DELETE USING (auth.role() = 'authenticated');