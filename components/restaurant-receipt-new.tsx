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

  // Print handler
  const handlePrint = () => {
    window.print();
  };

  // Format date and time
  const formatDate = (date: Date) => date.toLocaleDateString("en-GB");
  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  const receiptContent = (
    <div
      ref={receiptRef}
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
              {isGeneratingPDF ? "Generating..." : "PDF"}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="flex items-center gap-2"
              size="sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
          </div>

          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
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
  <div className="text-center mb-3">
    <div className="text-lg mb-1 font-bold">
      ★ {config.name.toUpperCase()} ★
    </div>
    <div className="text-base font-bold mb-2">{config.nameAr}</div>
    <div className="text-xs font-bold mb-1">{config.address}</div>
    <div className="text-xs font-bold mb-1">{config.addressAr}</div>
    <div className="text-xs font-bold mb-2">CR: {config.crNumber}</div>
  </div>
);

const InvoiceHeader = () => (
  <div className="text-center border-t-2 border-b-2 border-double py-2 mb-2">
    <div className="font-bold">SIMPLIFIED TAX INVOICE</div>
    <div className="font-bold">فاتورة ضريبية مبسطة</div>
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
      <div className="text-center mb-3">
        <div className="text-lg font-bold border-2 border-black p-2 inline-block">
          ORDER #{order.orderNumber}
        </div>
      </div>

      <div className="mb-2 text-xs">
        <div className="flex justify-between mb-1">
          <span>Date:</span>
          <span>{formatDate(orderDate)}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Time:</span>
          <span>{formatTime(orderDate)}</span>
        </div>
        {cashierName && (
          <div className="flex justify-between mb-1">
            <span>Cashier:</span>
            <span>{cashierName}</span>
          </div>
        )}
        <div className="flex justify-between mb-1">
          <span>Payment:</span>
          <span className="capitalize font-bold">{order.paymentMethod}</span>
        </div>
      </div>

      <div className="border-t py-1 mb-2"></div>
    </>
  );
};

const OrderItems = ({ items }: { items: Order["items"] }) => (
  <div className="mb-2">
    {items.map((item, index) => (
      <div key={index} className="mb-2">
        <div className="font-bold">{item.name}</div>
        <div className="text-xs font-bold mb-1">{item.nameAr}</div>

        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <span className="font-bold">{item.quantity}x</span>
            <span className="font-bold">@{item.unitPrice.toFixed(2)}</span>
          </div>
          <div className="font-bold">
            <SaudiRiyalSymbol size={10} className="inline mr-1" />
            {item.totalPrice.toFixed(2)}
          </div>
        </div>

        {/* Modifiers */}
        {item.details?.modifiers && item.details.modifiers.length > 0 && (
          <div className="ml-4 mt-1">
            {item.details.modifiers.map(
              (modifier: Modifier, modIndex: number) => (
                <div
                  key={modIndex}
                  className="flex justify-between text-xs text-gray-600"
                >
                  <span className="italic">
                    {modifier.type === "extra" ? "+ " : "- "}
                    {modifier.name}
                  </span>
                  {modifier.type === "extra" && modifier.price > 0 && (
                    <span>
                      +<SaudiRiyalSymbol size={8} className="inline" />
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
  <div className="border-t py-2">
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-bold">
        <span>Net Amount:</span>
        <span>
          <SaudiRiyalSymbol size={10} className="inline mr-1" />
          {totals.netAmount.toFixed(2)}
        </span>
      </div>
      <div className="flex justify-between text-xs font-bold">
        <span>VAT (15%):</span>
        <span>
          <SaudiRiyalSymbol size={10} className="inline mr-1" />
          {totals.vatAmount.toFixed(2)}
        </span>
      </div>
      <div className="border-t pt-1">
        <div className="flex justify-between text-base font-bold">
          <span>TOTAL:</span>
          <span>
            <SaudiRiyalSymbol size={12} className="inline mr-1" />
            {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const QRCodeSection = ({ qrCodeDataURL }: { qrCodeDataURL: string }) => (
  <div className="text-center mt-3 mb-2">
    <div className="text-xs mb-1 font-bold">ZATCA QR CODE</div>
    <div className="flex justify-center">
      <Image
        src={qrCodeDataURL}
        alt="ZATCA QR Code"
        width={80}
        height={80}
        className="mx-auto"
      />
    </div>
  </div>
);

const ReceiptFooter = ({ config }: { config: RestaurantConfig }) => (
  <div className="text-center text-xs mt-3">
    <div className="mb-1 font-bold">{config.thankYouMessage.en}</div>
    <div className="font-bold">{config.thankYouMessage.ar}</div>
    <div className="mt-2 text-xs border-t pt-1">
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

      // Wait for render
      setTimeout(resolve, 500);
    });

    // Generate PDF from the rendered content
    const receiptElement = tempContainer.querySelector(
      ".receipt-content"
    ) as HTMLElement;
    if (receiptElement) {
      await generateReceiptPDF(receiptElement, {
        filename: `receipt-${order.orderNumber}.pdf`,
        silent: true,
        widthMM: 80,
      });
    }
  } finally {
    // Cleanup
    document.body.removeChild(tempContainer);
  }
}
