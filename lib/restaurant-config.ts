/**
 * Restaurant Configuration for Receipts and ZATCA Compliance
 * Update this file with your restaurant's actual information
 */

export const RESTAURANT_CONFIG = {
  // Restaurant Information (English)
  name: 'Lazaza',
  address: 'Al Sahaba Road, Riyadh, Saudi Arabia',
  phone: '+966 11 456 7890',
  email: 'info@goldenplate.com',
  website: 'www.goldenplate.com',

  // Restaurant Information (Arabic)
  nameAr: 'مؤسسة لزازة للتجارة',
  addressAr: 'طريق الصحابة، الرياض، المملكة العربية السعودية',

  // Legal Information (Required for ZATCA)
  vatNumber: '123456789012345',     // 15-digit VAT registration number
  crNumber: '7036152168',           // Commercial Registration number
  
  // Tax Settings
  vatRate: 0.15,                    // 15% VAT rate in Saudi Arabia
  
  // Receipt Styling
  logo: '/logo.png',                // Path to your restaurant logo (optional)
  receiptWidth: '58mm',             // Standard thermal printer width
  
  // ZATCA Settings
  zatcaCompliant: true,             // Enable ZATCA QR codes
  
  // Additional Footer Messages
  thankYouMessage: {
    en: 'Thank you for your visit!',
    ar: 'شكراً لزيارتكم!'
  },
  
  // Business Hours (for receipt footer)
  businessHours: {
    en: 'Open Daily: 10:00 AM - 12:00 AM',
    ar: 'مفتوح يومياً: ١٠:٠٠ ص - ١٢:٠٠ م'
  }
} as const;

// Validation function to check if all required fields are configured
export function validateRestaurantConfig(): { valid: boolean; missingFields: string[] } {
  const requiredFields = [
    'name',
    'nameAr', 
    'address',
    'addressAr',
    'phone',
    'vatNumber',
    'crNumber'
  ];
  
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    const value = RESTAURANT_CONFIG[field as keyof typeof RESTAURANT_CONFIG];
    if (!value || (typeof value === 'string' && value.trim().length === 0)) {
      missingFields.push(field);
    }
  }
  
  // Check VAT number format (15 digits)
  if (RESTAURANT_CONFIG.vatNumber && !/^\d{15}$/.test(RESTAURANT_CONFIG.vatNumber)) {
    missingFields.push('vatNumber (must be 15 digits)');
  }
  
  return {
    valid: missingFields.length === 0,
    missingFields
  };
}

export type RestaurantConfig = typeof RESTAURANT_CONFIG;
