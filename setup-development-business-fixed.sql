-- Setup development business and user relationship
-- This script ensures that there's a default business and connects any existing users to it

-- Create or ensure default business exists
INSERT INTO public.businesses (
    id,
    name,
    type,
    settings,
    created_at,
    updated_at
) VALUES (
    'b1234567-89ab-cdef-0123-456789abcdef',
    'Development Business',
    'restaurant',
    '{"timezone": "UTC", "currency": "USD", "language": "en"}',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

-- Link any existing users to the default business
-- This will connect all users in auth.users to the default business
INSERT INTO public.business_users (business_id, user_id, role, is_active, joined_at)
SELECT 
    'b1234567-89ab-cdef-0123-456789abcdef',
    id,
    'admin',
    true,
    NOW()
FROM auth.users
WHERE id NOT IN (
    SELECT user_id 
    FROM public.business_users 
    WHERE business_id = 'b1234567-89ab-cdef-0123-456789abcdef'
);

-- Verify the setup
SELECT 
    b.name as business_name,
    b.type,
    COUNT(bu.user_id) as user_count
FROM public.businesses b
LEFT JOIN public.business_users bu ON b.id = bu.business_id
WHERE b.id = 'b1234567-89ab-cdef-0123-456789abcdef'
GROUP BY b.id, b.name, b.type;

-- Show user-business relationships
SELECT 
    u.email,
    bu.role,
    bu.is_active,
    b.name as business_name
FROM auth.users u
JOIN public.business_users bu ON u.id = bu.user_id
JOIN public.businesses b ON bu.business_id = b.id
WHERE b.id = 'b1234567-89ab-cdef-0123-456789abcdef';