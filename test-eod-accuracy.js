// EOD Report Accuracy Test
// This script will compare our EOD calculations with raw database data

const { Pool } = require("pg");

const pool = new Pool({
  connectionString: "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
});

async function testEODAccuracy() {
  console.log("🧮 Testing EOD Report Accuracy...\n");

  try {
    // 1. Get raw orders data for a specific date range
    const startDate = "2025-07-04T00:00:00.000Z";
    const endDate = "2025-07-06T23:59:59.999Z";

    console.log(`📅 Testing date range: ${startDate} to ${endDate}\n`);

    // Raw order data
    const ordersQuery = `
      SELECT 
        id, 
        total_amount, 
        payment_method, 
        status,
        items,
        created_at
      FROM orders 
      WHERE created_at BETWEEN $1 AND $2 
      AND status = 'completed'
      ORDER BY created_at;
    `;

    const ordersResult = await pool.query(ordersQuery, [startDate, endDate]);
    const orders = ordersResult.rows;

    console.log(`📊 Found ${orders.length} completed orders in database\n`);

    // Canceled orders
    const canceledQuery = `
      SELECT COUNT(*) as count
      FROM canceled_orders 
      WHERE canceled_at BETWEEN $1 AND $2;
    `;

    const canceledResult = await pool.query(canceledQuery, [
      startDate,
      endDate,
    ]);
    const canceledCount = parseInt(canceledResult.rows[0].count);

    console.log(`❌ Found ${canceledCount} canceled orders\n`);

    // Manual calculations
    let totalRevenue = 0;
    let cashTotal = 0;
    let cardTotal = 0;
    let cashCount = 0;
    let cardCount = 0;
    const paymentMethods = {};
    const hourlyBreakdown = {};
    const itemsBreakdown = {};

    orders.forEach((order) => {
      const amount = parseFloat(order.total_amount);
      totalRevenue += amount;

      // Payment method breakdown
      const method = order.payment_method;
      if (!paymentMethods[method]) {
        paymentMethods[method] = { count: 0, total: 0 };
      }
      paymentMethods[method].count += 1;
      paymentMethods[method].total += amount;

      if (method === "cash") {
        cashTotal += amount;
        cashCount += 1;
      } else if (method === "card") {
        cardTotal += amount;
        cardCount += 1;
      }

      // Hourly breakdown
      const hour = new Date(order.created_at).getHours();
      if (!hourlyBreakdown[hour]) {
        hourlyBreakdown[hour] = { count: 0, revenue: 0 };
      }
      hourlyBreakdown[hour].count += 1;
      hourlyBreakdown[hour].revenue += amount;

      // Items breakdown
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          const key = `${item.name || item.nameEn || "Unknown"}-${
            item.type || "unknown"
          }`;
          if (!itemsBreakdown[key]) {
            itemsBreakdown[key] = {
              name: item.name || item.nameEn || "Unknown",
              type: item.type || "unknown",
              quantity: 0,
              revenue: 0,
            };
          }
          itemsBreakdown[key].quantity += item.quantity || 1;
          itemsBreakdown[key].revenue += parseFloat(
            item.totalPrice || item.unitPrice || 0
          );
        });
      }
    });

    // Calculate VAT (15%)
    const VAT_RATE = 0.15;
    const totalWithVat = totalRevenue;
    const totalWithoutVat = totalRevenue / (1 + VAT_RATE);
    const vatAmount = totalWithVat - totalWithoutVat;
    const averageOrderValue =
      orders.length > 0 ? totalRevenue / orders.length : 0;
    const totalOrders = orders.length + canceledCount;
    const completionRate =
      totalOrders > 0 ? (orders.length / totalOrders) * 100 : 0;
    const cancellationRate =
      totalOrders > 0 ? (canceledCount / totalOrders) * 100 : 0;

    console.log("🔍 MANUAL CALCULATIONS:");
    console.log("========================");
    console.log(`Total Orders: ${totalOrders}`);
    console.log(`Completed Orders: ${orders.length}`);
    console.log(`Canceled Orders: ${canceledCount}`);
    console.log(`Total Revenue (with VAT): ${totalRevenue.toFixed(2)} SAR`);
    console.log(
      `Total Revenue (without VAT): ${totalWithoutVat.toFixed(2)} SAR`
    );
    console.log(`VAT Amount: ${vatAmount.toFixed(2)} SAR`);
    console.log(`Average Order Value: ${averageOrderValue.toFixed(2)} SAR`);
    console.log(
      `Cash Total: ${cashTotal.toFixed(2)} SAR (${cashCount} orders)`
    );
    console.log(
      `Card Total: ${cardTotal.toFixed(2)} SAR (${cardCount} orders)`
    );
    console.log(`Completion Rate: ${completionRate.toFixed(2)}%`);
    console.log(`Cancellation Rate: ${cancellationRate.toFixed(2)}%`);

    // Payment breakdown
    console.log("\n💳 PAYMENT BREAKDOWN:");
    Object.entries(paymentMethods).forEach(([method, data]) => {
      const percentage =
        totalRevenue > 0 ? (data.total / totalRevenue) * 100 : 0;
      console.log(
        `${method}: ${data.total.toFixed(2)} SAR (${
          data.count
        } orders, ${percentage.toFixed(2)}%)`
      );
    });

    // Top selling items
    console.log("\n🏆 TOP SELLING ITEMS:");
    const topItems = Object.values(itemsBreakdown)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    topItems.forEach((item) => {
      const avgPrice = item.quantity > 0 ? item.revenue / item.quantity : 0;
      console.log(
        `${item.name} (${item.type}): Qty ${
          item.quantity
        }, Revenue ${item.revenue.toFixed(2)} SAR, Avg ${avgPrice.toFixed(
          2
        )} SAR`
      );
    });

    // Active hours
    console.log("\n⏰ ACTIVE HOURS:");
    Object.entries(hourlyBreakdown)
      .filter(([_, data]) => data.count > 0)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([hour, data]) => {
        console.log(
          `${hour.padStart(2, "0")}:00 - ${
            data.count
          } orders, ${data.revenue.toFixed(2)} SAR`
        );
      });

    // Peak hour
    const peakHour = Object.entries(hourlyBreakdown).reduce(
      (max, [hour, data]) =>
        data.count > max.count ? { hour, count: data.count } : max,
      { hour: "00", count: 0 }
    );
    console.log(
      `\n🎯 Peak Hour: ${peakHour.hour.padStart(2, "0")}:00 (${
        peakHour.count
      } orders)`
    );

    // Now get EOD report from our API for comparison
    console.log("\n\n🤖 FETCHING EOD REPORT FROM API...");
    console.log("=================================");

    // Note: This would require authentication, so we'll skip the API call for now
    // Instead, let's check the database directly for any existing EOD reports
    const eodQuery = `
      SELECT * FROM eod_reports 
      WHERE start_date_time >= $1 AND end_date_time <= $2
      ORDER BY created_at DESC
      LIMIT 1;
    `;

    const eodResult = await pool.query(eodQuery, [startDate, endDate]);

    if (eodResult.rows.length > 0) {
      const report = eodResult.rows[0];
      console.log("\n📋 EXISTING EOD REPORT IN DATABASE:");
      console.log(`Total Orders: ${report.total_orders}`);
      console.log(`Completed Orders: ${report.completed_orders}`);
      console.log(`Canceled Orders: ${report.cancelled_orders}`);
      console.log(`Total Revenue: ${report.total_revenue} SAR`);
      console.log(`Total with VAT: ${report.total_with_vat} SAR`);
      console.log(`Total without VAT: ${report.total_without_vat} SAR`);
      console.log(`VAT Amount: ${report.vat_amount} SAR`);
      console.log(`Average Order Value: ${report.average_order_value} SAR`);
      console.log(`Cash Total: ${report.total_cash_orders} SAR`);
      console.log(`Card Total: ${report.total_card_orders} SAR`);
      console.log(`Completion Rate: ${report.order_completion_rate}%`);
      console.log(`Cancellation Rate: ${report.order_cancellation_rate}%`);

      // Compare values
      console.log("\n🔍 COMPARISON (Manual vs Reported):");
      console.log("====================================");
      console.log(
        `Total Orders: ${totalOrders} vs ${report.total_orders} ${
          totalOrders === report.total_orders ? "✅" : "❌"
        }`
      );
      console.log(
        `Total Revenue: ${totalRevenue.toFixed(2)} vs ${parseFloat(
          report.total_revenue
        ).toFixed(2)} ${
          Math.abs(totalRevenue - parseFloat(report.total_revenue)) < 0.01
            ? "✅"
            : "❌"
        }`
      );
      console.log(
        `VAT Amount: ${vatAmount.toFixed(2)} vs ${parseFloat(
          report.vat_amount
        ).toFixed(2)} ${
          Math.abs(vatAmount - parseFloat(report.vat_amount)) < 0.01
            ? "✅"
            : "❌"
        }`
      );
      console.log(
        `Cash Total: ${cashTotal.toFixed(2)} vs ${parseFloat(
          report.total_cash_orders
        ).toFixed(2)} ${
          Math.abs(cashTotal - parseFloat(report.total_cash_orders)) < 0.01
            ? "✅"
            : "❌"
        }`
      );
      console.log(
        `Completion Rate: ${completionRate.toFixed(2)} vs ${parseFloat(
          report.order_completion_rate
        ).toFixed(2)} ${
          Math.abs(completionRate - parseFloat(report.order_completion_rate)) <
          0.01
            ? "✅"
            : "❌"
        }`
      );
    } else {
      console.log("No existing EOD reports found for this date range.");
    }
  } catch (error) {
    console.error("Error testing EOD accuracy:", error);
  } finally {
    await pool.end();
  }
}

testEODAccuracy();
