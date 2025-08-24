# Production Deployment Guide - Daily Serial Feature

## 🚨 IMPORTANT: Pre-Deployment Checklist

### 1. **Backup Database**

```bash
# Create a full backup before making any changes
pg_dump "postgresql://postgres.djfeaytabwflcenhgmzv:Lazaza_pos@2025@aws-0-eu-north-1.pooler.supabase.com:6543/postgres" > backup_before_daily_serial_$(date +%Y%m%d_%H%M%S).sql
```

### 2. **Schedule Maintenance Window**

- ⚠️ Run during low-traffic hours (early morning recommended)
- ⚠️ Notify users of potential brief downtime
- ⚠️ Have rollback plan ready

## 📋 Deployment Steps

### Step 1: Run Database Migration

```bash
# Connect to production database
psql "postgresql://postgres.djfeaytabwflcenhgmzv:Lazaza_pos@2025@aws-0-eu-north-1.pooler.supabase.com:6543/postgres"

# Run the migration script
\i production-migration-daily-serial.sql
```

### Step 2: Update Application Code

```bash
# Deploy your updated code with:
# - Updated database.types.ts
# - Re-enabled daily serial in order-client-service.ts
# - Updated restaurant-receipt.tsx

# If using Vercel:
vercel --prod

# If using other deployment:
npm run build
npm run start
```

### Step 3: Verify Everything Works

1. **Test order creation** - should get serial "001" for today
2. **Test receipt generation** - should show "ORDER #001"
3. **Test EOD report** - should work without errors
4. **Check existing orders** - should still work normally

## 🔍 Verification Commands

### Check Migration Success

```sql
-- Verify columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('daily_serial', 'serial_date');

-- Verify functions exist
SELECT routine_name
FROM information_schema.routines
WHERE routine_name IN ('get_next_daily_serial', 'reset_daily_serial');

-- Test daily serial generation
SELECT * FROM get_next_daily_serial();
```

### Test Application

```sql
-- Check that new orders get daily serials
SELECT id, order_number, daily_serial, serial_date, created_at
FROM orders
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 5;
```

## ⚡ Key Benefits of This Approach

✅ **Zero Data Loss** - All existing orders remain unchanged  
✅ **No Downtime** - Migration adds nullable columns safely  
✅ **Gradual Rollout** - Only new orders get daily serials initially  
✅ **Easy Rollback** - Can revert changes if needed  
✅ **Production Safe** - No risky data transformations

## 🛡️ Safety Features

1. **Nullable Columns**: Existing orders won't break if they don't have daily serials
2. **Fallback Logic**: Receipt shows order number if daily serial is missing
3. **Incremental**: Only new orders get the new functionality
4. **Reversible**: Can rollback the migration if needed

## 📝 Optional: Backfill Existing Orders

**⚠️ ONLY do this if you want historical orders to have daily serials:**

```sql
-- This assigns daily serials to existing orders based on their creation date
-- Run this AFTER the main migration and AFTER testing
WITH ordered_orders AS (
    SELECT
        id,
        DATE(created_at) as order_date,
        ROW_NUMBER() OVER (
            PARTITION BY DATE(created_at)
            ORDER BY created_at ASC
        ) as daily_sequence
    FROM orders
    WHERE daily_serial IS NULL
)
UPDATE orders
SET
    daily_serial = LPAD(ordered_orders.daily_sequence::TEXT, 3, '0'),
    serial_date = ordered_orders.order_date
FROM ordered_orders
WHERE orders.id = ordered_orders.id;
```

## 🚨 Emergency Rollback

If something goes wrong:

```sql
-- Remove the new functionality (THIS WILL LOSE DAILY SERIAL DATA!)
ALTER TABLE orders DROP COLUMN IF EXISTS daily_serial;
ALTER TABLE orders DROP COLUMN IF EXISTS serial_date;
DROP FUNCTION IF EXISTS get_next_daily_serial();
DROP FUNCTION IF EXISTS reset_daily_serial();
```

## 📞 Post-Deployment

1. ✅ Monitor application logs for errors
2. ✅ Test creating a few orders
3. ✅ Verify receipts show correct serial numbers
4. ✅ Confirm EOD reports still work
5. ✅ Update your team on the new serial number format

---

**Need Help?** Keep this guide handy and follow each step carefully. The migration is designed to be safe, but always have your backup ready!
