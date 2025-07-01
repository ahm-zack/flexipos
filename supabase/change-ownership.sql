-- Change ownership of storage.objects table to current user (postgres)
-- Run this ONLY if you confirmed you're running as postgres/superuser

-- Method 1: Change ownership to postgres
ALTER TABLE storage.objects OWNER TO postgres;

-- Method 2: If postgres doesn't work, try supabase_admin
-- ALTER TABLE storage.objects OWNER TO supabase_admin;

-- Method 3: If neither works, try service_role
-- ALTER TABLE storage.objects OWNER TO service_role;

-- Verify the ownership change
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';
