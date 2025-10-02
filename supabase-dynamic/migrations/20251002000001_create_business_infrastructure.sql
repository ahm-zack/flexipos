-- Migration: Create Business Infrastructure
-- Description: Add core tables for multi-business support and dynamic POS configuration
-- Phase: 1 - Core Infrastructure

-- ================================
-- BUSINESS CORE TABLES
-- ================================

-- Business entity - core business information
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE, -- URL-friendly identifier
    type TEXT NOT NULL DEFAULT 'restaurant' CHECK (type IN ('restaurant', 'retail', 'service', 'cafe', 'bakery', 'pharmacy', 'grocery')),
    settings JSONB DEFAULT '{}'::jsonb, -- Dynamic settings per business type
    branding JSONB DEFAULT '{}'::jsonb, -- Logo, colors, fonts, theme
    address JSONB DEFAULT '{}'::jsonb, -- Complete address information
    contact JSONB DEFAULT '{}'::jsonb, -- Phone, email, website
    vat_settings JSONB DEFAULT '{}'::jsonb, -- VAT configuration
    timezone TEXT DEFAULT 'Asia/Riyadh',
    currency TEXT DEFAULT 'SAR',
    language TEXT DEFAULT 'ar',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Multi-tenant user access
CREATE TABLE IF NOT EXISTS business_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'cashier' CHECK (role IN ('owner', 'manager', 'employee', 'cashier')),
    permissions JSONB DEFAULT '{}'::jsonb, -- Granular permissions
    is_active BOOLEAN DEFAULT true,
    invited_at TIMESTAMPTZ DEFAULT NOW(),
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, user_id)
);

-- Business-specific settings
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'pos', 'inventory', 'reports', 'payments'
    settings JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_by UUID REFERENCES users(id),
    UNIQUE(business_id, category)
);

-- ================================
-- DYNAMIC CATEGORY SYSTEM
-- ================================

-- Replace hardcoded menu categories with flexible categories
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT, -- Support for Arabic
    slug TEXT NOT NULL, -- URL-friendly identifier
    description TEXT,
    icon TEXT DEFAULT '📋', -- Icon identifier or emoji
    color TEXT, -- Category color theme
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    parent_category_id UUID REFERENCES categories(id), -- For subcategories/nested structure
    metadata JSONB DEFAULT '{}'::jsonb, -- Business-specific custom fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(business_id, slug)
);

-- ================================
-- UNIVERSAL MENU ITEM SYSTEM
-- ================================

-- Universal item schema - replaces separate tables (pizzas, burgers, etc.)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    description TEXT,
    short_description TEXT,
    sku TEXT, -- Stock Keeping Unit
    barcode TEXT, -- For retail businesses
    price DECIMAL(10, 2) NOT NULL,
    cost_price DECIMAL(10, 2), -- For profit margin calculations
    images JSONB DEFAULT '[]'::jsonb, -- Array of image URLs
    variants JSONB DEFAULT '[]'::jsonb, -- Sizes, types, colors, etc.
    modifiers JSONB DEFAULT '[]'::jsonb, -- Compatible with existing modifier system
    tags JSONB DEFAULT '[]'::jsonb, -- ['vegetarian', 'spicy', 'popular', 'new']
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    stock_quantity INTEGER, -- For inventory tracking
    low_stock_threshold INTEGER,
    metadata JSONB DEFAULT '{}'::jsonb, -- Business-specific custom fields
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Item variants (sizes, types, etc.)
CREATE TABLE IF NOT EXISTS item_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    price DECIMAL(10, 2) NOT NULL,
    sku TEXT,
    barcode TEXT,
    stock_quantity INTEGER,
    is_default BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ================================
-- ENHANCED MODIFIER SYSTEM
-- ================================

-- Modifier groups (enhanced from existing system)
CREATE TABLE IF NOT EXISTS modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    type TEXT NOT NULL DEFAULT 'multiple' CHECK (type IN ('single', 'multiple', 'quantity')),
    required BOOLEAN DEFAULT false,
    max_selections INTEGER,
    min_selections INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Modifiers within groups
CREATE TABLE IF NOT EXISTS modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    name_ar TEXT,
    price DECIMAL(10, 2) DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    stock_quantity INTEGER, -- For items that can run out
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Link modifiers to menu items
CREATE TABLE IF NOT EXISTS item_modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    is_required BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(menu_item_id, modifier_group_id)
);

-- ================================
-- TRIGGERS FOR UPDATED_AT
-- ================================

-- Create function for updating updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to all new tables
CREATE TRIGGER update_businesses_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_users_updated_at
    BEFORE UPDATE ON business_users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON business_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_item_variants_updated_at
    BEFORE UPDATE ON item_variants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifier_groups_updated_at
    BEFORE UPDATE ON modifier_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modifiers_updated_at
    BEFORE UPDATE ON modifiers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- INDEXES FOR PERFORMANCE
-- ================================

-- Essential indexes for multi-tenant performance
CREATE INDEX IF NOT EXISTS idx_business_users_user_business ON business_users (user_id, business_id);
CREATE INDEX IF NOT EXISTS idx_business_users_business ON business_users (business_id);
CREATE INDEX IF NOT EXISTS idx_business_settings_business ON business_settings (business_id);

CREATE INDEX IF NOT EXISTS idx_categories_business ON categories (business_id);
CREATE INDEX IF NOT EXISTS idx_categories_business_active ON categories (business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories (parent_category_id);

CREATE INDEX IF NOT EXISTS idx_menu_items_business_category ON menu_items (business_id, category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_business_active ON menu_items (business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items (category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_sku ON menu_items (sku);
CREATE INDEX IF NOT EXISTS idx_menu_items_barcode ON menu_items (barcode);

CREATE INDEX IF NOT EXISTS idx_item_variants_menu_item ON item_variants (menu_item_id);
CREATE INDEX IF NOT EXISTS idx_item_variants_sku ON item_variants (sku);
CREATE INDEX IF NOT EXISTS idx_item_variants_barcode ON item_variants (barcode);

CREATE INDEX IF NOT EXISTS idx_modifier_groups_business ON modifier_groups (business_id);
CREATE INDEX IF NOT EXISTS idx_modifiers_group ON modifiers (modifier_group_id);
CREATE INDEX IF NOT EXISTS idx_item_modifier_groups_item ON item_modifier_groups (menu_item_id);
CREATE INDEX IF NOT EXISTS idx_item_modifier_groups_group ON item_modifier_groups (modifier_group_id);

-- ================================
-- INSERT DEFAULT BUSINESS
-- ================================

-- Insert default business for existing data
INSERT INTO businesses (
    id,
    name,
    slug,
    type,
    settings,
    branding,
    address,
    contact,
    vat_settings
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- Fixed UUID for default business
    'FlexiPOS Restaurant',
    'default-restaurant',
    'restaurant',
    '{"tableService": true, "kitchenDisplay": true, "reservations": false}'::jsonb,
    '{"primaryColor": "#3B82F6", "secondaryColor": "#1E40AF", "logo": null}'::jsonb,
    '{"street": "", "city": "", "country": "Saudi Arabia", "postalCode": ""}'::jsonb,
    '{"phone": "", "email": "", "website": ""}'::jsonb,
    '{"enabled": true, "rate": 15, "inclusive": true}'::jsonb
) ON CONFLICT (id) DO NOTHING;

-- Link existing users to default business
INSERT INTO business_users (business_id, user_id, role, is_active, joined_at)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    id,
    CASE 
        WHEN role = 'superadmin' THEN 'owner'
        WHEN role = 'admin' THEN 'manager'
        ELSE role::text
    END,
    true,
    NOW()
FROM users
ON CONFLICT (business_id, user_id) DO NOTHING;

-- Create default categories for restaurant
INSERT INTO categories (business_id, name, name_ar, slug, icon, display_order) VALUES
('00000000-0000-0000-0000-000000000001', 'Pizzas', 'بيتزا', 'pizza', '🍕', 1),
('00000000-0000-0000-0000-000000000001', 'Pies', 'فطائر', 'pie', '🥧', 2),
('00000000-0000-0000-0000-000000000001', 'Sandwiches', 'ساندويتش', 'sandwich', '🥪', 3),
('00000000-0000-0000-0000-000000000001', 'Mini Pies', 'فطائر صغيرة', 'mini-pie', '🧁', 4),
('00000000-0000-0000-0000-000000000001', 'Burgers', 'برجر', 'burger', '🍔', 5),
('00000000-0000-0000-0000-000000000001', 'Appetizers', 'مقبلات', 'appetizers', '🥗', 6),
('00000000-0000-0000-0000-000000000001', 'Shawarma', 'شاورما', 'shawerma', '🌯', 7),
('00000000-0000-0000-0000-000000000001', 'Side Orders', 'طلبات جانبية', 'side-order', '🍟', 8),
('00000000-0000-0000-0000-000000000001', 'Beverages', 'مشروبات', 'beverages', '☕', 9)
ON CONFLICT (business_id, slug) DO NOTHING;

-- ================================
-- NOTIFICATION
-- ================================

DO $$
BEGIN
    RAISE NOTICE '✅ Business Infrastructure created successfully!';
    RAISE NOTICE 'Created tables: businesses, business_users, business_settings, categories, menu_items, item_variants, modifier_groups, modifiers, item_modifier_groups';
    RAISE NOTICE 'Added default business and categories for existing restaurant data';
    RAISE NOTICE 'Next step: Run feature flag system setup';
END $$;