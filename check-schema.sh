#!/bin/bash

echo "========================================"
echo "DATABASE SCHEMA INSPECTION"
echo "========================================"
echo ""

echo "=== ALL TABLES IN DATABASE ==="
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
"

echo ""
echo "=== ALL ENUM TYPES ==="
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "
SELECT 
    t.typname AS enum_name,
    STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
FROM 
    pg_type t
JOIN 
    pg_enum e ON t.oid = e.enumtypid
WHERE 
    t.typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY 
    t.typname
ORDER BY 
    t.typname;
"

echo ""
echo "=== DETAILED SCHEMA (saved to schema-output.txt) ==="
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -f get-db-schema.sql > schema-output.txt
echo "✅ Detailed schema saved to schema-output.txt"

echo ""
echo "=== KEY TABLES STRUCTURE ==="

for table in users businesses business_users pizzas pies sandwiches burgers beverages orders
do
    echo ""
    echo "--- Table: $table ---"
    psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "
    SELECT 
        column_name,
        data_type,
        is_nullable,
        column_default
    FROM 
        information_schema.columns 
    WHERE 
        table_name = '$table' 
        AND table_schema = 'public'
    ORDER BY 
        ordinal_position;
    " 2>/dev/null || echo "Table $table does not exist"
done

echo ""
echo "========================================"
echo "INSPECTION COMPLETE"
echo "========================================"
