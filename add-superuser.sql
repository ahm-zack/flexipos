-- Add authenticated user to public.users table as superadmin
-- User is already authenticated in auth.users, just need to add to public.users

INSERT INTO public.users (id, name, email, role, created_at, updated_at) VALUES 
  ('ea0908bf-0fe0-4d36-b305-d7f63304cce4', 'Ahmad Zack', 'ahm.zack.dev@gmail.com', 'superadmin', NOW(), NOW());

-- Verify the user was created
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  u.created_at
FROM public.users u
WHERE u.email = 'ahm.zack.dev@gmail.com';
