-- Alternative: Grant ALL privileges to your current role
-- This might work better than changing ownership

-- Grant all privileges on storage.objects to postgres
GRANT ALL PRIVILEGES ON storage.objects TO postgres;

-- Grant all privileges to supabase_admin (if that's your role)
GRANT ALL PRIVILEGES ON storage.objects TO supabase_admin;

-- Grant all privileges to service_role
GRANT ALL PRIVILEGES ON storage.objects TO service_role;

-- Grant usage on storage schema
GRANT USAGE ON SCHEMA storage TO postgres;
GRANT ALL ON SCHEMA storage TO postgres;

-- Check what privileges you now have
SELECT 
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'storage' 
AND table_name = 'objects';
