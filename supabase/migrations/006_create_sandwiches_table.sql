-- Create enum types for sandwiches FIRST
DO $$
BEGIN
  -- Create sandwich type enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sandwich_type') THEN
    CREATE TYPE sandwich_type AS ENUM (
      'Beef Sandwich with Cheese',
      'Chicken Sandwich with Cheese', 
      'Muhammara Sandwich with Cheese'
    );
  END IF;

  -- Create sandwich size enum if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sandwich_size') THEN
    CREATE TYPE sandwich_size AS ENUM (
      'small',
      'medium',
      'large'
    );
  END IF;
END $$;

-- Create sandwiches table
CREATE TABLE IF NOT EXISTS sandwiches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type sandwich_type NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  size sandwich_size NOT NULL,
  image_url TEXT NOT NULL,
  price_with_vat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insert sample sandwich data with placeholder images
INSERT INTO sandwiches (type, name_ar, name_en, size, image_url, price_with_vat) VALUES
  ('Beef Sandwich with Cheese', 'ساندويتش لحم بقري مع الجبن', 'Beef Sandwich with Cheese', 'medium', 'https://via.placeholder.com/300x200/8B4513/FFFFFF?text=Beef+Sandwich', 28.50),
  ('Chicken Sandwich with Cheese', 'ساندويتش دجاج مع الجبن', 'Chicken Sandwich with Cheese', 'medium', 'https://via.placeholder.com/300x200/F4A460/FFFFFF?text=Chicken+Sandwich', 25.75),
  ('Muhammara Sandwich with Cheese', 'ساندويتش المحمرة مع الجبن', 'Muhammara Sandwich with Cheese', 'large', 'https://via.placeholder.com/300x200/DC143C/FFFFFF?text=Muhammara+Sandwich', 32.00);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sandwiches_type ON sandwiches(type);
CREATE INDEX IF NOT EXISTS idx_sandwiches_size ON sandwiches(size);
CREATE INDEX IF NOT EXISTS idx_sandwiches_created_at ON sandwiches(created_at);

-- Update function for automatic updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for sandwiches table
DROP TRIGGER IF EXISTS update_sandwiches_updated_at ON sandwiches;
CREATE TRIGGER update_sandwiches_updated_at
    BEFORE UPDATE ON sandwiches
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
