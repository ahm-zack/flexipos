/**
 * Restaurant Configuration for Receipts and ZATCA Compliance
 * Update this file with your restaurant's actual information
 */

export interface RestaurantConfig {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  nameAr: string;
  addressAr: string;
  vatNumber: string;
  crNumber: string;
  vatRate: number;
  logo: string;
  receiptWidth: string;
  zatcaCompliant: boolean;
  thankYouMessage: {
    en: string;
    ar: string;
  };
  businessHours: {
    en: string;
    ar: string;
  };
}

export const RESTAURANT_CONFIG: RestaurantConfig = {
  // Restaurant Information (English)
  name: 'Business Name',
  address: '',
  phone: '',
  email: '',
  website: '',

  // Restaurant Information (Arabic)
  nameAr: '',
  addressAr: '',

  // Legal Information (Optional until configured)
  vatNumber: '',
  crNumber: '',
  
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
};

// Validation function to check if all required fields are configured
export function validateRestaurantConfig(): { valid: boolean; missingFields: string[] } {
  const missingFields: string[] = [];

  if (!RESTAURANT_CONFIG.name.trim()) {
    missingFields.push('name');
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
