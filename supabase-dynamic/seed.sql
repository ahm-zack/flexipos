-- Seed data for FlexiPOS Dynamic Database
-- This file will be executed when starting the Supabase development environment

-- Insert a test user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated',
  'authenticated',
  'admin@flexipos.com',
  crypt('password123', gen_salt('bf')),
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  timezone('utc'::text, now()),
  '{"provider": "email", "providers": ["email"]}',
  '{"name": "Admin User"}',
  false,
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- Insert the user in our public users table
INSERT INTO public.users (id, email, name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@flexipos.com', 'Admin User', 'superadmin')
ON CONFLICT (email) DO NOTHING;

-- Link the admin user to the default business
INSERT INTO public.business_users (business_id, user_id, role, is_active, joined_at)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'owner',
    true,
    NOW()
ON CONFLICT (business_id, user_id) DO NOTHING;