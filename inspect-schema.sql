-- Simple query to list all tables
\dt

-- List all enum types with values
SELECT 
    t.typname AS enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) AS values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY t.typname
ORDER BY t.typname;

-- Get column details for each table
\d+ users
\d+ businesses
\d+ business_users
\d+ pizzas
\d+ pies
\d+ sandwiches
\d+ mini_pies
\d+ burgers
\d+ beverages
\d+ appetizers
\d+ shawarmas
\d+ side_orders
\d+ orders
\d+ eod_reports
