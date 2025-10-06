-- Create products table for inventory management
-- Migration: 20251005000003_create_products_table.sql

-- Create products table
CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    price DECIMAL(10,2) NOT NULL DEFAULT 0,
    cost_price DECIMAL(10,2) DEFAULT 0,
    images TEXT[] DEFAULT '{}',
    variants JSONB DEFAULT '[]',
    modifiers JSONB DEFAULT '[]',
    tags TEXT[] DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    stock_quantity INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_business_id ON products(business_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);

-- Create unique constraint on SKU per business
CREATE UNIQUE INDEX idx_products_sku_business ON products(business_id, sku) WHERE sku IS NOT NULL;
CREATE UNIQUE INDEX idx_products_barcode_business ON products(business_id, barcode) WHERE barcode IS NOT NULL;

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view products for their business" ON products
    FOR SELECT USING (
        business_id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can create products for their business" ON products
    FOR INSERT WITH CHECK (
        business_id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can update products for their business" ON products
    FOR UPDATE USING (
        business_id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can delete products for their business" ON products
    FOR DELETE USING (
        business_id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample products for the development business and categories
INSERT INTO public.products (business_id, category_id, name, name_ar, description, price, sku, is_active, is_featured, stock_quantity) VALUES
-- Pizza category products
('b1234567-89ab-cdef-0123-456789abcdef', 
 (SELECT id FROM categories WHERE name = 'Pizzas' AND business_id = 'b1234567-89ab-cdef-0123-456789abcdef'), 
 'Margherita Pizza', 'بيتزا مارغريتا', 'Classic tomato, mozzarella and basil pizza', 18.50, 'PIZZA-001', true, true, 50),

('b1234567-89ab-cdef-0123-456789abcdef', 
 (SELECT id FROM categories WHERE name = 'Pizzas' AND business_id = 'b1234567-89ab-cdef-0123-456789abcdef'), 
 'Pepperoni Pizza', 'بيتزا بيبروني', 'Classic pepperoni with mozzarella cheese', 22.00, 'PIZZA-002', true, true, 35),

-- Burger category products
('b1234567-89ab-cdef-0123-456789abcdef', 
 (SELECT id FROM categories WHERE name = 'Burgers' AND business_id = 'b1234567-89ab-cdef-0123-456789abcdef'), 
 'Classic Beef Burger', 'برجر لحم كلاسيكي', 'Juicy beef patty with lettuce, tomato, and cheese', 16.00, 'BURGER-001', true, true, 25),

('b1234567-89ab-cdef-0123-456789abcdef', 
 (SELECT id FROM categories WHERE name = 'Burgers' AND business_id = 'b1234567-89ab-cdef-0123-456789abcdef'), 
 'Chicken Burger', 'برجر دجاج', 'Grilled chicken breast with fresh vegetables', 14.50, 'BURGER-002', true, false, 30),

-- Beverage category products  
('b1234567-89ab-cdef-0123-456789abcdef', 
 (SELECT id FROM categories WHERE name = 'Beverages' AND business_id = 'b1234567-89ab-cdef-0123-456789abcdef'), 
 'Fresh Orange Juice', 'عصير برتقال طازج', 'Freshly squeezed orange juice', 6.50, 'BEV-001', true, false, 100),

('b1234567-89ab-cdef-0123-456789abcdef', 
 (SELECT id FROM categories WHERE name = 'Beverages' AND business_id = 'b1234567-89ab-cdef-0123-456789abcdef'), 
 'Arabic Coffee', 'قهوة عربية', 'Traditional Arabic coffee', 4.00, 'BEV-002', true, true, 200);