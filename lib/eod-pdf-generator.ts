import type { EODReportData, PaymentBreakdown, BestSellingItem } from './schemas';

// Utility functions for safe data handling
export const safeGetString = (value: unknown): string => {
    if (typeof value === "string") return value;
    if (value && typeof value === "object" && "toString" in value) {
        return value.toString();
    }
    if (value instanceof Date) {
        return value.toISOString();
    }
    return "";
};

export const safeParseNumber = (value: unknown): number => {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
};

export const safeParseJSON = (value: unknown): Array<Record<string, unknown>> => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

/**
 * Generates HTML content for EOD reports
 */
export const generateEODReportHTML = (
    data: EODReportData,
    format: "a4" | "thermal",
    formatters: {
        formatDateRange: (start: Date, end: Date) => string;
        formatDate: (date: Date) => string;
        formatCurrency: (amount: number) => string;
    }
) => {
    const isA4 = format === "a4";

    return `
    <div class="eod-report-pdf" style="
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif; 
        padding: ${isA4 ? "20px" : "20px"}; 
        color: #000000; 
        ${isA4 ? "font-size: 12px;" : "font-size: 11px;"}
        line-height: ${isA4 ? "1.3" : "1.4"};
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
        page-break-inside: avoid;
    ">
      <div style="text-align: center; margin-bottom: ${isA4 ? "18px" : "20px"}; border-bottom: 2px solid #000000; padding-bottom: ${isA4 ? "10px" : "15px"};">
        <h1 style="
            margin: 0; 
            color: #000000; 
            ${isA4 ? "font-size: 24px;" : "font-size: 18px;"} 
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        ">End of Day Report</h1>
        <p style="margin: ${isA4 ? "6px 0 3px 0" : "8px 0 4px 0"}; color: #000000; font-weight: 600; ${isA4 ? "font-size: 13px;" : "font-size: 12px;"}">Period: ${formatters.formatDateRange(
        new Date(data.startDateTime),
        new Date(data.endDateTime)
    )}</p>
        <p style="margin: ${isA4 ? "3px 0 0 0" : "4px 0 0 0"}; color: #555555; font-weight: 500; ${isA4 ? "font-size: 11px;" : "font-size: 10px;"}">Generated: ${formatters.formatDate(
        new Date(data.reportGeneratedAt)
    )}</p>
      </div>

      <div style="margin-bottom: ${isA4 ? "18px" : "20px"};">
        <h2 style="
            color: #000000; 
            ${isA4 ? "font-size: 18px;" : "font-size: 16px;"} 
            margin: 0 0 ${isA4 ? "8px" : "12px"} 0;
            font-weight: 600;
            border-left: 4px solid #000000;
            padding-left: 12px;
        ">Financial Summary</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; color: #000000; font-weight: 600; background-color: #f8f9fa;">Total Revenue:</td><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 700; background-color: #f8f9fa;">${formatters.formatCurrency(
        data.totalWithVat
    )} SAR</td></tr>
          <tr><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; color: #000000; font-weight: 600;">Total Orders:</td><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 700;">${data.totalOrders
        }</td></tr>
          <tr><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; color: #000000; font-weight: 600;">Average Order Value:</td><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 700;">${formatters.formatCurrency(
            data.averageOrderValue
        )} SAR</td></tr>
        </table>
      </div>

      <div style="margin-bottom: ${isA4 ? "18px" : "20px"};">
        <h2 style="
            color: #000000; 
            ${isA4 ? "font-size: 18px;" : "font-size: 16px;"} 
            margin: 0 0 ${isA4 ? "8px" : "12px"} 0;
            font-weight: 600;
            border-left: 4px solid #000000;
            padding-left: 12px;
        ">Payment Methods</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          ${data.paymentBreakdown
            .map(
                (payment: PaymentBreakdown) => `
            <tr>
              <td style="padding: ${isA4 ? "7px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-transform: capitalize; color: #000000; font-weight: 600;">${payment.method
                    }</td>
              <td style="padding: ${isA4 ? "7px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 500;">${payment.orderCount
                    } orders</td>
              <td style="padding: ${isA4 ? "7px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 700;">${formatters.formatCurrency(
                        payment.totalAmount
                    )} SAR</td>
            </tr>
          `
            )
            .join("")}
        </table>
      </div>

      <div style="margin-bottom: ${isA4 ? "18px" : "20px"};">
        <h2 style="
            color: #000000; 
            ${isA4 ? "font-size: 18px;" : "font-size: 16px;"} 
            margin: 0 0 ${isA4 ? "8px" : "12px"} 0;
            font-weight: 600;
            border-left: 4px solid #000000;
            padding-left: 12px;
        ">Cash Flow Details</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <tr><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; color: #000000; font-weight: 600; background-color: #f8f9fa;">Cash Paid (Orders):</td><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 700; background-color: #f8f9fa;">${formatters.formatCurrency(
                data.totalCashOrders
            )} SAR</td></tr>
          <tr><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; color: #000000; font-weight: 600;">Card Paid (Orders):</td><td style="padding: ${isA4 ? "8px 6px" : "8px 6px"}; border-bottom: 1px solid #ddd; text-align: right; color: #000000; font-weight: 700;">${formatters.formatCurrency(
                data.totalCardOrders
            )} SAR</td></tr>
        </table>
      </div>

      <div>
        <h2 style="
            color: #000000; 
            ${isA4 ? "font-size: 18px;" : "font-size: 16px;"} 
            margin: 0 0 ${isA4 ? "8px" : "12px"} 0;
            font-weight: 600;
            border-left: 4px solid #000000;
            padding-left: 12px;
        ">All Sold Items</h2>
        <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
          <thead>
            <tr style="background-color: #f1f3f4;">
              <th style="padding: ${isA4 ? "8px 6px" : "10px 6px"}; border-bottom: 2px solid #333; text-align: left; color: #000000; font-weight: 700; ${isA4 ? "font-size: 12px;" : "font-size: 12px;"}">Item</th>
              <th style="padding: ${isA4 ? "8px 6px" : "10px 6px"}; border-bottom: 2px solid #333; text-align: center; color: #000000; font-weight: 700; ${isA4 ? "font-size: 12px;" : "font-size: 12px;"}">Qty</th>
              <th style="padding: ${isA4 ? "8px 6px" : "10px 6px"}; border-bottom: 2px solid #333; text-align: right; color: #000000; font-weight: 700; ${isA4 ? "font-size: 12px;" : "font-size: 12px;"}">Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${data.bestSellingItems
            .map(
                (item: BestSellingItem, index: number) => `
              <tr style="${index % 2 === 0 ? "background-color: #f8f9fa;" : "background-color: #ffffff;"
                    }">
                <td style="padding: ${isA4 ? "6px 6px" : "8px 6px"}; border-bottom: 1px solid #dee2e6; color: #000000; font-weight: 600; line-height: 1.2;">
                  ${item.itemName}
                  <br><small style="color: #6c757d; text-transform: capitalize; font-weight: 500; ${isA4 ? "font-size: 10px;" : "font-size: 9px;"}">${item.itemType
                    }</small>
                </td>
                <td style="padding: ${isA4 ? "6px 6px" : "8px 6px"}; border-bottom: 1px solid #dee2e6; text-align: center; color: #000000; font-weight: 600; ${isA4 ? "font-size: 12px;" : "font-size: 12px;"}">${item.quantity
                    }</td>
                <td style="padding: ${isA4 ? "6px 6px" : "8px 6px"}; border-bottom: 1px solid #dee2e6; text-align: right; color: #000000; font-weight: 700; ${isA4 ? "font-size: 12px;" : "font-size: 12px;"}">${formatters.formatCurrency(
                        item.totalRevenue
                    )} SAR</td>
              </tr>
            `
            )
            .join("")}
          </tbody>
        </table>
      </div>
    </div>
  `;
};

/**
 * Converts historical report data to standardized EOD report format
 */
export const convertHistoricalReportData = (
    report: Record<string, unknown>
): EODReportData => {
    return {
        startDateTime: new Date(safeGetString(report.startDateTime)),
        endDateTime: new Date(safeGetString(report.endDateTime)),
        reportGeneratedAt: new Date(safeGetString(
            report.reportGeneratedAt || report.createdAt
        )),
        totalWithVat: safeParseNumber(report.totalWithVat),
        totalOrders: safeParseNumber(report.totalOrders),
        totalCashOrders: safeParseNumber(report.totalCashOrders),
        totalCardOrders: safeParseNumber(report.totalCardOrders),
        totalWithoutVat: safeParseNumber(report.totalWithoutVat),
        totalCancelledOrders: safeParseNumber(report.totalCancelledOrders || report.cancelledOrders),
        totalCashReceived: safeParseNumber(report.totalCashReceived),
        totalChangeGiven: safeParseNumber(report.totalChangeGiven),
        completedOrders: safeParseNumber(report.completedOrders),
        vatAmount: safeParseNumber(report.vatAmount),
        averageOrderValue: safeParseNumber(report.averageOrderValue),
        paymentBreakdown: (safeParseJSON(report.paymentBreakdown) as unknown) as PaymentBreakdown[],
        bestSellingItems: (safeParseJSON(report.bestSellingItems) as unknown) as BestSellingItem[],
        peakHour: safeGetString(report.peakHour),
        hourlySales: (safeParseJSON(report.hourlySales) as unknown) as { hour: number; orderCount: number; revenue: number }[],
        orderCompletionRate: safeParseNumber(report.orderCompletionRate),
        orderCancellationRate: safeParseNumber(report.orderCancellationRate),
    };
};

/**
 * Main function to generate EOD report PDF
 */
export const generateEODReportPDF = async (
    reportData: EODReportData,
    format: "a4" | "thermal",
    formatters: {
        formatDateRange: (start: Date, end: Date) => string;
        formatDate: (date: Date) => string;
        formatCurrency: (amount: number) => string;
    },
    customFilename?: string
) => {
    try {
        // Create a temporary div to hold the report content for PDF generation
        const tempDiv = document.createElement("div");
        tempDiv.className = format === "thermal" ? "thermal-receipt" : "a4-report";
        tempDiv.style.position = "absolute";
        tempDiv.style.left = "-9999px";
        tempDiv.style.top = "0";

        if (format === "thermal") {
            tempDiv.style.width = "302px"; // 80mm thermal width
        } else {
            tempDiv.style.width = "794px"; // A4 width at 96 DPI
        }

        // Generate report HTML content
        const reportHTML = generateEODReportHTML(reportData, format, formatters);
        tempDiv.innerHTML = reportHTML;

        document.body.appendChild(tempDiv);

        // Import and use the PDF service
        const { generateReceiptPDF } = await import("@/lib/receipt-pdf-service");

        // Generate filename with timestamp
        const startDate = reportData.startDateTime || new Date().toISOString();
        const timestamp = new Date(startDate)
            .toISOString()
            .split("T")[0]
            .replace(/-/g, "");
        const filename = customFilename || `receipt-ORD-${timestamp}.pdf`;

        await generateReceiptPDF(tempDiv, {
            filename,
            widthMM: format === "thermal" ? 80 : 210, // 80mm for thermal, A4 width for A4
        });

        // Clean up
        document.body.removeChild(tempDiv);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        alert("Failed to generate PDF. Please try again.");
        throw error;
    }
};
