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

// Removed unused SavedModifier interface

// Type for component props
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

  // Old browser print method
  const handleDirectPrint = () => {
    if (receiptRef.current) {
      const printContents = receiptRef.current.innerHTML;
      const printWindow = window.open("", "_blank", "width=400,height=600");
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt</title>
              <style>
                body { font-family: Courier New, monospace; font-size: 12px; }
                .receipt { width: 80mm; margin: 0 auto; background: white; color: black; }
              </style>
            </head>
            <body>
              <div class="receipt">${printContents}</div>
              <script>window.onload = function() { window.print(); window.close(); }<\/script>
            </body>
          </html>
        `);
        printWindow.document.close();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-auto">
        {/* Receipt Header with Print Button */}
        <div className="sticky top-0 bg-card px-6 py-4 flex items-center justify-between no-print shadow-sm">
          {/* Print Button (top left) */}
          <div className="flex gap-3">
            <Button
              onClick={handleDirectPrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 transition-all duration-200 font-medium text-sm shadow-md hover:shadow-lg"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                />
              </svg>
              Print
            </Button>
          </div>
          {/* Close Button (top right, small, red, trash icon) */}
          {onClose && (
            <Button onClick={onClose} variant="outline" title="Close">
              x
            </Button>
          )}
        </div>

        {/* Actual Receipt Content */}
        <div
          ref={receiptRef}
          className="receipt p-2 font-mono text-sm bg-white"
          style={{
            fontFamily: "Courier New, monospace",
            lineHeight: "1.2",
            fontWeight: "600",
            width: "80mm",
            margin: "0 auto",
            backgroundColor: "white",
            color: "black",
          }}
        >
          {/* Restaurant Header */}
          <div className="text-center mb-3">
            <div className="text-large mb-1">
              ★ {config.name.toUpperCase()} ★
            </div>
            <div className="arabic text-extra-bold mb-2">{config.nameAr}</div>
            <div className="text-xs text-bold mb-1">{config.address}</div>
            <div className="arabic text-xs text-bold mb-1">
              {config.addressAr}
            </div>
            <div className="text-xs text-bold mb-2">CR: {config.crNumber}</div>
          </div>

          {/* Divider */}
          <div className="border-double py-2 mb-2">
            <div className="text-center text-extra-bold">
              SIMPLIFIED TAX INVOICE
            </div>
            <div className="text-center arabic text-extra-bold">
              فاتورة ضريبية مبسطة
            </div>
          </div>

          {/* Prominent Order Number */}
          <div className="text-center mb-3">
            <div className="order-number-highlight">
              ORDER #{order.orderNumber}
            </div>
          </div>

          {/* Order Information */}
          <div className="mb-2 text-xs text-bold">
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
              <span className="capitalize text-bold">
                {order.paymentMethod}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t py-1 mb-2"></div>

          {/* Items */}
          <div className="mb-2">
            {order.items.map((item, index) => (
              <div key={index} className="mb-2">
                <div className="item-row">
                  <div className="item-name text-extra-bold">{item.name}</div>
                </div>
                <div className="item-row text-xs">
                  <div className="item-name arabic text-bold">
                    {item.nameAr}
                  </div>
                </div>
                <div className="item-row">
                  <div className="flex">
                    <span className="item-qty text-bold">{item.quantity}x</span>
                    <span className="text-bold">
                      @{item.unitPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="item-price text-extra-bold">
                    <SaudiRiyalSymbol size={10} className="inline mr-1" />
                    {item.totalPrice.toFixed(2)}
                  </div>
                </div>
                {/* Display modifiers if they exist (NEW MODEL) */}
                {item.details?.modifiers &&
                  item.details.modifiers.length > 0 && (
                    <div className="modifier-indent">
                      {item.details.modifiers.map(
                        (modifier: Modifier, modIndex: number) => (
                          <div key={modIndex} className="item-row text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600 italic">
                                {modifier.type === "extra" ? "+ " : "- "}
                                {modifier.name}
                              </span>
                              {modifier.type === "extra" &&
                                modifier.price > 0 && (
                                  <span className="text-gray-600">
                                    +
                                    <SaudiRiyalSymbol
                                      size={8}
                                      className="inline"
                                    />
                                    {modifier.price.toFixed(2)}
                                  </span>
                                )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t py-2">
            {/* Totals */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-bold">
                <span>Net Amount:</span>
                <span>
                  <SaudiRiyalSymbol size={10} className="inline mr-1" />
                  {netAmount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-bold">
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
            <div className="text-center mt-3 mb-2">
              <div className="text-xs mb-1 text-extra-bold">ZATCA QR CODE</div>
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
          <div className="text-center text-xs mt-3">
            <div className="mb-1 text-bold">{config.thankYouMessage.en}</div>
            <div className="arabic text-bold">{config.thankYouMessage.ar}</div>
            <div className="mt-2 text-xs border-t pt-1">
              Generated: {new Date().toLocaleString("en-GB")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
