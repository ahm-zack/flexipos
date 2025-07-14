"use client";

import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { Order } from "@/lib/orders";
import { SaudiRiyalSymbol } from "@/components/currency/saudi-riyal-symbol";
import { generateZATCAQRCode, type ZATCAInvoiceData } from "@/lib/zatca-qr";
import {
  RESTAURANT_CONFIG,
  type RestaurantConfig,
} from "@/lib/restaurant-config";
import { Button } from "./ui/button";
import type { Modifier } from "@/lib/schemas";
import { Download, X, Printer } from "lucide-react";
import { generateReceiptPDF } from "@/lib/receipt-pdf-service";

// Types
interface RestaurantReceiptProps {
  order: Order;
  restaurantInfo?: Partial<RestaurantConfig>;
  cashierName?: string;
  onClose?: () => void;
  showModal?: boolean;
}

interface TotalCalculations {
  subtotal: number;
  vatAmount: number;
  netAmount: number;
  vatRate: number;
}

export function RestaurantReceipt({
  order,
  restaurantInfo,
  cashierName,
  onClose,
  showModal = true,
}: RestaurantReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Merge with default configuration
  const config = { ...RESTAURANT_CONFIG, ...restaurantInfo };

  // Calculate totals
  const totals: TotalCalculations = React.useMemo(() => {
    const subtotal = order.totalAmount;
    const vatRate = config.vatRate;
    const vatAmount = (subtotal * vatRate) / (1 + vatRate);
    const netAmount = subtotal - vatAmount;

    return {
      subtotal,
      vatAmount,
      netAmount,
      vatRate,
    };
  }, [order.totalAmount, config.vatRate]);

  // Generate QR Code
  useEffect(() => {
    const generateQR = async () => {
      try {
        const zatcaData: ZATCAInvoiceData = {
          sellerName: config.name,
          vatRegistrationNumber: config.vatNumber,
          timestamp: new Date(order.createdAt),
          invoiceTotal: order.totalAmount,
          vatTotal: totals.vatAmount,
        };

        const qrCode = await generateZATCAQRCode(zatcaData, {
          size: 150,
          margin: 1,
          errorCorrectionLevel: "M",
        });

        setQrCodeDataURL(qrCode);
      } catch (error) {
        console.error("Failed to generate QR code:", error);
      }
    };

    generateQR();
  }, [order, config.name, config.vatNumber, totals.vatAmount]);

  // Silent PDF download handler
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      setIsGeneratingPDF(true);
      await generateReceiptPDF(receiptRef.current, {
        filename: `receipt-${order.orderNumber}.pdf`,
        silent: true,
        widthMM: 80,
      });
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      // Fallback to print dialog
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Print handler - direct print dialog without opening new tab
  const handlePrint = () => {
    // Create print-specific styles for thermal receipt
    const printStyles = `
      <style>
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: "Courier New", monospace !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            padding: 4px !important;
            width: 80mm !important;
            background: white !important;
            color: black !important;
          }
          
          .receipt-content {
            width: 80mm !important;
            max-width: 80mm !important;
            font-family: "Courier New", monospace !important;
            font-size: 11px !important;
            line-height: 1.2 !important;
            padding: 4px !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          
          /* Thermal receipt specific styles */
          .receipt-content div {
            margin-bottom: 2px !important;
            word-wrap: break-word !important;
          }
          
          .receipt-content .text-lg {
            font-size: 14px !important;
            font-weight: bold !important;
          }
          
          .receipt-content .text-base {
            font-size: 12px !important;
          }
          
          .receipt-content .text-xs {
            font-size: 10px !important;
          }
          
          .receipt-content .text-center {
            text-align: center !important;
          }
          
          .receipt-content .flex {
            display: flex !important;
            justify-content: space-between !important;
          }
          
          .receipt-content .border-t {
            border-top: 1px solid black !important;
          }
          
          .receipt-content .border-b {
            border-bottom: 1px solid black !important;
          }
          
          .receipt-content .border-double {
            border-style: double !important;
          }
          
          .receipt-content .border-2 {
            border: 2px solid black !important;
          }
          
          .receipt-content img {
            max-width: 60px !important;
            height: auto !important;
          }
        }
      </style>
    `;

    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";

    document.body.appendChild(iframe);

    // Get the receipt content
    const receiptContent = receiptRef.current?.outerHTML || "";

    // Write content to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (iframeDoc) {
      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - Order #${order.orderNumber}</title>
            ${printStyles}
          </head>
          <body>
            ${receiptContent}
          </body>
        </html>
      `);
      iframeDoc.close();

      // Wait for content to load, then print
      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.print();
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(iframe);
          }, 1000);
        }, 500);
      };
    }
  };

  // Format date and time
  const formatDate = (date: Date) => date.toLocaleDateString("en-GB");
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const receiptContent = (
    <div
      ref={receiptRef}
      data-receipt-element="true"
      className="receipt-content"
      style={{
        fontFamily: "Courier New, monospace",
        lineHeight: "1.2",
        fontWeight: "600",
        width: "80mm",
        margin: "0 auto",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: "8px",
        border: "1px solid #ddd",
        fontSize: "14px",
      }}
    >
      {/* Restaurant Header */}
      <RestaurantHeader config={config} />

      {/* Invoice Header */}
      <InvoiceHeader />

      {/* Order Information */}
      <OrderInfo
        order={order}
        cashierName={cashierName}
        formatDate={formatDate}
        formatTime={formatTime}
      />

      {/* Order Items */}
      <OrderItems items={order.items} />

      {/* Totals */}
      <OrderTotals totals={totals} totalAmount={order.totalAmount} />

      {/* QR Code */}
      {qrCodeDataURL && <QRCodeSection qrCodeDataURL={qrCodeDataURL} />}

      {/* Footer */}
      <ReceiptFooter config={config} />
    </div>
  );

  if (!showModal) {
    return receiptContent;
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div
        className="rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Header with controls */}
        <div
          className="sticky top-0 px-6 py-4 flex items-center justify-between border-b no-print"
          style={{ backgroundColor: "#ffffff" }}
        >
          <div className="flex gap-2">
            <Button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? "Generating..." : "Print Invoice"}
            </Button>

            <Button
              onClick={handlePrint}
              variant="secondary"
              className="flex items-center gap-2"
              size="sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>

          {onClose && (
            <Button
              onClick={onClose}
              variant="destructive"
              size="sm"
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Receipt Content */}
        {receiptContent}
      </div>
    </div>
  );
}

// Sub-components for better organization
const RestaurantHeader = ({ config }: { config: RestaurantConfig }) => (
  <div
    // className="text-center mb-3"
    style={{ textAlign: "center", marginBottom: "0.75rem" }}
  >
    <div
      style={{ fontSize: "1.125rem", fontWeight: 600, marginBottom: "0.25rem" }}
    >
      ★ {config.name.toUpperCase()} ★
    </div>
    <div style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "0.5rem" }}>
      {config.nameAr}
    </div>
    <div
      style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.25rem" }}
    >
      {config.address}
    </div>
    <div
      style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.25rem" }}
    >
      {config.addressAr}
    </div>
    <div
      style={{ fontSize: "0.75rem", fontWeight: 700, marginBottom: "0.5rem" }}
    >
      CR: {config.crNumber}
    </div>
  </div>
);

const InvoiceHeader = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      borderTop: "0.125rem double black",
      borderBottom: "0.125rem double black",
      paddingTop: "0.5rem",
      paddingBottom: "0.5rem",
      marginBottom: "0.5rem",
      position: "relative",
    }}
  >
    <div style={{ fontWeight: 700, textAlign: "center", width: "100%" }}>
      SIMPLIFIED TAX INVOICE
    </div>
    <div style={{ fontWeight: 700, textAlign: "center", width: "100%" }}>
      فاتورة ضريبية مبسطة
    </div>
  </div>
);

const OrderInfo = ({
  order,
  cashierName,
  formatDate,
  formatTime,
}: {
  order: Order;
  cashierName?: string;
  formatDate: (date: Date) => string;
  formatTime: (date: Date) => string;
}) => {
  const orderDate = new Date(order.createdAt);

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "1.2rem",
        }}
      >
        <div
          style={{
            fontSize: "1.125rem",
            fontWeight: 700,
            border: "0.125rem solid #000",
            padding: "0.5rem 2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "180px",
            minHeight: "40px",
            textAlign: "center",
          }}
        >
          ORDER #{order.orderNumber}
        </div>
      </div>

      <div style={{ marginBottom: "0.5rem", fontSize: "0.75rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.25rem",
          }}
        >
          <span>Date:</span>
          <span>{formatDate(orderDate)}</span>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.25rem",
          }}
        >
          <span>Time:</span>
          <span>{formatTime(orderDate)}</span>
        </div>
        {cashierName && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.25rem",
            }}
          >
            <span>Cashier:</span>
            <span>{cashierName}</span>
          </div>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "0.25rem",
          }}
        >
          <span>Payment:</span>
          <span style={{ textTransform: "capitalize", fontWeight: 700 }}>
            {order.paymentMethod}
          </span>
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid #000",
          paddingTop: "0.25rem",
          paddingBottom: "0.25rem",
          marginBottom: "0.5rem",
        }}
      ></div>
    </>
  );
};

const OrderItems = ({ items }: { items: Order["items"] }) => (
  <div style={{ marginBottom: "0.5rem" }}>
    {items.map((item, index) => (
      <div key={index} style={{ marginBottom: "0.5rem" }}>
        <div style={{ fontWeight: 700 }}>{item.name}</div>
        <div
          style={{
            fontSize: "0.75rem",
            fontWeight: 700,
            marginBottom: "0.25rem",
          }}
        >
          {item.nameAr}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
          }}
        >
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <span style={{ fontWeight: 700 }}>{item.quantity}x</span>
            <span style={{ fontWeight: 700 }}>
              @{item.unitPrice.toFixed(2)}
            </span>
          </div>
          <div
            style={{
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              paddingLeft: "10px",
            }}
          >
            {/* <SaudiRiyalSymbol
              size={10}
              style={{
                display: "inline",
                marginRight: "0.25rem",
                verticalAlign: "baseline",
              }}
            /> */}
            <span>{item.totalPrice.toFixed(2)}</span>
          </div>
        </div>

        {/* Modifiers */}
        {item.details?.modifiers && item.details.modifiers.length > 0 && (
          <div style={{ marginLeft: "1rem", marginTop: "0.25rem" }}>
            {item.details.modifiers.map(
              (modifier: Modifier, modIndex: number) => (
                <div
                  key={modIndex}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#4B5563",
                  }}
                >
                  <span style={{ fontStyle: "italic" }}>
                    {modifier.type === "extra" ? "+ " : "- "}
                    {modifier.name}
                  </span>
                  {modifier.type === "extra" && modifier.price > 0 && (
                    <span>
                      +
                      {/* <SaudiRiyalSymbol
                        size={8}
                        style={{
                          display: "inline",
                          marginRight: "0.125rem",
                          verticalAlign: "baseline",
                        }}
                      /> */}
                      {modifier.price.toFixed(2)}
                    </span>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    ))}
  </div>
);

const OrderTotals = ({
  totals,
  totalAmount,
}: {
  totals: TotalCalculations;
  totalAmount: number;
}) => (
  <div
    style={{
      borderTop: "1px solid #000",
      paddingTop: "0.75rem",
      paddingBottom: "0.75rem",
      marginBottom: "0.5rem",
    }}
  >
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        <span>Net Amount:</span>
        <span>{totals.netAmount.toFixed(2)}</span>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          fontWeight: 700,
          marginBottom: "0.5rem",
        }}
      >
        <span>VAT (15%):</span>
        <span>{totals.vatAmount.toFixed(2)}</span>
      </div>
      <div
        style={{
          borderTop: "1px solid #000",
          paddingTop: "0.5rem",
          marginTop: "0.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "1rem",
            fontWeight: 700,
            alignItems: "center",
          }}
        >
          <span>TOTAL:</span>
          <span>
            <SaudiRiyalSymbol
              size={12}
              style={{
                display: "inline",
                marginRight: "0.25rem",
                verticalAlign: "baseline",
              }}
            />
            {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const QRCodeSection = ({ qrCodeDataURL }: { qrCodeDataURL: string }) => (
  <div
    style={{
      textAlign: "center",
      marginTop: "0.75rem",
      marginBottom: "0.5rem",
    }}
  >
    <div
      style={{ fontSize: "0.75rem", marginBottom: "0.25rem", fontWeight: 700 }}
    >
      ZATCA QR CODE
    </div>
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Image
        src={qrCodeDataURL}
        alt="ZATCA QR Code"
        width={80}
        height={80}
        style={{ marginLeft: "auto", marginRight: "auto" }}
      />
    </div>
  </div>
);

const ReceiptFooter = ({ config }: { config: RestaurantConfig }) => (
  <div
    style={{ textAlign: "center", fontSize: "0.75rem", marginTop: "0.75rem" }}
  >
    <div style={{ marginBottom: "0.25rem", fontWeight: 700 }}>
      {config.thankYouMessage.en}
    </div>
    <div style={{ fontWeight: 700 }}>{config.thankYouMessage.ar}</div>
    <div
      style={{
        marginTop: "0.5rem",
        fontSize: "0.75rem",
        borderTop: "1px solid #000",
        paddingTop: "0.25rem",
      }}
    >
      Generated: {new Date().toLocaleString("en-GB")}
    </div>
  </div>
);

// Export utility function for programmatic PDF download
export async function downloadReceiptPDF(
  order: Order,
  config?: Partial<RestaurantConfig>,
  cashierName?: string
): Promise<void> {
  // Create a temporary container
  const tempContainer = document.createElement("div");
  tempContainer.style.position = "absolute";
  tempContainer.style.left = "-9999px";
  tempContainer.style.top = "-9999px";
  tempContainer.style.width = "80mm";
  tempContainer.style.backgroundColor = "#ffffff";

  document.body.appendChild(tempContainer);

  try {
    // Use React to render the receipt
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(tempContainer);

    await new Promise<void>((resolve) => {
      root.render(
        React.createElement(RestaurantReceipt, {
          order,
          restaurantInfo: config,
          cashierName,
          showModal: false,
        })
      );
      // Wait longer for render (1000ms)
      setTimeout(resolve, 1000);
    });

    // Debug: log tempContainer HTML
    console.log(
      "[downloadReceiptPDF] tempContainer HTML:",
      tempContainer.innerHTML
    );

    // Generate PDF from the rendered content
    const receiptElement = tempContainer.querySelector(
      ".receipt-content"
    ) as HTMLElement;
    if (receiptElement) {
      console.log(
        "[downloadReceiptPDF] Found .receipt-content, generating PDF..."
      );
      await generateReceiptPDF(receiptElement, {
        filename: `receipt-${order.orderNumber}.pdf`,
        silent: true,
        widthMM: 80,
      });
    } else {
      console.error(
        "[downloadReceiptPDF] .receipt-content not found in tempContainer!"
      );
    }
  } finally {
    // Cleanup
    document.body.removeChild(tempContainer);
  }
}
