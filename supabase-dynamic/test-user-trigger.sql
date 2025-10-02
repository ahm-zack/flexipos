-- Test the automatic user creation trigger
-- This script demonstrates how the trigger works when a new user signs up

-- Simulate a new user signup (this would normally be done through Supabase Auth)
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'test@example.com',
  crypt('password123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Test User","avatar_url":"https://example.com/avatar.jpg"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);

-- Check that the user was automatically created in the users table
SELECT 
  u.email,
  u.full_name,
  u.role,
  u.avatar_url,
  u.created_at,
  'Automatically created by trigger' as note
FROM users u 
WHERE u.email = 'test@example.com';