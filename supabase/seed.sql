-- Seed file to create admin user and sample data
-- This file runs automatically after database reset

-- First, let's insert the admin user into auth.users
-- Note: This is a special operation that requires admin privileges
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    'b1234567-89ab-cdef-0123-456789abcdef',
    'authenticated',
    'authenticated',
    'admin@flexipos.com',
    crypt('password123', gen_salt('bf')), -- Password: password123
    NOW(),
    NOW(),
    '',
    NOW(),
    '',
    NULL,
    '',
    '',
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "FlexiPOS Super Admin", "role": "super_admin"}',
    true,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    false,
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Create the business first
INSERT INTO businesses (
    id,
    name,
    slug,
    description,
    address,
    phone,
    email,
    website,
    logo_url,
    currency,
    timezone,
    settings,
    is_active,
    created_at,
    updated_at
) VALUES (
    'b1234567-89ab-cdef-0123-456789abcdef',
    'FlexiPOS Restaurant',
    'flexipos-restaurant',
    'Modern restaurant management system',
    '123 Restaurant Street, Food City, FC 12345',
    '+1-234-567-8900',
    'admin@flexipos.com',
    'https://flexipos.com',
    NULL,
    'USD',
    'UTC',
    '{"vat_number": "VAT123456789", "primary_color": "#2563eb", "secondary_color": "#1e40af"}',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert the admin user into our users table
INSERT INTO users (
    id,
    email,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'b1234567-89ab-cdef-0123-456789abcdef',
    'admin@flexipos.com',
    'FlexiPOS Super Admin',
    'super_admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = EXCLUDED.updated_at;

-- Link the admin user to the business
INSERT INTO business_users (
    business_id,
    user_id,
    role,
    is_active,
    joined_at,
    created_at,
    updated_at
) VALUES (
    'b1234567-89ab-cdef-0123-456789abcdef',
    'b1234567-89ab-cdef-0123-456789abcdef',
    'owner',
    true,
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (business_id, user_id) DO NOTHING;

-- Insert sample categories
INSERT INTO categories (id, business_id, name, slug, description, icon, color, sort_order, is_active, created_at, updated_at) VALUES
('1abe7291-0ad5-42b8-95c2-64b70d313fc8', 'b1234567-89ab-cdef-0123-456789abcdef', 'Pizzas', 'pizzas', 'Delicious pizzas with various toppings', '🍕', '#ff6b35', 1, true, NOW(), NOW()),
('b15f2840-c22c-4dac-8015-cd271a2489a2', 'b1234567-89ab-cdef-0123-456789abcdef', 'Pies', 'pies', 'Homemade pies with fresh ingredients', '🥧', '#8b5a3c', 2, true, NOW(), NOW()),
('0682f659-f64c-4466-995a-74ba9abaabe3', 'b1234567-89ab-cdef-0123-456789abcdef', 'Mini Pies', 'mini-pies', 'Individual sized pies perfect for single servings', '🧁', '#d4a574', 3, true, NOW(), NOW()),
('bcf62e58-0027-432f-9ee5-4a4aa7db3e05', 'b1234567-89ab-cdef-0123-456789abcdef', 'Burgers', 'burgers', 'Juicy burgers with premium ingredients', '🍔', '#ff8c42', 4, true, NOW(), NOW()),
('f9447001-05d9-4283-97d8-53f1ec046743', 'b1234567-89ab-cdef-0123-456789abcdef', 'Sandwiches', 'sandwiches', 'Fresh sandwiches made to order', '🥪', '#6a994e', 5, true, NOW(), NOW()),
('4d3db305-83a9-4fa9-b70f-5af29b82a660', 'b1234567-89ab-cdef-0123-456789abcdef', 'Appetizers', 'appetizers', 'Perfect starters for your meal', '🍤', '#f77f00', 6, true, NOW(), NOW()),
('60dc9829-7b45-4f4a-8dff-c74bbca333be', 'b1234567-89ab-cdef-0123-456789abcdef', 'Sides', 'sides', 'Complementary sides for your main dish', '🍟', '#fcbf49', 7, true, NOW(), NOW()),
('6e84aa51-370d-4eaa-8dc8-1538fb638255', 'b1234567-89ab-cdef-0123-456789abcdef', 'Beverages', 'beverages', 'Refreshing drinks and beverages', '🥤', '#219ebc', 8, true, NOW(), NOW()),
('8b0a54e3-07dd-441e-8f57-f8f2507612bd', 'b1234567-89ab-cdef-0123-456789abcdef', 'Desserts', 'desserts', 'Sweet treats to end your meal', '🍰', '#f72585', 9, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert some sample products for the Beverages category
INSERT INTO products (
    id,
    business_id,
    category_id,
    name,
    description,
    price,
    cost_price,
    sku,
    barcode,
    stock_quantity,
    low_stock_threshold,
    is_active,
    is_featured,
    tags,
    metadata,
    created_at,
    updated_at
) VALUES
(
    '91234567-89ab-cdef-0123-456789abcdef',
    'b1234567-89ab-cdef-0123-456789abcdef',
    '6e84aa51-370d-4eaa-8dc8-1538fb638255',
    'Coca Cola',
    'Classic Coca Cola soft drink',
    2.50,
    1.20,
    'COKE-001',
    '1234567890123',
    100,
    10,
    true,
    true,
    '{"soft drink", "cola", "carbonated"}',
    '{"temperature": "cold", "size": "330ml", "weight": "0.33kg", "dimensions": {"height": "12cm", "width": "6cm", "depth": "6cm"}}',
    NOW(),
    NOW()
),
(
    '92345678-89ab-cdef-0123-456789abcdef',
    'b1234567-89ab-cdef-0123-456789abcdef',
    '6e84aa51-370d-4eaa-8dc8-1538fb638255',
    'Orange Juice',
    'Fresh squeezed orange juice',
    3.75,
    2.00,
    'OJ-001',
    '2345678901234',
    50,
    5,
    true,
    false,
    '{"juice", "orange", "fresh"}',
    '{"temperature": "cold", "size": "250ml", "weight": "0.25kg", "dimensions": {"height": "10cm", "width": "5cm", "depth": "5cm"}}',
    NOW(),
    NOW()
),
(
    '93456789-89ab-cdef-0123-456789abcdef',
    'b1234567-89ab-cdef-0123-456789abcdef',
    '6e84aa51-370d-4eaa-8dc8-1538fb638255',
    'Coffee',
    'Premium arabica coffee',
    4.25,
    1.50,
    'COFFEE-001',
    '3456789012345',
    75,
    15,
    true,
    true,
    '{"coffee", "hot", "arabica"}',
    '{"temperature": "hot", "size": "200ml", "weight": "0.20kg", "dimensions": {"height": "8cm", "width": "8cm", "depth": "8cm"}}',
    NOW(),
    NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Refresh the auth schema
NOTIFY pgrst, 'reload schema';