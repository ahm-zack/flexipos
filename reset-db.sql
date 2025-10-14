-- Reset FlexiPOS Database
-- This will drop all tables and reset the database to a clean state

-- Drop all tables if they exist
DROP TABLE IF EXISTS business_users CASCADE;
DROP TABLE IF EXISTS businesses CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all custom types if they exist
DROP TYPE IF EXISTS role CASCADE;

-- Recreate the role enum
CREATE TYPE role AS ENUM ('superadmin', 'admin', 'manager', 'cashier', 'kitchen');

-- Recreate core tables
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    role role NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE businesses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    vat_number TEXT,
    vat_rate DECIMAL(5,4) DEFAULT 0.0500,
    currency TEXT NOT NULL DEFAULT 'AED',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE business_users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role role NOT NULL DEFAULT 'cashier',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image TEXT,
    is_available BOOLEAN NOT NULL DEFAULT true,
    preparation_time INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Insert sample data
-- Super Admin User
INSERT INTO users (id, email, password, first_name, last_name, role) VALUES 
('550e8400-e29b-41d4-a716-446655440000', 'admin@flexipos.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'superadmin');

-- Sample Business
INSERT INTO businesses (id, name, address, phone, email, vat_number) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'FlexiPOS Demo Restaurant', '123 Main Street, Dubai, UAE', '+971-50-123-4567', 'demo@flexipos.com', 'VAT123456789');

-- Link super admin to business
INSERT INTO business_users (business_id, user_id, role) VALUES 
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'superadmin');

-- Sample Categories
INSERT INTO categories (id, business_id, name, description, display_order) VALUES 
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Appetizers', 'Delicious starters', 1),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Main Courses', 'Hearty main dishes', 2),
('550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'Beverages', 'Refreshing drinks', 3),
('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001', 'Desserts', 'Sweet treats', 4);

-- Sample Products
INSERT INTO products (business_id, category_id, name, description, price, preparation_time, display_order) VALUES 
-- Appetizers
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Hummus & Pita', 'Creamy hummus served with fresh pita bread', 15.00, 5, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Chicken Wings', 'Spicy buffalo chicken wings', 25.00, 15, 2),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'Mozzarella Sticks', 'Golden fried mozzarella with marinara sauce', 20.00, 10, 3),

-- Main Courses
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Grilled Chicken', 'Marinated grilled chicken breast with vegetables', 45.00, 25, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Beef Burger', 'Juicy beef patty with cheese and fries', 35.00, 20, 2),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Margherita Pizza', 'Classic pizza with tomato sauce, mozzarella, and basil', 40.00, 18, 3),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'Caesar Salad', 'Fresh romaine lettuce with caesar dressing and croutons', 28.00, 10, 4),

-- Beverages
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 12.00, 3, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Coca Cola', 'Classic Coca Cola', 8.00, 1, 2),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Turkish Coffee', 'Authentic Turkish coffee', 10.00, 5, 3),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', 'Mint Lemonade', 'Refreshing mint lemonade', 15.00, 3, 4),

-- Desserts
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Chocolate Cake', 'Rich chocolate layer cake', 22.00, 5, 1),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Tiramisu', 'Classic Italian tiramisu', 25.00, 5, 2),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440005', 'Ice Cream Sundae', 'Vanilla ice cream with chocolate sauce and nuts', 18.00, 3, 3);