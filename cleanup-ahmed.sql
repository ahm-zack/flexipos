-- Clean up orphaned user ahmed@zicas.dev
-- Run this with: psql postgresql://postgres:postgres@localhost:54322/postgres -f cleanup-ahmed.sql

-- First, check what we have
\echo '🔍 Checking current state...'
SELECT 
    u.id, 
    u.email, 
    u.full_name,
    bu.id as business_user_id,
    bu.business_id
FROM users u 
LEFT JOIN business_users bu ON u.id = bu.user_id 
WHERE u.email = 'ahmed@zicas.dev';

-- Delete from business_users (if exists)
\echo '\n🗑️  Deleting from business_users...'
DELETE FROM business_users 
WHERE user_id IN (SELECT id FROM users WHERE email = 'ahmed@zicas.dev');

-- Delete from users
\echo '\n🗑️  Deleting from users table...'
DELETE FROM users WHERE email = 'ahmed@zicas.dev';

-- Verify cleanup
\echo '\n✅ Verification (should show 0 rows):'
SELECT COUNT(*) as remaining_users 
FROM users 
WHERE email = 'ahmed@zicas.dev';

\echo '\n✅ Cleanup complete! Now you also need to delete from Supabase Auth:'
\echo '1. Open Supabase Dashboard'
\echo '2. Go to Authentication > Users'
\echo '3. Search for ahmed@zicas.dev'
\echo '4. Delete the user if it exists'
\echo '\nOr run: npx tsx delete-user-by-email.ts ahmed@zicas.dev'
