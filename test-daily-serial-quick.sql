-- Quick test of daily serial system after re-enabling
\echo '=== Testing Daily Serial System After Re-enabling ==='

-- 1. Check daily serial info
\echo 'Current daily serial status:'
SELECT * FROM get_daily_serial_info();

-- 2. Test generating next daily serial
\echo 'Getting next daily serial:'
SELECT * FROM get_next_daily_serial();

-- 3. Check if sequence was updated
\echo 'Daily serial status after generation:'
SELECT * FROM get_daily_serial_info();

-- 4. Generate another one to test sequence increment
\echo 'Getting second daily serial:'
SELECT * FROM get_next_daily_serial();

-- 5. Final status check
\echo 'Final daily serial status:'
SELECT * FROM get_daily_serial_info();

\echo '=== Daily Serial System Test Complete ==='
