#!/bin/bash

echo "=== Checking Supabase Status ==="
supabase status | grep -E "DB URL|Studio URL"

echo ""
echo "=== Checking if businesses table exists ==="
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses');" 2>&1

echo ""
echo "=== Listing all tables ==="
psql "postgresql://postgres:postgres@127.0.0.1:54322/postgres" -c "\dt" 2>&1 | head -30
