-- Find and cleanup orphaned users (users without business_users relationship)

-- First, show orphaned users
SELECT u.id, u.email, u.full_name, u.created_at
FROM users u
LEFT JOIN business_users bu ON u.id = bu.user_id
WHERE bu.id IS NULL
ORDER BY u.created_at DESC;

-- To delete them (uncomment when ready):
-- DELETE FROM users
-- WHERE id IN (
--   SELECT u.id
--   FROM users u
--   LEFT JOIN business_users bu ON u.id = bu.user_id
--   WHERE bu.id IS NULL
-- );

-- Note: You'll also need to manually delete these users from Supabase Auth using the admin dashboard
