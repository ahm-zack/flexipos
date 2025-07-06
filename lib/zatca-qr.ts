/**
 * ZATCA (Zakat, Tax and Customs Authority) QR Code Generator
 * Generates QR codes compliant with Saudi Arabia's tax regulations
 */

import QRCode from 'qrcode';
import { createHash } from 'crypto';

// ZATCA TLV (Tag-Length-Value) Tags
const ZATCA_TAGS = {
  SELLER_NAME: 1,           // Seller name
  VAT_REGISTRATION: 2,      // VAT registration number  
  TIMESTAMP: 3,             // Invoice timestamp
  INVOICE_TOTAL: 4,         // Invoice total with VAT
  VAT_TOTAL: 5,             // VAT amount
  INVOICE_HASH: 6,          // Invoice hash (optional)
  DIGITAL_SIGNATURE: 7,     // Digital signature (optional)
  PUBLIC_KEY: 8,            // Public key (optional)
  SIGNATURE_ALGORITHM: 9    // Signature algorithm (optional)
} as const;

interface ZATCAInvoiceData {
  sellerName: string;                    // Business/restaurant name
  vatRegistrationNumber: string;         // VAT registration number
  timestamp: Date;                       // Invoice date and time
  invoiceTotal: number;                  // Total amount including VAT
  vatTotal: number;                      // VAT amount
  invoiceHash?: string;                  // Optional: Invoice hash
  digitalSignature?: string;             // Optional: Digital signature
  publicKey?: string;                    // Optional: Public key
  signatureAlgorithm?: string;           // Optional: Signature algorithm
}

/**
 * Converts a number to TLV (Tag-Length-Value) format
 */
function numberToTLV(tag: number, value: number): Uint8Array {
  const valueStr = value.toFixed(2);
  const valueBytes = new TextEncoder().encode(valueStr);
  const result = new Uint8Array(2 + valueBytes.length);
  
  result[0] = tag;
  result[1] = valueBytes.length;
  result.set(valueBytes, 2);
  
  return result;
}

/**
 * Converts a string to TLV (Tag-Length-Value) format
 */
function stringToTLV(tag: number, value: string): Uint8Array {
  const valueBytes = new TextEncoder().encode(value);
  const result = new Uint8Array(2 + valueBytes.length);
  
  result[0] = tag;
  result[1] = valueBytes.length;
  result.set(valueBytes, 2);
  
  return result;
}

/**
 * Converts date to ISO string format required by ZATCA
 */
function formatZATCATimestamp(date: Date): string {
  return date.toISOString();
}

/**
 * Generates a simple hash for the invoice (when full cryptographic hash is not available)
 */
function generateSimpleInvoiceHash(invoiceData: ZATCAInvoiceData): string {
  const hashInput = `${invoiceData.sellerName}${invoiceData.vatRegistrationNumber}${invoiceData.timestamp.toISOString()}${invoiceData.invoiceTotal}${invoiceData.vatTotal}`;
  return createHash('sha256').update(hashInput).digest('hex');
}

/**
 * Generates ZATCA-compliant QR code data
 */
export function generateZATCAQRData(invoiceData: ZATCAInvoiceData): Uint8Array {
  const tlvParts: Uint8Array[] = [];

  // Required fields
  tlvParts.push(stringToTLV(ZATCA_TAGS.SELLER_NAME, invoiceData.sellerName));
  tlvParts.push(stringToTLV(ZATCA_TAGS.VAT_REGISTRATION, invoiceData.vatRegistrationNumber));
  tlvParts.push(stringToTLV(ZATCA_TAGS.TIMESTAMP, formatZATCATimestamp(invoiceData.timestamp)));
  tlvParts.push(numberToTLV(ZATCA_TAGS.INVOICE_TOTAL, invoiceData.invoiceTotal));
  tlvParts.push(numberToTLV(ZATCA_TAGS.VAT_TOTAL, invoiceData.vatTotal));

  // Optional fields
  if (invoiceData.invoiceHash) {
    tlvParts.push(stringToTLV(ZATCA_TAGS.INVOICE_HASH, invoiceData.invoiceHash));
  } else {
    // Generate a simple hash if none provided
    const hash = generateSimpleInvoiceHash(invoiceData);
    tlvParts.push(stringToTLV(ZATCA_TAGS.INVOICE_HASH, hash));
  }

  if (invoiceData.digitalSignature) {
    tlvParts.push(stringToTLV(ZATCA_TAGS.DIGITAL_SIGNATURE, invoiceData.digitalSignature));
  }

  if (invoiceData.publicKey) {
    tlvParts.push(stringToTLV(ZATCA_TAGS.PUBLIC_KEY, invoiceData.publicKey));
  }

  if (invoiceData.signatureAlgorithm) {
    tlvParts.push(stringToTLV(ZATCA_TAGS.SIGNATURE_ALGORITHM, invoiceData.signatureAlgorithm));
  }

  // Calculate total length
  const totalLength = tlvParts.reduce((sum, part) => sum + part.length, 0);
  
  // Combine all TLV parts
  const result = new Uint8Array(totalLength);
  let offset = 0;
  
  for (const part of tlvParts) {
    result.set(part, offset);
    offset += part.length;
  }

  return result;
}

/**
 * Generates QR code as base64 data URL for ZATCA compliance
 */
export async function generateZATCAQRCode(
  invoiceData: ZATCAInvoiceData,
  options: {
    size?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  } = {}
): Promise<string> {
  try {
    const qrData = generateZATCAQRData(invoiceData);
    const base64Data = Buffer.from(qrData).toString('base64');
    
    const qrOptions = {
      width: options.size || 200,
      margin: options.margin || 2,
      errorCorrectionLevel: options.errorCorrectionLevel || 'M' as const,
      type: 'image/png' as const,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    };

    return await QRCode.toDataURL(base64Data, qrOptions);
  } catch (error) {
    console.error('Error generating ZATCA QR code:', error);
    throw new Error('Failed to generate ZATCA QR code');
  }
}

/**
 * Validates ZATCA invoice data
 */
export function validateZATCAData(invoiceData: ZATCAInvoiceData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!invoiceData.sellerName || invoiceData.sellerName.trim().length === 0) {
    errors.push('Seller name is required');
  }

  if (!invoiceData.vatRegistrationNumber || invoiceData.vatRegistrationNumber.trim().length === 0) {
    errors.push('VAT registration number is required');
  }

  // VAT registration number should be 15 digits for Saudi Arabia
  if (invoiceData.vatRegistrationNumber && !/^\d{15}$/.test(invoiceData.vatRegistrationNumber)) {
    errors.push('VAT registration number must be 15 digits');
  }

  if (!invoiceData.timestamp || isNaN(invoiceData.timestamp.getTime())) {
    errors.push('Valid timestamp is required');
  }

  if (invoiceData.invoiceTotal < 0) {
    errors.push('Invoice total must be non-negative');
  }

  if (invoiceData.vatTotal < 0) {
    errors.push('VAT total must be non-negative');
  }

  if (invoiceData.vatTotal > invoiceData.invoiceTotal) {
    errors.push('VAT total cannot exceed invoice total');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Default configuration for restaurants
export const DEFAULT_RESTAURANT_CONFIG = {
  sellerName: 'مؤسسة لزازة للتجارة', // Update this with your restaurant name
  vatRegistrationNumber: '000000000000000', // Update this with your VAT registration number
  vatRate: 0.15, // 15% VAT rate in Saudi Arabia
} as const;

export type { ZATCAInvoiceData };
