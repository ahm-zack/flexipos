-- Create business infrastructure tables
-- This migration creates the core business and category tables

-- Create businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    description TEXT,
    logo_url TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    timezone TEXT DEFAULT 'UTC',
    currency TEXT DEFAULT 'USD',
    settings JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Multi-tenant user access (references public.users table)
CREATE TABLE IF NOT EXISTS business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'employee', 'cashier', 'admin')),
    permissions JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- Create categories table for organizing products
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT,
    description TEXT,
    icon TEXT,
    color TEXT DEFAULT '#3b82f6',
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_businesses_active ON businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_slug ON businesses(slug);
CREATE INDEX IF NOT EXISTS idx_business_users_business_id ON business_users(business_id);
CREATE INDEX IF NOT EXISTS idx_business_users_user_id ON business_users(user_id);
CREATE INDEX IF NOT EXISTS idx_business_users_active ON business_users(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- Enable RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Users can view businesses they belong to" ON businesses
    FOR SELECT USING (
        id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- RLS Policies for business_users
CREATE POLICY "Users can view their business relationships" ON business_users
    FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for categories
CREATE POLICY "Users can view categories for their business" ON categories
    FOR SELECT USING (
        business_id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Users can manage categories for their business" ON categories
    FOR ALL USING (
        business_id IN (
            SELECT business_id 
            FROM business_users 
            WHERE user_id = auth.uid() AND is_active = true
        )
    );

-- Insert development business
INSERT INTO public.businesses (id, name, slug, description, is_active) VALUES 
('b1234567-89ab-cdef-0123-456789abcdef', 'Development Business', 'dev-business', 'Development and testing business', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample categories
INSERT INTO public.categories (id, business_id, name, slug, description, icon, color, is_active) VALUES 
('1abe7291-0ad5-42b8-95c2-64b70d313fc8', 'b1234567-89ab-cdef-0123-456789abcdef', 'Pizzas', 'pizzas', '', '🍕', '#ef4444', true),
('b15f2840-c22c-4dac-8015-cd271a2489a2', 'b1234567-89ab-cdef-0123-456789abcdef', 'Pies', 'pies', '', '🥧', '#f59e0b', true),
('0682f659-f64c-4466-995a-74ba9abaabe3', 'b1234567-89ab-cdef-0123-456789abcdef', 'Mini Pies', 'mini-pies', '', '🧁', '#8b5cf6', true),
('bcf62e58-0027-432f-9ee5-4a4aa7db3e05', 'b1234567-89ab-cdef-0123-456789abcdef', 'Burgers', 'burgers', '', '🍔', '#06b6d4', true),
('f9447001-05d9-4283-97d8-53f1ec046743', 'b1234567-89ab-cdef-0123-456789abcdef', 'Sandwiches', 'sandwiches', '', '🥪', '#10b981', true),
('4d3db305-83a9-4fa9-b70f-5af29b82a660', 'b1234567-89ab-cdef-0123-456789abcdef', 'Appetizers', 'appetizers', '', '🍤', '#84cc16', true),
('60dc9829-7b45-4f4a-8dff-c74bbca333be', 'b1234567-89ab-cdef-0123-456789abcdef', 'Sides', 'sides', '', '🍟', '#f97316', true),
('6e84aa51-370d-4eaa-8dc8-1538fb638255', 'b1234567-89ab-cdef-0123-456789abcdef', 'Beverages', 'beverages', '', '🥤', '#3b82f6', true),
('8b0a54e3-07dd-441e-8f57-f8f2507612bd', 'b1234567-89ab-cdef-0123-456789abcdef', 'Desserts', 'desserts', '', '🍰', '#ec4899', true)
ON CONFLICT (id) DO NOTHING;