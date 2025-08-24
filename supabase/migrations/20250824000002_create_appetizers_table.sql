-- Migration: Create appetizers table
-- Description: Add appetizers table to support appetizer items management

-- Create appetizers table
CREATE TABLE appetizers (
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
CREATE OR REPLACE FUNCTION update_appetizers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_appetizers_updated_at
    BEFORE UPDATE ON appetizers
    FOR EACH ROW
    EXECUTE FUNCTION update_appetizers_updated_at();

-- Create index for performance
CREATE INDEX idx_appetizers_created_at ON appetizers(created_at);

-- Insert some sample appetizers
INSERT INTO appetizers (name_ar, name_en, image_url, price_with_vat) VALUES
('موزاريلا ستيكس', 'Mozzarella Sticks', 'https://via.placeholder.com/400x300', 32.00),
('كالاماري مقلي', 'Fried Calamari', 'https://via.placeholder.com/400x300', 45.00),
('روبيان مقلي', 'Fried Shrimp', 'https://via.placeholder.com/400x300', 55.00),
('ناتشوز', 'Nachos', 'https://via.placeholder.com/400x300', 38.00),
('فطائر الجبن', 'Cheese Quesadilla', 'https://via.placeholder.com/400x300', 28.00);

-- Notification
DO $$
BEGIN
    RAISE NOTICE '✅ Appetizers table created successfully!';
    RAISE NOTICE 'Added sample appetizers data';
END $$;
