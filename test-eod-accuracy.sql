-- EOD Report Accuracy Test SQL
-- This will help us manually verify the calculations

-- 1. Get all completed orders in date range
SELECT 
  'COMPLETED ORDERS' as report_section,
  COUNT(*) as total_orders,
  SUM(CAST(total_amount AS DECIMAL)) as total_revenue,
  AVG(CAST(total_amount AS DECIMAL)) as average_order_value,
  MIN(created_at) as first_order,
  MAX(created_at) as last_order
FROM orders 
WHERE created_at BETWEEN '2025-07-04T00:00:00.000Z' AND '2025-07-06T23:59:59.999Z'
AND status = 'completed';

-- 2. Payment method breakdown
SELECT 
  'PAYMENT BREAKDOWN' as report_section,
  payment_method,
  COUNT(*) as order_count,
  SUM(CAST(total_amount AS DECIMAL)) as total_amount,
  ROUND(
    (SUM(CAST(total_amount AS DECIMAL)) / 
     (SELECT SUM(CAST(total_amount AS DECIMAL)) FROM orders 
      WHERE created_at BETWEEN '2025-07-04T00:00:00.000Z' AND '2025-07-06T23:59:59.999Z'
      AND status = 'completed')) * 100, 2
  ) as percentage
FROM orders 
WHERE created_at BETWEEN '2025-07-04T00:00:00.000Z' AND '2025-07-06T23:59:59.999Z'
AND status = 'completed'
GROUP BY payment_method;

-- 3. Canceled orders
SELECT 
  'CANCELED ORDERS' as report_section,
  COUNT(*) as canceled_orders
FROM canceled_orders 
WHERE canceled_at BETWEEN '2025-07-04T00:00:00.000Z' AND '2025-07-06T23:59:59.999Z';

-- 4. Hourly breakdown
SELECT 
  'HOURLY BREAKDOWN' as report_section,
  EXTRACT(HOUR FROM created_at) as hour,
  COUNT(*) as order_count,
  SUM(CAST(total_amount AS DECIMAL)) as hourly_revenue
FROM orders 
WHERE created_at BETWEEN '2025-07-04T00:00:00.000Z' AND '2025-07-06T23:59:59.999Z'
AND status = 'completed'
GROUP BY EXTRACT(HOUR FROM created_at)
HAVING COUNT(*) > 0
ORDER BY hour;

-- 5. Individual order details for verification
SELECT 
  'ORDER DETAILS' as report_section,
  id,
  order_number,
  total_amount,
  payment_method,
  created_at,
  items
FROM orders 
WHERE created_at BETWEEN '2025-07-04T00:00:00.000Z' AND '2025-07-06T23:59:59.999Z'
AND status = 'completed'
ORDER BY created_at;

-- 6. Check existing EOD reports
SELECT 
  'EXISTING EOD REPORTS' as report_section,
  id,
  report_date,
  total_orders,
  completed_orders,
  cancelled_orders,
  total_revenue,
  total_with_vat,
  total_without_vat,
  vat_amount,
  average_order_value,
  total_cash_orders,
  total_card_orders,
  order_completion_rate,
  order_cancellation_rate,
  created_at
FROM eod_reports 
WHERE start_date_time >= '2025-07-04T00:00:00.000Z' 
AND end_date_time <= '2025-07-06T23:59:59.999Z'
ORDER BY created_at DESC;
