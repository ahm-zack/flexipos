-- Create Pie Table Migration
-- This migration adds the pies table with all required columns and constraints

-- Create pie type enum
CREATE TYPE pie_type AS ENUM (
  'Akkawi Cheese',
  'Halloumi Cheese', 
  'Cream Cheese',
  'Zaatar',
  'Labneh & Vegetables',
  'Muhammara + Akkawi Cheese + Zaatar',
  'Akkawi Cheese + Zaatar',
  'Labneh + Zaatar',
  'Halloumi Cheese + Zaatar',
  'Sweet Cheese + Akkawi + Mozzarella'
);

-- Create pie size enum
CREATE TYPE pie_size AS ENUM ('small', 'medium', 'large');

-- Create pies table
CREATE TABLE pies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type pie_type NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  size pie_size NOT NULL,
  image_url TEXT NOT NULL,
  price_with_vat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for pies table
CREATE TRIGGER update_pies_updated_at
  BEFORE UPDATE ON pies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_pies_type ON pies(type);
CREATE INDEX idx_pies_size ON pies(size);
CREATE INDEX idx_pies_created_at ON pies(created_at);

-- Insert sample pie data with placeholder images
INSERT INTO pies (type, name_ar, name_en, size, image_url, price_with_vat) VALUES
  ('Akkawi Cheese', 'فطيرة جبنة العكاوي', 'Akkawi Cheese Pie', 'medium', 'https://via.placeholder.com/300x200/FFD700/000000?text=Akkawi+Cheese', 25.50),
  ('Halloumi Cheese', 'فطيرة جبنة الحلوم', 'Halloumi Cheese Pie', 'medium', 'https://via.placeholder.com/300x200/98FB98/000000?text=Halloumi+Cheese', 27.00),
  ('Cream Cheese', 'فطيرة الجبنة الكريمية', 'Cream Cheese Pie', 'large', 'https://via.placeholder.com/300x200/F0E68C/000000?text=Cream+Cheese', 29.75),
  ('Zaatar', 'فطيرة الزعتر', 'Zaatar Pie', 'medium', 'https://via.placeholder.com/300x200/8FBC8F/000000?text=Zaatar', 22.25),
  ('Labneh & Vegetables', 'فطيرة اللبنة والخضار', 'Labneh & Vegetables Pie', 'small', 'https://via.placeholder.com/300x200/90EE90/000000?text=Labneh+Vegetables', 24.50),
  ('Muhammara + Akkawi Cheese + Zaatar', 'فطيرة المحمرة مع العكاوي والزعتر', 'Muhammara + Akkawi Cheese + Zaatar Pie', 'large', 'https://via.placeholder.com/300x200/DC143C/FFFFFF?text=Muhammara+Mix', 35.00);
