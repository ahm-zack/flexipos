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

interface RestaurantReceiptProps {
  order: Order;
  restaurantInfo?: Partial<RestaurantConfig>;
  cashierName?: string;
  onClose?: () => void;
}

export function RestaurantReceipt({
  order,
  restaurantInfo,
  cashierName,
  onClose,
}: RestaurantReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [qrCodeDataURL, setQrCodeDataURL] = useState<string>("");

  // Merge with default configuration
  const config = { ...RESTAURANT_CONFIG, ...restaurantInfo };

  // Calculate totals
  const subtotal = order.totalAmount;
  const vatRate = config.vatRate; // Use VAT rate from config
  const vatAmount = (subtotal * vatRate) / (1 + vatRate); // VAT amount from inclusive total
  const netAmount = subtotal - vatAmount;

  useEffect(() => {
    const generateQR = async () => {
      try {
        const zatcaData: ZATCAInvoiceData = {
          sellerName: config.name,
          vatRegistrationNumber: config.vatNumber,
          timestamp: new Date(order.createdAt),
          invoiceTotal: order.totalAmount,
          vatTotal: vatAmount,
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
  }, [order, config.name, config.vatNumber, vatAmount]);

  const handlePrint = () => {
    if (receiptRef.current) {
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        const receiptContent = receiptRef.current.innerHTML;

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Receipt - ${order.orderNumber}</title>
              <meta charset="UTF-8">
              <style>
                * {
                  box-sizing: border-box;
                  margin: 0;
                  padding: 0;
                }
                
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.3;
                  color: #000;
                  background: #fff;
                  width: 58mm; /* Standard thermal printer width */
                  margin: 0;
                  padding: 8px;
                }
                
                .receipt {
                  width: 100%;
                  max-width: none;
                }
                
                .text-center { text-align: center; }
                .text-right { text-align: right; }
                .text-bold { font-weight: bold; }
                .mb-1 { margin-bottom: 4px; }
                .mb-2 { margin-bottom: 8px; }
                .mb-3 { margin-bottom: 12px; }
                .mb-4 { margin-bottom: 16px; }
                .border-t { border-top: 1px dashed #000; }
                .border-b { border-bottom: 1px dashed #000; }
                .py-1 { padding-top: 4px; padding-bottom: 4px; }
                .py-2 { padding-top: 8px; padding-bottom: 8px; }
                
                .flex {
                  display: flex;
                  justify-content: space-between;
                  align-items: flex-start;
                }
                
                .arabic {
                  font-family: 'Traditional Arabic', 'Arial Unicode MS', sans-serif;
                  direction: rtl;
                  text-align: right;
                }
                
                .qr-code img {
                  max-width: 80px;
                  height: auto;
                }
                
                .item-row {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 2px;
                  font-size: 11px;
                }
                
                .item-name {
                  flex: 1;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  white-space: nowrap;
                  margin-right: 8px;
                }
                
                .item-qty {
                  min-width: 20px;
                  text-align: center;
                  margin-right: 8px;
                }
                
                .item-price {
                  min-width: 40px;
                  text-align: right;
                }
                
                .total-row {
                  display: flex;
                  justify-content: space-between;
                  font-weight: bold;
                }
                
                @media print {
                  body { -webkit-print-color-adjust: exact; }
                  .no-print { display: none !important; }
                }
              </style>
            </head>
            <body>
              <div class="receipt">
                ${receiptContent}
              </div>
              <script>
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.close();
                  };
                };
              </script>
            </body>
          </html>
        `);

        printWindow.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Receipt Header with Print Button */}
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between no-print">
          <h2 className="text-lg font-semibold text-black">
            Restaurant Receipt
          </h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              🖨️ Print Receipt
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
              >
                ✕ Close
              </button>
            )}
          </div>
        </div>

        {/* Actual Receipt Content */}
        <div
          ref={receiptRef}
          className="receipt p-6 font-mono text-sm bg-white"
          style={{
            fontFamily: "Courier New, monospace",
            lineHeight: "1.3",
            width: "58mm",
            margin: "0 auto",
            backgroundColor: "white",
            color: "black",
          }}
        >
          {/* Restaurant Header */}
          <div className="text-center mb-4">
            <div className="text-bold text-lg mb-1">{config.name}</div>
            <div className="arabic text-base mb-2">{config.nameAr}</div>
            <div className="text-xs mb-1">{config.address}</div>
            <div className="arabic text-xs mb-1">{config.addressAr}</div>
            <div className="text-xs mb-1">Tel: {config.phone}</div>
            <div className="text-xs mb-1">VAT: {config.vatNumber}</div>
            <div className="text-xs mb-2">CR: {config.crNumber}</div>
          </div>

          {/* Divider */}
          <div className="border-t border-b py-2 mb-3">
            <div className="text-center text-bold">Simplified Tax Invoice</div>
            <div className="text-center arabic text-bold">
              فاتورة ضريبية مبسطة
            </div>
          </div>

          {/* Order Information */}
          <div className="mb-3 text-xs">
            <div className="flex justify-between mb-1">
              <span>Order No:</span>
              <span className="text-bold">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Date:</span>
              <span>
                {new Date(order.createdAt).toLocaleDateString("en-GB")}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span>Time:</span>
              <span>
                {new Date(order.createdAt).toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            {cashierName && (
              <div className="flex justify-between mb-1">
                <span>Cashier:</span>
                <span>{cashierName}</span>
              </div>
            )}
            <div className="flex justify-between mb-1">
              <span>Payment:</span>
              <span className="capitalize">{order.paymentMethod}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t py-1 mb-2"></div>

          {/* Items */}
          <div className="mb-3">
            {order.items.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="item-row">
                  <div className="item-name text-bold">{item.name}</div>
                </div>
                <div className="item-row text-xs">
                  <div className="item-name arabic">{item.nameAr}</div>
                </div>
                <div className="item-row">
                  <div className="flex">
                    <span className="item-qty">{item.quantity}x</span>
                    <span>@{item.unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="item-price text-bold">
                    <SaudiRiyalSymbol size={10} className="inline mr-1" />
                    {item.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t py-2">
            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Net Amount:</span>
                <span>
                  <SaudiRiyalSymbol size={10} className="inline mr-1" />
                  {netAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span>VAT (15%):</span>
                <span>
                  <SaudiRiyalSymbol size={10} className="inline mr-1" />
                  {vatAmount.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-1">
                <div className="total-row">
                  <span>TOTAL:</span>
                  <span>
                    <SaudiRiyalSymbol size={12} className="inline mr-1" />
                    {order.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ZATCA QR Code */}
          {qrCodeDataURL && (
            <div className="text-center mt-4 mb-3">
              <div className="text-xs mb-2 text-bold">ZATCA QR Code</div>
              <div className="qr-code flex justify-center">
                <Image
                  src={qrCodeDataURL}
                  alt="ZATCA QR Code"
                  width={80}
                  height={80}
                  className="mx-auto"
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="text-center text-xs mt-4">
            <div className="mb-1">{config.thankYouMessage.en}</div>
            <div className="arabic">{config.thankYouMessage.ar}</div>
            <div className="mt-2 text-xs">
              Generated: {new Date().toLocaleString("en-GB")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
