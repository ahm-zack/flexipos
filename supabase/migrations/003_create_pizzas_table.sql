-- Create Pizza Table Migration
-- This migration adds the pizzas table with all required columns and constraints

-- Create pizza type enum
CREATE TYPE pizza_type AS ENUM ('Margherita', 'Vegetable', 'Pepperoni', 'Mortadella', 'Chicken');

-- Create pizza crust enum
CREATE TYPE pizza_crust AS ENUM ('original', 'thin');

-- Create pizza extras enum
CREATE TYPE pizza_extras AS ENUM ('cheese', 'vegetables', 'Pepperoni', 'Mortadella', 'Chicken');

-- Create pizzas table
CREATE TABLE pizzas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type pizza_type NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  crust pizza_crust,
  image_url TEXT NOT NULL,
  extras pizza_extras,
  price_with_vat DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create updated_at trigger for pizzas table
CREATE TRIGGER update_pizzas_updated_at
  BEFORE UPDATE ON pizzas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_pizzas_type ON pizzas(type);
CREATE INDEX idx_pizzas_crust ON pizzas(crust);
CREATE INDEX idx_pizzas_extras ON pizzas(extras);
CREATE INDEX idx_pizzas_created_at ON pizzas(created_at);

-- Insert sample pizza data with placeholder images
INSERT INTO pizzas (type, name_ar, name_en, crust, image_url, extras, price_with_vat) VALUES
  ('Margherita', 'مارجريتا', 'Margherita Pizza', 'original', 'https://via.placeholder.com/300x200/FF6B6B/FFFFFF?text=Margherita+Pizza', NULL, 24.99),
  ('Vegetable', 'بيتزا الخضار', 'Vegetable Pizza', 'thin', 'https://via.placeholder.com/300x200/4ECDC4/FFFFFF?text=Vegetable+Pizza', 'vegetables', 28.50),
  ('Pepperoni', 'بيبروني', 'Pepperoni Pizza', 'original', 'https://via.placeholder.com/300x200/45B7D1/FFFFFF?text=Pepperoni+Pizza', 'Pepperoni', 32.75),
  ('Mortadella', 'مورتاديلا', 'Mortadella Pizza', 'original', 'https://via.placeholder.com/300x200/F9CA24/FFFFFF?text=Mortadella+Pizza', 'Mortadella', 35.00),
  ('Chicken', 'بيتزا الدجاج', 'Chicken Pizza', 'thin', 'https://via.placeholder.com/300x200/A55A3C/FFFFFF?text=Chicken+Pizza', 'Chicken', 38.25);
