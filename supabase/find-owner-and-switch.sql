-- Final attempt: Connect as the actual owner and run policies
-- First, find out who owns the table

SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    pg_get_userbyid(c.relowner) as owner
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'storage' AND c.relname = 'objects';

-- If the owner is 'supabase_storage_admin' or similar, try this:
-- SET ROLE supabase_storage_admin;

-- Or if it's owned by 'postgres':
-- SET ROLE postgres;

-- Then run your RLS commands:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Reset role back to original
-- RESET ROLE;
