-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for business types
CREATE TYPE business_type AS ENUM (
  'restaurant',
  'retail',
  'service',
  'healthcare',
  'beauty',
  'automotive',
  'fitness',
  'education',
  'other'
);

-- Create businesses table
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type business_type NOT NULL,
  description TEXT,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create business_users table (many-to-many relationship)
CREATE TABLE business_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'staff',
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, user_id)
);

-- Create categories table (scoped to business)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, name)
);

-- Create menu_items table (scoped to business and category)
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modifiers table (scoped to business)
CREATE TABLE modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'single', -- 'single' or 'multiple'
  is_required BOOLEAN DEFAULT false,
  min_selections INTEGER DEFAULT 0,
  max_selections INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create modifier_options table
CREATE TABLE modifier_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create menu_item_modifiers junction table
CREATE TABLE menu_item_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
  modifier_id UUID NOT NULL REFERENCES modifiers(id) ON DELETE CASCADE,
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(menu_item_id, modifier_id)
);

-- Create indexes for performance
CREATE INDEX idx_businesses_type ON businesses(type);
CREATE INDEX idx_business_users_business_id ON business_users(business_id);
CREATE INDEX idx_business_users_user_id ON business_users(user_id);
CREATE INDEX idx_categories_business_id ON categories(business_id);
CREATE INDEX idx_categories_business_id_active ON categories(business_id, is_active);
CREATE INDEX idx_menu_items_business_id ON menu_items(business_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_business_id_available ON menu_items(business_id, is_available);
CREATE INDEX idx_modifiers_business_id ON modifiers(business_id);
CREATE INDEX idx_modifiers_business_id_active ON modifiers(business_id, is_active);
CREATE INDEX idx_modifier_options_modifier_id ON modifier_options(modifier_id);
CREATE INDEX idx_menu_item_modifiers_menu_item_id ON menu_item_modifiers(menu_item_id);
CREATE INDEX idx_menu_item_modifiers_modifier_id ON menu_item_modifiers(modifier_id);

-- Insert sample restaurant business
INSERT INTO businesses (id, name, type, description, settings) VALUES 
(
  'b1234567-89ab-cdef-0123-456789abcdef',
  'Sample Restaurant',
  'restaurant',
  'A sample restaurant to demonstrate the dynamic POS system',
  '{
    "currency": "USD",
    "tax_rate": 0.08,
    "service_charge": 0,
    "receipt_footer": "Thank you for dining with us!",
    "theme": {
      "primary_color": "#2563EB",
      "secondary_color": "#10B981"
    }
  }'
);

-- Insert sample categories
INSERT INTO categories (business_id, name, description, color, sort_order) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', 'Appetizers', 'Start your meal right', '#EF4444', 1),
('b1234567-89ab-cdef-0123-456789abcdef', 'Main Courses', 'Hearty main dishes', '#10B981', 2),
('b1234567-89ab-cdef-0123-456789abcdef', 'Desserts', 'Sweet endings', '#F59E0B', 3),
('b1234567-89ab-cdef-0123-456789abcdef', 'Beverages', 'Refreshing drinks', '#3B82F6', 4);

-- Insert sample menu items
INSERT INTO menu_items (business_id, category_id, name, description, base_price, sort_order) VALUES 
(
  'b1234567-89ab-cdef-0123-456789abcdef',
  (SELECT id FROM categories WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Appetizers'),
  'Buffalo Wings',
  'Spicy chicken wings with blue cheese dipping sauce',
  12.99,
  1
),
(
  'b1234567-89ab-cdef-0123-456789abcdef',
  (SELECT id FROM categories WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Main Courses'),
  'Grilled Salmon',
  'Fresh Atlantic salmon with lemon herb seasoning',
  24.99,
  1
),
(
  'b1234567-89ab-cdef-0123-456789abcdef',
  (SELECT id FROM categories WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Beverages'),
  'Craft Beer',
  'Local brewery selection',
  6.99,
  1
);

-- Insert sample modifiers
INSERT INTO modifiers (business_id, name, type, is_required, min_selections, max_selections, sort_order) VALUES 
(
  'b1234567-89ab-cdef-0123-456789abcdef',
  'Size',
  'single',
  true,
  1,
  1,
  1
),
(
  'b1234567-89ab-cdef-0123-456789abcdef',
  'Extra Toppings',
  'multiple',
  false,
  0,
  3,
  2
);

-- Insert sample modifier options
INSERT INTO modifier_options (modifier_id, name, price_adjustment, sort_order) VALUES 
(
  (SELECT id FROM modifiers WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Size'),
  'Small',
  0.00,
  1
),
(
  (SELECT id FROM modifiers WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Size'),
  'Medium',
  2.00,
  2
),
(
  (SELECT id FROM modifiers WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Size'),
  'Large',
  4.00,
  3
),
(
  (SELECT id FROM modifiers WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Extra Toppings'),
  'Extra Cheese',
  1.50,
  1
),
(
  (SELECT id FROM modifiers WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef' AND name = 'Extra Toppings'),
  'Bacon',
  2.00,
  2
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_modifiers_updated_at BEFORE UPDATE ON modifiers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();