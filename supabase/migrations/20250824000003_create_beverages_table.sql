-- Migration: Create beverages table
-- Description: Add beverages table to support beverage items management

-- Create beverages table
CREATE TABLE beverages (
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
CREATE OR REPLACE FUNCTION update_beverages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_beverages_updated_at
    BEFORE UPDATE ON beverages
    FOR EACH ROW
    EXECUTE FUNCTION update_beverages_updated_at();

-- Create index for performance
CREATE INDEX idx_beverages_created_at ON beverages(created_at);

-- Insert some sample beverages
INSERT INTO beverages (name_ar, name_en, image_url, price_with_vat) VALUES
('كوكا كولا', 'Coca Cola', 'https://via.placeholder.com/400x300', 8.00),
('عصير برتقال', 'Orange Juice', 'https://via.placeholder.com/400x300', 12.00),
('مياه', 'Water', 'https://via.placeholder.com/400x300', 5.00),
('قهوة', 'Coffee', 'https://via.placeholder.com/400x300', 15.00),
('شاي', 'Tea', 'https://via.placeholder.com/400x300', 10.00),
('عصير تفاح', 'Apple Juice', 'https://via.placeholder.com/400x300', 12.00);

-- Notification
DO $$
BEGIN
    RAISE NOTICE '✅ Beverages table created successfully!';
    RAISE NOTICE 'Added sample beverages data';
END $$;
