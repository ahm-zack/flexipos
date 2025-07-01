-- Check current ownership and permissions of storage.objects table
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasinsert,
    hasupdate,
    hasdelete,
    hasselect
FROM pg_tables 
WHERE schemaname = 'storage' AND tablename = 'objects';

-- Check current user and available roles
SELECT current_user, session_user;

-- List all available roles
SELECT rolname FROM pg_roles ORDER BY rolname;
