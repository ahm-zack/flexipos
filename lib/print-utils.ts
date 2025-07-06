/**
 * Print utilities for restaurant receipts
 * Provides functions for printing receipts optimized for thermal printers
 */

/**
 * Prints an HTML element with thermal printer optimization
 */
export function printElement(element: HTMLElement, options: {
  title?: string;
  paperWidth?: string;
  fontSize?: string;
  onBeforePrint?: () => void;
  onAfterPrint?: () => void;
} = {}) {
  const {
    title = 'Receipt',
    paperWidth = '58mm',
    fontSize = '12px',
    onBeforePrint,
    onAfterPrint
  } = options;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up blocked! Please allow pop-ups for this site to print receipts.');
    return;
  }

  const receiptContent = element.innerHTML;
  
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: ${fontSize};
            line-height: 1.3;
            color: #000;
            background: #fff;
            width: ${paperWidth};
            margin: 0;
            padding: 8px;
          }
          
          .receipt {
            width: 100%;
            max-width: none;
          }
          
          /* Text styling */
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .text-bold { font-weight: bold; }
          .text-xs { font-size: 10px; }
          .text-sm { font-size: 11px; }
          .text-base { font-size: 12px; }
          .text-lg { font-size: 14px; }
          
          /* Spacing */
          .mb-1 { margin-bottom: 4px; }
          .mb-2 { margin-bottom: 8px; }
          .mb-3 { margin-bottom: 12px; }
          .mb-4 { margin-bottom: 16px; }
          .mt-1 { margin-top: 4px; }
          .mt-2 { margin-top: 8px; }
          .mt-3 { margin-top: 12px; }
          .mt-4 { margin-top: 16px; }
          
          /* Borders and dividers */
          .border-t { border-top: 1px dashed #000; }
          .border-b { border-bottom: 1px dashed #000; }
          .py-1 { padding-top: 4px; padding-bottom: 4px; }
          .py-2 { padding-top: 8px; padding-bottom: 8px; }
          
          /* Layout */
          .flex {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
          }
          
          .flex-center {
            display: flex;
            justify-content: center;
            align-items: center;
          }
          
          /* Arabic text */
          .arabic {
            font-family: 'Traditional Arabic', 'Arial Unicode MS', sans-serif;
            direction: rtl;
            text-align: right;
          }
          
          /* QR Code */
          .qr-code img {
            max-width: 80px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          
          /* Item rows */
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
            min-width: 25px;
            text-align: center;
            margin-right: 8px;
          }
          
          .item-price {
            min-width: 50px;
            text-align: right;
          }
          
          /* Total rows */
          .total-row {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          /* Hide elements that shouldn't print */
          .no-print {
            display: none !important;
          }
          
          /* Print optimization */
          @media print {
            body { 
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .no-print { 
              display: none !important; 
            }
            @page {
              margin: 0;
              size: ${paperWidth} auto;
            }
          }
          
          /* Thermal printer specific optimizations */
          @media print and (max-width: 80mm) {
            body {
              font-size: 10px;
            }
            .text-lg {
              font-size: 12px;
            }
            .qr-code img {
              max-width: 60px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          ${receiptContent}
        </div>
        <script>
          window.onload = function() {
            ${onBeforePrint ? 'window.onBeforePrint && window.onBeforePrint();' : ''}
            window.print();
            window.onafterprint = function() {
              ${onAfterPrint ? 'window.onAfterPrint && window.onAfterPrint();' : ''}
              window.close();
            };
          };
          
          // For older browsers
          window.onbeforeprint = function() {
            ${onBeforePrint ? 'window.onBeforePrint && window.onBeforePrint();' : ''}
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}

/**
 * Opens print dialog with thermal printer recommendations
 */
export function showPrintInstructions() {
  alert(`
Thermal Printer Settings:
• Paper Width: 58mm (2.28 inches)
• Font: Courier New or monospace
• Margins: 0mm
• Scale: 100%

For best results:
• Use thermal receipt printer
• Ensure paper is loaded correctly
• Check ink/thermal paper quality
  `);
}

/**
 * Checks if printing is supported in the current browser
 */
export function isPrintSupported(): boolean {
  return typeof window !== 'undefined' && 'print' in window;
}

/**
 * Formats currency for receipt printing (Saudi Riyal)
 */
export function formatReceiptCurrency(amount: number): string {
  return `SR ${amount.toFixed(2)}`;
}

/**
 * Formats date for receipt printing
 */
export function formatReceiptDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

/**
 * Formats time for receipt printing
 */
export function formatReceiptTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

export const THERMAL_PRINTER_SETTINGS = {
  width: '58mm',
  fontSize: '12px',
  lineHeight: '1.3',
  margin: '8px',
  qrCodeSize: '80px'
} as const;
