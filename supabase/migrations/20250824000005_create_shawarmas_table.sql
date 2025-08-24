-- Migration: Create shawarmas table
-- Description: Add shawarmas table to support shawarma items management

-- Create shawarmas table
CREATE TABLE shawarmas (
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
CREATE OR REPLACE FUNCTION update_shawarmas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_shawarmas_updated_at
    BEFORE UPDATE ON shawarmas
    FOR EACH ROW
    EXECUTE FUNCTION update_shawarmas_updated_at();

-- Create index for performance
CREATE INDEX idx_shawarmas_created_at ON shawarmas(created_at);

-- Insert some sample shawarmas
INSERT INTO shawarmas (name_ar, name_en, image_url, price_with_vat) VALUES
('شاورما دجاج', 'Chicken Shawarma', 'https://via.placeholder.com/400x300', 25.00),
('شاورما لحم', 'Beef Shawarma', 'https://via.placeholder.com/400x300', 28.00),
('شاورما مشكل', 'Mixed Shawarma', 'https://via.placeholder.com/400x300', 30.00),
('شاورما عربي', 'Arabic Shawarma', 'https://via.placeholder.com/400x300', 26.00),
('شاورما بالجبنة', 'Cheese Shawarma', 'https://via.placeholder.com/400x300', 27.00);

-- Notification
DO $$
BEGIN
    RAISE NOTICE '✅ Shawarmas table created successfully!';
    RAISE NOTICE 'Added sample shawarmas data';
END $$;
