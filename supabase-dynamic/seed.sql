-- Seed data for FlexiPOS Dynamic Database
-- This file will be executed when starting the Supabase development environment

-- IMPORTANT: For authentication to work properly with Supabase, create the admin user via:
-- Option 1: Run the script: ./create-admin-user.sh
-- Option 2: Supabase Dashboard > Authentication > Users > "Add user"
-- Option 3: Use your app's sign-up form

-- The SQL below is a fallback but may not work perfectly with Supabase Auth
-- It's better to use the script or dashboard method above

-- Create admin user (fallback method)
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
    user_email text := 'admin@flexipos.com';
BEGIN
    -- Check if user already exists
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RAISE NOTICE 'Creating admin user via SQL (not recommended)';
        RAISE NOTICE 'Please use ./create-admin-user.sh script or Supabase Dashboard instead';
        
        -- This is a basic insertion that may not work perfectly
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
            confirmation_token,
            recovery_token
        ) VALUES (
            '00000000-0000-0000-0000-000000000000',
            user_id,
            'authenticated',
            'authenticated',
            user_email,
            -- Using Supabase's preferred password hashing
            '$2a$10$' || encode(gen_random_bytes(22), 'base64'),
            NOW(),
            NOW(),
            NOW(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Admin User", "email": "admin@flexipos.com"}',
            '',
            ''
        );
        
        -- Insert identity
        INSERT INTO auth.identities (
            id,
            user_id,
            identity_data,
            provider,
            created_at,
            updated_at
        ) VALUES (
            gen_random_uuid(),
            user_id,
            format('{"sub": "%s", "email": "%s", "name": "Admin User"}', user_id::text, user_email)::jsonb,
            'email',
            NOW(),
            NOW()
        );
    ELSE
        RAISE NOTICE 'Admin user already exists in auth.users';
    END IF;
    
    -- Set user_id for public tables (use existing or new)
    SELECT id INTO user_id FROM auth.users WHERE email = user_email LIMIT 1;
    
    -- Insert into public users table
    INSERT INTO public.users (id, email, name, role) VALUES 
    (user_id, user_email, 'Admin User', 'superadmin')
    ON CONFLICT (id) DO UPDATE SET 
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        role = EXCLUDED.role;
        
    RAISE NOTICE 'Public user record created/updated';
END $$;

-- Insert the user in our public users table
INSERT INTO public.users (id, email, name, role) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@flexipos.com', 'Admin User', 'superadmin')
ON CONFLICT (id) DO UPDATE SET 
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role;

-- Link the admin user to the default business
INSERT INTO public.business_users (business_id, user_id, role, is_active, joined_at)
SELECT 
    '00000000-0000-0000-0000-000000000001',
    '11111111-1111-1111-1111-111111111111',
    'owner',
    true,
    NOW()
ON CONFLICT (business_id, user_id) DO NOTHING;