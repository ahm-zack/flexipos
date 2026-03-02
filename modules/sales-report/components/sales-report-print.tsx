"use client";

/**
 * Printable A4 Sales Report
 * Designed for print and PDF export – clean, professional layout
 */

import React from "react";
import { useBusiness } from "@/hooks/useBusinessId";
import type { SavedSalesReport } from "@/lib/reports/types";
import { vatUtils } from "@/lib/vat-config";

const fmt = (n: number | string) =>
  parseFloat(n.toString()).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const fmtDate = (d: string | Date) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

interface Props {
  report: SavedSalesReport;
}

export function SalesReportPrintView({ report }: Props) {
  const { businessName } = useBusiness();

  const topItems = Array.isArray(report.top_items)
    ? report.top_items.slice(0, 20)
    : [];
  const catBreakdown = Array.isArray(report.category_breakdown)
    ? report.category_breakdown
    : [];
  const dailySales = Array.isArray(report.daily_sales)
    ? report.daily_sales
    : [];
  const payBreakdown = Array.isArray(report.payment_breakdown)
    ? report.payment_breakdown
    : [];

  return (
    <div
      className="bg-white text-black font-sans"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm",
        boxSizing: "border-box",
        fontSize: "10pt",
      }}
    >
      {/* ───────────────── HEADER ───────────────── */}
      <div
        style={{
          borderBottom: "2px solid #1e293b",
          paddingBottom: "12px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "18pt",
                fontWeight: 700,
                margin: 0,
                color: "#1e293b",
              }}
            >
              {businessName ?? "FlexiPOS"}
            </h1>
            <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "9pt" }}>
              Sales Report
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontWeight: 600 }}>
              {report.report_name ?? "Sales Report"}
            </p>
            <p style={{ margin: "2px 0 0", color: "#64748b", fontSize: "9pt" }}>
              Generated:{" "}
              {new Date(report.created_at).toLocaleDateString("en-US")}
            </p>
          </div>
        </div>
        <div style={{ marginTop: "8px", color: "#64748b", fontSize: "9pt" }}>
          Period: {fmtDate(report.period_start)} — {fmtDate(report.period_end)}
        </div>
      </div>

      {/* ───────────────── KEY METRICS ───────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          {
            label: "Total Revenue",
            value: report.total_revenue,
            currency: true,
          },
          {
            label: "Completed Orders",
            value: report.completed_orders.toString(),
          },
          {
            label: "Avg. Order Value",
            value: report.average_order_value,
            currency: true,
          },
          {
            label: "Cancelled Orders",
            value: report.cancelled_orders.toString(),
          },
        ].map(({ label, value, currency }) => (
          <div
            key={label}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "12px",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "8pt",
                color: "#64748b",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {label}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: "14pt",
                fontWeight: 700,
                color: "#1e293b",
              }}
            >
              {currency ? <span>SAR {fmt(value)}</span> : value}
            </p>
          </div>
        ))}
      </div>

      {/* ───────────────── REVENUE BREAKDOWN ───────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        {[
          { label: "Cash Revenue", value: report.cash_revenue },
          { label: "Card Revenue", value: report.card_revenue },
          { label: "Delivery Revenue", value: report.delivery_revenue },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              padding: "12px",
            }}
          >
            <p style={{ margin: 0, fontSize: "8pt", color: "#64748b" }}>
              {label}
            </p>
            <p style={{ margin: "4px 0 0", fontWeight: 600 }}>
              SAR {fmt(value)}
            </p>
          </div>
        ))}
      </div>

      {/* ───────────────── VAT ───────────────── */}
      {vatUtils.shouldShowVAT() && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              margin: "0 0 10px",
              color: "#1e293b",
            }}
          >
            VAT Breakdown (15%)
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9pt",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Revenue incl. VAT", "VAT Amount", "Revenue excl. VAT"].map(
                  (h) => (
                    <th
                      key={h}
                      style={{
                        padding: "8px",
                        border: "1px solid #e2e8f0",
                        textAlign: "left",
                        fontWeight: 600,
                      }}
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  SAR {fmt(report.total_revenue)}
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  SAR {fmt(report.total_vat)}
                </td>
                <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                  SAR {fmt(report.revenue_ex_vat)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────── PAYMENT METHODS ───────────────── */}
      {payBreakdown.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              margin: "0 0 10px",
              color: "#1e293b",
            }}
          >
            Payment Methods
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9pt",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Method", "Orders", "Amount", "Share"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payBreakdown.map((p) => (
                <tr key={p.method}>
                  <td
                    style={{
                      padding: "8px",
                      border: "1px solid #e2e8f0",
                      textTransform: "capitalize",
                    }}
                  >
                    {p.method}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                    {p.orderCount}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                    SAR {fmt(p.totalAmount)}
                  </td>
                  <td style={{ padding: "8px", border: "1px solid #e2e8f0" }}>
                    {p.percentage.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────── DAILY SALES ───────────────── */}
      {dailySales.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              margin: "0 0 10px",
              color: "#1e293b",
            }}
          >
            Daily Sales
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9pt",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Date", "Orders", "Revenue"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dailySales.map((d, i) => (
                <tr
                  key={d.date}
                  style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                >
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    {d.date}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    {d.orderCount}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    SAR {fmt(d.revenue)}
                  </td>
                </tr>
              ))}
              {/* Totals row */}
              <tr style={{ fontWeight: 600, background: "#f1f5f9" }}>
                <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                  Total
                </td>
                <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                  {report.completed_orders}
                </td>
                <td style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}>
                  SAR {fmt(report.total_revenue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────── TOP ITEMS ───────────────── */}
      {topItems.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              margin: "0 0 10px",
              color: "#1e293b",
            }}
          >
            Top Selling Items
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9pt",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["#", "Item", "Category", "Qty", "Revenue"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {topItems.map((item, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                >
                  <td
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e2e8f0",
                      color: "#94a3b8",
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    {item.name}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e2e8f0",
                      color: "#64748b",
                    }}
                  >
                    {item.categoryName ?? "—"}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    {item.quantity}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    SAR {fmt(item.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────── CATEGORY BREAKDOWN ───────────────── */}
      {catBreakdown.length > 0 && (
        <div style={{ marginBottom: "24px" }}>
          <h2
            style={{
              fontSize: "11pt",
              fontWeight: 700,
              margin: "0 0 10px",
              color: "#1e293b",
            }}
          >
            Category Breakdown
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "9pt",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Category", "Items Sold", "Revenue"].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "6px 8px",
                      border: "1px solid #e2e8f0",
                      textAlign: "left",
                      fontWeight: 600,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {catBreakdown.map((cat, i) => (
                <tr
                  key={i}
                  style={{ background: i % 2 === 0 ? "#fff" : "#f8fafc" }}
                >
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    {cat.categoryName}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    {cat.quantity}
                  </td>
                  <td
                    style={{ padding: "6px 8px", border: "1px solid #e2e8f0" }}
                  >
                    SAR {fmt(cat.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ───────────────── FOOTER ───────────────── */}
      <div
        style={{
          borderTop: "1px solid #e2e8f0",
          paddingTop: "12px",
          marginTop: "24px",
          fontSize: "8pt",
          color: "#94a3b8",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>FlexiPOS — {businessName}</span>
        <span>
          Generated {new Date(report.created_at).toLocaleString("en-US")}
        </span>
      </div>

      {/* ───────────────── PRINT STYLES ───────────────── */}
      <style>{`
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
        }
      `}</style>
    </div>
  );
}
