# FlexiPOS — Production Database Setup

Run these five SQL files in order against your production Supabase project.  
Each file is self-contained and idempotent (`CREATE IF NOT EXISTS`, `CREATE OR REPLACE`).

## Files

| File                | What it does                                              |
| ------------------- | --------------------------------------------------------- |
| `001_enums.sql`     | Custom enum types (role, order_status, payment_method, …) |
| `002_tables.sql`    | All 13 tables in dependency order                         |
| `003_functions.sql` | Sequences + RPC functions the app calls                   |
| `004_indexes.sql`   | Performance indexes                                       |
| `005_rls.sql`       | Row Level Security policies                               |

## How to run

### Option A — Supabase SQL Editor (easiest)

1. Open your project → **SQL Editor** in the Supabase dashboard
2. Paste and run each file **in order**, one at a time
3. Check for errors before moving to the next file

### Option B — psql CLI

```bash
# Replace <CONNECTION_STRING> with your Supabase direct connection URI
# Found in: Project Settings → Database → Connection string → URI

PGCONN="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

psql "$PGCONN" -f 001_enums.sql
psql "$PGCONN" -f 002_tables.sql
psql "$PGCONN" -f 003_functions.sql
psql "$PGCONN" -f 004_indexes.sql
psql "$PGCONN" -f 005_rls.sql
```

### Option C — run all at once

```bash
PGCONN="postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres"

for f in 001_enums.sql 002_tables.sql 003_functions.sql 004_indexes.sql 005_rls.sql; do
  echo "Running $f..."
  psql "$PGCONN" -f "$f"
done
```

> **Tip:** Use the **direct connection** (port 5432), not the pooler (port 6543), when running migrations.

---

## After running migrations

### 1. Regenerate Supabase types

```bash
npx supabase gen types typescript --project-id <your-project-ref> > database.types.ts
```

### 2. Set environment variables in production

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 3. Verify key objects exist

```sql
-- Check all tables are there
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check functions
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check sequences
SELECT sequencename FROM pg_sequences
WHERE schemaname = 'public';

-- Test order number generation
SELECT generate_order_number();
-- Expected: 'ORD-0001'

-- Test EOD report number generation
SELECT generate_eod_report_number();
-- Expected: 'EOD-0001'
```

---

## Tables overview

```
businesses
  ├── business_users         (who works at the business)
  ├── business_order_counters (daily serial counter per business)
  ├── categories
  │     └── products
  ├── orders
  ├── canceled_orders
  ├── modified_orders
  ├── customers
  ├── eod_reports
  ├── sales_reports
  └── dashboard_metrics      (live aggregates, one row per business)

users                        (mirrors auth.users — id = auth UID)
```

## RPC functions used by the app

| Function                             | Called from                                |
| ------------------------------------ | ------------------------------------------ |
| `generate_order_number()`            | `lib/orders/server-utils.ts`               |
| `generate_eod_report_number()`       | `lib/eod-report/server-utils.ts`           |
| `get_next_eod_report_number()`       | `lib/eod-report/server-utils.ts` (preview) |
| `get_next_order_serial(business_id)` | `modules/orders-feature`                   |
| `reset_daily_serial_sequence()`      | `lib/eod-report-service.ts` (end of day)   |
| `increment_dashboard_metrics(...)`   | `modules/orders-feature` (on every order)  |
