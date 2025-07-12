import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export interface ReceiptPDFOptions {
  filename?: string;
  silent?: boolean;
  widthMM?: number;
}

/**
 * Simple and efficient PDF generation for receipt elements
 */
export async function generateReceiptPDF(
  element: HTMLElement,
  options: ReceiptPDFOptions = {}
): Promise<void> {
  const {
    filename = `receipt-${Date.now()}.pdf`,
    silent = true,
    widthMM = 80,
  } = options;

  console.log("Starting PDF generation for element:", element);

  try {
    // Check if element is actually visible and has content
    const rect = element.getBoundingClientRect();
    console.log("Element bounding rect:", rect);
    console.log("Element content preview:", element.innerHTML.substring(0, 200));

    if (rect.width === 0 || rect.height === 0) {
      console.log("Element has zero dimensions, trying to make it visible...");
      
      // Try to find the receipt content directly
      const receiptContent = element.querySelector('[data-receipt-element]') || element;
      console.log("Found receipt content element:", receiptContent);
      
      if (receiptContent && receiptContent !== element) {
        return generateReceiptPDF(receiptContent as HTMLElement, options);
      }
    }

    // Create a clone of the element to render off-screen
    const clonedElement = element.cloneNode(true) as HTMLElement;
    
    // Position the clone off-screen but visible - FORCE 80mm WIDTH
    clonedElement.style.position = 'absolute';
    clonedElement.style.left = '-9999px';
    clonedElement.style.top = '0';
    clonedElement.style.width = '302px'; // 80mm = 302px at 96 DPI
    clonedElement.style.minWidth = '302px';
    clonedElement.style.maxWidth = '302px';
    clonedElement.style.backgroundColor = '#ffffff';
    clonedElement.style.visibility = 'visible';
    clonedElement.style.display = 'block';
    clonedElement.style.opacity = '1';
    clonedElement.style.boxSizing = 'border-box';
    clonedElement.style.padding = '8px'; // Add padding for better text spacing
    clonedElement.style.fontSize = '12px'; // Smaller font for thermal receipt
    clonedElement.style.lineHeight = '1.2'; // Compact line height
    
    // DO NOT remove class names - preserve original design
    // DO NOT override font families - keep original Arabic/design fonts
    

   
    // allElements.forEach((el) => {
    //   const htmlEl = el as HTMLElement;
    //   // Remove all classes (safely)
    //   try {
    //     htmlEl.className = '';
    //   } catch {
    //     // Some elements (like SVG) have read-only className
    //   }
      
    //   // Apply thermal receipt sizing - optimized for 80mm width
    //   htmlEl.style.color = '#000000';
    //   htmlEl.style.backgroundColor = 'transparent';
    //   htmlEl.style.fontFamily = '"Courier New", "Lucida Console", monospace'; // Better for thermal printing
    //   htmlEl.style.border = 'none';
    //   htmlEl.style.outline = 'none';
    //   htmlEl.style.boxShadow = 'none';
    //   htmlEl.style.fontSize = '11px'; // Smaller for thermal receipt
    //   htmlEl.style.lineHeight = '1.2';
    //   htmlEl.style.fontWeight = '400';
    //   htmlEl.style.margin = '0';
    //   htmlEl.style.padding = '0';
    //   htmlEl.style.wordWrap = 'break-word'; // Ensure text wraps within width
    //   htmlEl.style.overflowWrap = 'break-word';
    //   htmlEl.style.maxWidth = '100%';
      
    //   // Get text content for intelligent styling
    //   const textContent = htmlEl.textContent?.trim() || '';
      
    //   // Handle different element types with thermal receipt sizing
    //   if (htmlEl.tagName === 'DIV') {
    //     htmlEl.style.display = 'block';
    //     htmlEl.style.marginBottom = '4px'; // Compact spacing
    //     htmlEl.style.width = '100%';
        
    //     // Header/Restaurant Name - Thermal receipt header
    //     if (textContent.includes('★') || textContent.includes('LAZAZA') || textContent.includes('مؤسسة')) {
    //       htmlEl.style.fontSize = '14px'; // Slightly larger for header
    //       htmlEl.style.fontWeight = '700';
    //       htmlEl.style.textAlign = 'center';
    //       htmlEl.style.marginBottom = '2px';
    //     //   htmlEl.style.letterSpacing = '0.5px';
    //     }
        
    //     // Contact Information - Compact thermal style
    //     else if (textContent.includes('Road') || textContent.includes('Tel:') || textContent.includes('VAT:') || textContent.includes('CR:')) {
    //       htmlEl.style.fontSize = '10px'; // Smaller for contact info
    //       htmlEl.style.textAlign = 'center';
    //       htmlEl.style.marginBottom = '2px';
    //       htmlEl.style.color = '#333333';
    //     }
        
    //     // Section Headers - Thermal receipt style
    //     else if (textContent.includes('Order #') || textContent.includes('Date:') || textContent.includes('Time:') || textContent.includes('Cashier:')) {
    //       htmlEl.style.fontSize = '11px';
    //       htmlEl.style.fontWeight = '600';
    //       htmlEl.style.marginTop = '8px';
    //       htmlEl.style.marginBottom = '4px';
    //       htmlEl.style.paddingTop = '4px';
    //       htmlEl.style.borderTop = '1px solid #000000'; // Dashed line for thermal
    //     }
        
    //     // Order Items - Compact thermal format
    //     else if (textContent.includes('x ') || /^\d+\s*x/.test(textContent)) {
    //       htmlEl.style.fontSize = '11px';
    //       htmlEl.style.marginBottom = '2px';
    //       htmlEl.style.paddingLeft = '4px';
    //       htmlEl.style.display = 'flex';
    //       htmlEl.style.justifyContent = 'space-between';
    //       htmlEl.style.width = '100%';
    //     }
        
    //     // Totals Section - Thermal receipt totals
    //     else if (textContent.includes('Subtotal') || textContent.includes('VAT') || textContent.includes('Total') || textContent.includes('المجموع')) {
    //       htmlEl.style.fontSize = '11px';
    //       htmlEl.style.fontWeight = '600';
    //       htmlEl.style.marginTop = '6px';
    //       htmlEl.style.marginBottom = '2px';
    //       htmlEl.style.paddingTop = '4px';
    //       htmlEl.style.paddingBottom = '2px';
    //       htmlEl.style.display = 'flex';
    //       htmlEl.style.justifyContent = 'space-between';
    //       htmlEl.style.width = '100%';
          
    //       // Final Total - Extra emphasis for thermal
    //       if (textContent.includes('Total') && textContent.includes('SAR')) {
    //         htmlEl.style.fontSize = '12px';
    //         htmlEl.style.fontWeight = '700';
    //         htmlEl.style.borderTop = '1px solid #000000';
    //         htmlEl.style.borderBottom = '1px solid #000000';
    //         htmlEl.style.paddingTop = '6px';
    //         htmlEl.style.paddingBottom = '4px';
    //         htmlEl.style.marginTop = '8px';
    //       }
    //     }
        
    //     // Footer Information - Thermal style
    //     else if (textContent.includes('Thank you') || textContent.includes('شكراً') || textContent.includes('Visit us again')) {
    //       htmlEl.style.fontSize = '10px';
    //       htmlEl.style.textAlign = 'center';
    //       htmlEl.style.marginTop = '8px';
    //       htmlEl.style.marginBottom = '4px';
    //       htmlEl.style.fontStyle = 'italic';
    //       htmlEl.style.color = '#555555';
    //     }
        
    //   } else if (htmlEl.tagName === 'SPAN') {
    //     htmlEl.style.display = 'inline';
    //     htmlEl.style.fontSize = '11px'; // Consistent thermal size
        
    //     // Price formatting for thermal receipt
    //     if (textContent.includes('SAR') || textContent.includes('ر.س') || /\d+\.\d{2}/.test(textContent)) {
    //       htmlEl.style.fontWeight = '600';
    //       htmlEl.style.fontSize = '11px';
    //     }
        
    //   } else if (['H1', 'H2', 'H3', 'H4', 'H5', 'H6'].includes(htmlEl.tagName)) {
    //     htmlEl.style.fontSize = '14px'; // Thermal header size
    //     htmlEl.style.fontWeight = '700';
    //     htmlEl.style.textAlign = 'center';
    //     htmlEl.style.margin = '8px 0 4px 0';
    //     htmlEl.style.letterSpacing = '0.5px';
        
    //   } else if (htmlEl.tagName === 'IMG') {
    //     htmlEl.style.display = 'block';
    //     htmlEl.style.maxWidth = '60px'; // Smaller for thermal receipt
    //     htmlEl.style.height = 'auto';
    //     htmlEl.style.margin = '8px auto';
    //     htmlEl.style.border = 'none';
        
    //   } else if (htmlEl.tagName === 'P') {
    //     htmlEl.style.margin = '4px 0';
    //     htmlEl.style.fontSize = '11px';
    //     htmlEl.style.lineHeight = '1.2';
        
    //   } else if (htmlEl.tagName === 'TABLE') {
    //     htmlEl.style.width = '100%';
    //     htmlEl.style.borderCollapse = 'collapse';
    //     htmlEl.style.margin = '6px 0';
    //     htmlEl.style.fontSize = '10px'; // Smaller table text
        
    //   } else if (htmlEl.tagName === 'TD' || htmlEl.tagName === 'TH') {
    //     htmlEl.style.padding = '2px 1px'; // Compact table cells
    //     htmlEl.style.borderBottom = '1px solid #f0f0f0';
    //     htmlEl.style.fontSize = '10px';
    //     htmlEl.style.verticalAlign = 'top';
    //     htmlEl.style.wordWrap = 'break-word';
    //   }
      
    //   // Auto-detect and apply text alignment
    //   if (textContent && (
    //     htmlEl.getAttribute('class')?.includes('center') ||
    //     htmlEl.getAttribute('class')?.includes('text-center') ||
    //     textContent.includes('★') ||
    //     textContent.includes('LAZAZA') ||
    //     textContent.includes('مؤسسة') ||
    //     textContent.includes('Receipt') ||
    //     textContent.includes('Invoice') ||
    //     textContent.includes('Thank you') ||
    //     textContent.includes('شكراً')
    //   )) {
    //     htmlEl.style.textAlign = 'center';
    //   }
      
    //   // Create flexible layout for items with prices
    //   if (textContent.includes('SAR') && textContent.includes('x ')) {
    //     htmlEl.style.display = 'flex';
    //     htmlEl.style.justifyContent = 'space-between';
    //     htmlEl.style.alignItems = 'flex-start';
    //   }
    // });

    // Add to document to get proper dimensions
    document.body.appendChild(clonedElement);

    // Wait for layout
    await new Promise(resolve => setTimeout(resolve, 100));

    console.log("Cloned element dimensions:", {
      offsetWidth: clonedElement.offsetWidth,
      offsetHeight: clonedElement.offsetHeight,
    });

    // Create thermal receipt optimized canvas
    const canvas = await html2canvas(clonedElement, {
      background: "#ffffff",
      width: 302, // Exact 80mm width in pixels
      height: Math.max(clonedElement.offsetHeight, 400),
      scale: 2, // Use 1:1 scale for precise thermal sizing
      useCORS: true,
      allowTaint: true,
      letterRendering: true,
      onclone: (clonedDoc: Document) => {
        // Remove all external stylesheets that might interfere
        const stylesheets = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
        stylesheets.forEach(sheet => sheet.remove());
        
        // Ensure thermal receipt layout
        clonedDoc.body.style.margin = '0';
        clonedDoc.body.style.padding = '0';
        clonedDoc.body.style.width = '302px';
        clonedDoc.body.style.maxWidth = '302px';
        clonedDoc.body.style.fontSize = '11px';
        clonedDoc.body.style.fontFamily = '"Courier New", monospace';
        
        // Clean up any problematic CSS
        const elementsWithStyle = clonedDoc.querySelectorAll('[style]');
        elementsWithStyle.forEach((el: Element) => {
          const htmlEl = el as HTMLElement;
          const style = htmlEl.getAttribute('style');
          if (style && (style.includes('oklch') || style.includes('color-mix') || style.includes('lab(') || style.includes('lch('))) {
            htmlEl.style.cssText = '';
            htmlEl.style.color = '#000000';
            htmlEl.style.backgroundColor = 'transparent';
            htmlEl.style.fontFamily = '"Courier New", monospace';
            htmlEl.style.fontSize = '11px';
          }
        });
      }
    } as Parameters<typeof html2canvas>[1]);

    // Remove the cloned element
    document.body.removeChild(clonedElement);

    console.log("Canvas created:", {
      width: canvas.width,
      height: canvas.height,
    });

    if (canvas.width === 0 || canvas.height === 0) {
      throw new Error("Canvas has zero dimensions");
    }

    // Calculate PDF dimensions
    const pdfHeight = (canvas.height * widthMM) / canvas.width;

    // Create PDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [widthMM, pdfHeight],
    });

    // Add the canvas as image
    const imgData = canvas.toDataURL("image/png");
    pdf.addImage(imgData, "PNG", 0, 0, widthMM, pdfHeight);

    // Download or save
    if (silent) {
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } else {
      pdf.save(filename);
    }
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw error;
  }
}
