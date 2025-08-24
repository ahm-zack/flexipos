-- Migration: Create side_orders table
-- Description: Add side_orders table to support side items management

-- Create side_orders table
CREATE TABLE side_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    image_url TEXT NOT NULL,
    price_with_vat DECIMAL(10, 2) NOT NULL,
    modifiers JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_side_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_side_orders_updated_at
    BEFORE UPDATE ON side_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_side_orders_updated_at();

-- Create index for performance
CREATE INDEX idx_side_orders_created_at ON side_orders(created_at);

-- Insert some sample side orders
INSERT INTO side_orders (name_ar, name_en, image_url, price_with_vat) VALUES
('خبز ثوم', 'Garlic Bread', 'https://via.placeholder.com/400x300', 15.00),
('أجنحة دجاج', 'Chicken Wings', 'https://via.placeholder.com/400x300', 35.00),
('بطاطس مقلية', 'French Fries', 'https://via.placeholder.com/400x300', 18.00),
('سلطة سيزر', 'Caesar Salad', 'https://via.placeholder.com/400x300', 28.00),
('حلقات البصل', 'Onion Rings', 'https://via.placeholder.com/400x300', 22.00);

-- Notification
DO $$
BEGIN
    RAISE NOTICE '✅ Side orders table created successfully!';
    RAISE NOTICE 'Added sample side orders data';
END $$;
