# Production Fixes - Step by Step Guide

## 🚨 **Issue 1: Remove Pending Status from Production**

### **Step 1: Run SQL in Production Database**

```sql
-- Connect to production database and run:
-- (Use your Supabase dashboard SQL editor or connect via psql)

-- Update existing pending orders to completed
UPDATE orders SET status = 'completed' WHERE status = 'pending';

-- Remove 'pending' from enum
CREATE TYPE orders_status_new AS ENUM ('completed', 'canceled', 'modified');
ALTER TABLE orders ALTER COLUMN status TYPE orders_status_new USING status::text::orders_status_new;
DROP TYPE orders_status;
ALTER TYPE orders_status_new RENAME TO orders_status;
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'completed';
```

## 🚨 **Issue 2: Fix Daily Serial Reset After EOD**

### **Step 1: Run SQL in Production Database**

```sql
-- Create tracking table and updated functions
-- Run the entire content of: fix-production-daily-serial.sql
```

### **Step 2: Deploy Code Changes**

The code changes are ready to commit and deploy:

- ✅ Updated database.types.ts with new function
- ✅ Updated eod-report-service.ts to call reset function
- ✅ Daily serial will now reset when EOD report is generated

## 📋 **Deployment Order:**

1. **First**: Run the SQL scripts in production database
2. **Second**: Deploy the code changes
3. **Test**: Create order → Generate EOD → Create another order (should be 001)

## 🎯 **Expected Behavior After Fix:**

### **Before EOD Report:**

- Order 1: Serial 001
- Order 2: Serial 002
- Order 3: Serial 003

### **After EOD Report Generated:**

- Order 4: Serial 001 (RESET!)
- Order 5: Serial 002
- Order 6: Serial 003

### **Next Day:**

- Order 7: Serial 001 (natural daily reset)

## ⚠️ **Important Notes:**

1. **Run SQL during low traffic** - Early morning recommended
2. **Backup database first** - Always have a backup
3. **Test thoroughly** - Verify both issues are resolved
4. **Monitor logs** - Check for any errors after deployment

## 🔧 **Files Created:**

- `fix-production-pending-status.sql` - Removes pending status
- `fix-production-daily-serial.sql` - Fixes serial reset logic
- Code changes in `eod-report-service.ts` and `database.types.ts`

## 📞 **If Something Goes Wrong:**

1. Check logs for specific errors
2. Verify SQL scripts ran successfully
3. Confirm code deployment completed
4. Test with a simple order creation
