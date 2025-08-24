-- Migration: Create burgers table
-- Description: Add burgers table to support burger items management

-- Create burgers table
CREATE TABLE burgers (
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
CREATE OR REPLACE FUNCTION update_burgers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_burgers_updated_at
    BEFORE UPDATE ON burgers
    FOR EACH ROW
    EXECUTE FUNCTION update_burgers_updated_at();

-- Create index for performance
CREATE INDEX idx_burgers_created_at ON burgers(created_at);

-- Insert some sample burgers
INSERT INTO burgers (name_ar, name_en, image_url, price_with_vat) VALUES
('برغر كلاسيك', 'Classic Burger', 'https://via.placeholder.com/400x300', 35.00),
('برغر بالجبنة', 'Cheeseburger', 'https://via.placeholder.com/400x300', 38.00),
('برغر دبل', 'Double Burger', 'https://via.placeholder.com/400x300', 45.00),
('برغر دجاج', 'Chicken Burger', 'https://via.placeholder.com/400x300', 32.00),
('برغر نباتي', 'Veggie Burger', 'https://via.placeholder.com/400x300', 30.00),
('برغر باربكيو', 'BBQ Burger', 'https://via.placeholder.com/400x300', 42.00);

-- Notification
DO $$
BEGIN
    RAISE NOTICE '✅ Burgers table created successfully!';
    RAISE NOTICE 'Added sample burgers data';
END $$;
