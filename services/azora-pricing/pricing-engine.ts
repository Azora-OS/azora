/**
 * AZORA PRICING ENGINE
 * 
 * Geo-aware, PPP-adjusted pricing system with Learn-to-Earn integration
 */

export interface PricingTier {
  tier: 'TIER_1' | 'TIER_2' | 'TIER_3' | 'TIER_4';
  countries: string[];
  student: {
    monthly: number;
    yearly: number;
    premium?: number;
  };
  professional: {
    monthly: number;
    yearly: number;
  };
  enterprise: {
    monthly: number;
    minSeats: number;
  };
}

export interface UserLocation {
  country: string;
  countryCode: string;
  currency: string;
  continent: string;
  city: string;
  ip: string;
}

export interface CurrencyInfo {
  code: string;
  symbol: string;
  rate: number; // Conversion rate from USD
}

// ============================================================================
// PRICING TIERS CONFIGURATION
// ============================================================================

export const PRICING_TIERS: Record<string, PricingTier> = {
  TIER_1: {
    tier: 'TIER_1',
    countries: [
      'US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP', 'SG', 'CH', 'NO', 
      'SE', 'DK', 'FI', 'NL', 'BE', 'AT', 'IE', 'NZ', 'LU', 'IS'
    ],
    student: {
      monthly: 49,
      yearly: 490 // 2 months free
    },
    professional: {
      monthly: 99,
      yearly: 990
    },
    enterprise: {
      monthly: 299,
      minSeats: 10
    }
  },
  
  TIER_2: {
    tier: 'TIER_2',
    countries: [
      'BR', 'MX', 'CN', 'IN', 'TR', 'TH', 'PL', 'MY', 'ZA', 'AR',
      'CL', 'CO', 'PE', 'PH', 'ID', 'VN', 'EG', 'SA', 'AE', 'KR'
    ],
    student: {
      monthly: 19,
      yearly: 190
    },
    professional: {
      monthly: 49,
      yearly: 490
    },
    enterprise: {
      monthly: 149,
      minSeats: 10
    }
  },
  
  TIER_3: {
    tier: 'TIER_3',
    countries: [
      'NG', 'KE', 'GH', 'ET', 'TZ', 'UG', 'ZW', 'MZ', 'RW', 'MW',
      'ZM', 'SN', 'CI', 'CM', 'AO', 'BJ', 'BW', 'BF', 'GA', 'GM',
      'GN', 'GW', 'LR', 'MG', 'ML', 'MR', 'NA', 'NE', 'SL', 'TG'
    ],
    student: {
      monthly: 0, // FREE
      yearly: 0,
      premium: 5 // Optional premium features
    },
    professional: {
      monthly: 19,
      yearly: 190
    },
    enterprise: {
      monthly: 49,
      minSeats: 10
    }
  },
  
  TIER_4: {
    tier: 'TIER_4',
    countries: [
      'SO', 'SS', 'BI', 'CD', 'CF', 'TD', 'ER', 'DJ', 'KM', 'YE'
    ],
    student: {
      monthly: 0, // 100% FREE forever
      yearly: 0
    },
    professional: {
      monthly: 9,
      yearly: 90
    },
    enterprise: {
      monthly: 29,
      minSeats: 5
    }
  }
};

// ============================================================================
// GEO-DETECTION
// ============================================================================

/**
 * Detect user's location from IP address
 */
export async function detectUserLocation(): Promise<UserLocation> {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    
    return {
      country: data.country_name,
      countryCode: data.country_code,
      currency: data.currency,
      continent: data.continent_code,
      city: data.city,
      ip: data.ip
    };
  } catch (error) {
    console.error('Failed to detect location:', error);
    // Default to Tier 2 if detection fails
    return {
      country: 'Unknown',
      countryCode: 'US',
      currency: 'USD',
      continent: 'NA',
      city: 'Unknown',
      ip: 'Unknown'
    };
  }
}

/**
 * Get browser locale as fallback
 */
export function getBrowserLocale(): string {
  return navigator.language || 'en-US';
}

/**
 * Get user timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// ============================================================================
// PRICING ASSIGNMENT
// ============================================================================

/**
 * Get pricing tier for a specific country
 */
export function getPricingTierForCountry(countryCode: string): PricingTier {
  for (const tier of Object.values(PRICING_TIERS)) {
    if (tier.countries.includes(countryCode)) {
      return tier;
    }
  }
  
  // Default to Tier 2 if country not found
  return PRICING_TIERS.TIER_2;
}

/**
 * Get complete pricing for user
 */
export async function getPricingForUser(): Promise<{
  location: UserLocation;
  tier: PricingTier;
  currency: CurrencyInfo;
  localizedPricing: any;
}> {
  const location = await detectUserLocation();
  const tier = getPricingTierForCountry(location.countryCode);
  const currency = await getCurrencyInfo(location.currency);
  
  // Convert USD pricing to local currency
  const localizedPricing = {
    student: {
      monthly: Math.round(tier.student.monthly * currency.rate),
      yearly: Math.round(tier.student.yearly * currency.rate),
      premium: tier.student.premium ? Math.round(tier.student.premium * currency.rate) : undefined
    },
    professional: {
      monthly: Math.round(tier.professional.monthly * currency.rate),
      yearly: Math.round(tier.professional.yearly * currency.rate)
    },
    enterprise: {
      monthly: Math.round(tier.enterprise.monthly * currency.rate),
      minSeats: tier.enterprise.minSeats
    }
  };
  
  return {
    location,
    tier,
    currency,
    localizedPricing
  };
}

// ============================================================================
// CURRENCY CONVERSION
// ============================================================================

const CURRENCY_SYMBOLS: Record<string, CurrencyInfo> = {
  'USD': { code: 'USD', symbol: '$', rate: 1 },
  'ZAR': { code: 'ZAR', symbol: 'R', rate: 18.5 },
  'KES': { code: 'KES', symbol: 'KSh', rate: 130 },
  'NGN': { code: 'NGN', symbol: '₦', rate: 750 },
  'GBP': { code: 'GBP', symbol: '£', rate: 0.79 },
  'EUR': { code: 'EUR', symbol: '€', rate: 0.92 },
  'INR': { code: 'INR', symbol: '₹', rate: 83 },
  'CNY': { code: 'CNY', symbol: '¥', rate: 7.2 },
  'BRL': { code: 'BRL', symbol: 'R$', rate: 5.0 },
  'MXN': { code: 'MXN', symbol: '$', rate: 17 },
  'JPY': { code: 'JPY', symbol: '¥', rate: 150 },
  'CAD': { code: 'CAD', symbol: 'C$', rate: 1.35 },
  'AUD': { code: 'AUD', symbol: 'A$', rate: 1.52 }
};

/**
 * Get currency information with live exchange rates
 */
export async function getCurrencyInfo(currencyCode: string): Promise<CurrencyInfo> {
  // Try to get live rates
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    
    if (data.rates[currencyCode]) {
      return {
        code: currencyCode,
        symbol: CURRENCY_SYMBOLS[currencyCode]?.symbol || currencyCode,
        rate: data.rates[currencyCode]
      };
    }
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error);
  }
  
  // Fallback to static rates
  return CURRENCY_SYMBOLS[currencyCode] || CURRENCY_SYMBOLS.USD;
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: CurrencyInfo): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  // Symbol before or after based on currency
  const symbolBefore = ['USD', 'GBP', 'EUR', 'CAD', 'AUD'].includes(currency.code);
  
  return symbolBefore 
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`;
}

// ============================================================================
// LEARN-TO-EARN INTEGRATION
// ============================================================================

export const LEARN_TO_EARN_RATES = {
  lessonCompleted: 0.10,      // $0.10 per lesson (5-10 min)
  assignmentCompleted: 1.00,   // $1 per assignment (30-60 min)
  courseCompleted: 5.00,       // $5 per course
  certificationEarned: 10.00   // $10 per certification
};

/**
 * Calculate Learn-to-Earn earnings for user
 */
export function calculateLearnToEarn(activities: {
  lessonsCompleted: number;
  assignmentsCompleted: number;
  coursesCompleted: number;
  certificationsEarned: number;
}): {
  totalEarnedUSD: number;
  breakdown: any;
} {
  const breakdown = {
    lessons: activities.lessonsCompleted * LEARN_TO_EARN_RATES.lessonCompleted,
    assignments: activities.assignmentsCompleted * LEARN_TO_EARN_RATES.assignmentCompleted,
    courses: activities.coursesCompleted * LEARN_TO_EARN_RATES.courseCompleted,
    certifications: activities.certificationsEarned * LEARN_TO_EARN_RATES.certificationEarned
  };
  
  const totalEarnedUSD = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  
  return {
    totalEarnedUSD,
    breakdown
  };
}

/**
 * Check if user can cover tuition with Learn-to-Earn
 */
export function canCoverTuition(
  earnedUSD: number,
  monthlyTuition: number
): {
  canCover: boolean;
  coveragePercentage: number;
  remaining: number;
} {
  const coveragePercentage = monthlyTuition > 0 
    ? Math.min((earnedUSD / monthlyTuition) * 100, 100)
    : 100;
  
  return {
    canCover: earnedUSD >= monthlyTuition,
    coveragePercentage,
    remaining: Math.max(0, monthlyTuition - earnedUSD)
  };
}

// ============================================================================
// PAYMENT METHODS BY REGION
// ============================================================================

export const PAYMENT_METHODS: Record<string, string[]> = {
  // Africa
  'NG': ['Bank Transfer', 'Flutterwave', 'Paystack', 'Card', 'Crypto'],
  'KE': ['M-Pesa', 'Airtel Money', 'Card', 'Crypto'],
  'TZ': ['M-Pesa', 'Airtel Money', 'Tigo Pesa', 'Card'],
  'UG': ['MTN Mobile Money', 'Airtel Money', 'Card'],
  'GH': ['MTN Mobile Money', 'Vodafone Cash', 'AirtelTigo Money', 'Card'],
  'ZA': ['EFT', 'Card', 'SnapScan', 'Zapper', 'Crypto'],
  
  // Asia
  'IN': ['UPI', 'Paytm', 'PhonePe', 'Net Banking', 'Card'],
  'CN': ['WeChat Pay', 'Alipay', 'UnionPay'],
  'PH': ['GCash', 'PayMaya', 'Card'],
  'TH': ['PromptPay', 'TrueMoney', 'Card'],
  'ID': ['GoPay', 'OVO', 'Dana', 'Card'],
  
  // Latin America
  'BR': ['PIX', 'Boleto', 'Card'],
  'MX': ['OXXO', 'SPEI', 'Card'],
  'AR': ['Mercado Pago', 'Card'],
  
  // Default (Global)
  'DEFAULT': ['Card', 'PayPal', 'Apple Pay', 'Google Pay', 'Crypto']
};

/**
 * Get available payment methods for country
 */
export function getPaymentMethods(countryCode: string): string[] {
  return PAYMENT_METHODS[countryCode] || PAYMENT_METHODS.DEFAULT;
}

// ============================================================================
// WEBSITE LOCALIZATION
// ============================================================================

/**
 * Get localized hero text based on pricing tier
 */
export function getHeroText(tier: PricingTier, currency: CurrencyInfo): {
  headline: string;
  subheadline: string;
} {
  switch (tier.tier) {
    case 'TIER_1':
      return {
        headline: `World-Class Education, Starting at ${formatPrice(tier.student.monthly, currency)}/month`,
        subheadline: 'Join students from top universities worldwide. Get certified, get hired, change your life.'
      };
      
    case 'TIER_2':
      return {
        headline: `Affordable Excellence, Just ${formatPrice(tier.student.monthly, currency)}/month`,
        subheadline: 'Quality education at a price that makes sense for you. Learn from the best, pay what\'s fair.'
      };
      
    case 'TIER_3':
      return {
        headline: 'FREE Education for African Students + Earn While You Learn',
        subheadline: `Learn for FREE and earn ${formatPrice(10, currency)}-${formatPrice(20, currency)}/month through our Learn-to-Earn program. No hidden fees, ever.`
      };
      
    case 'TIER_4':
      return {
        headline: '100% FREE Forever - Education is a Human Right',
        subheadline: 'Access world-class education at zero cost. Forever. Plus earn up to $30/month while learning.'
      };
  }
}

/**
 * Get comparison text for pricing page
 */
export function getComparisonText(countryCode: string, tier: PricingTier, currency: CurrencyInfo): string {
  const yearlyPrice = formatPrice(tier.student.yearly, currency);
  
  const comparisons: Record<string, string> = {
    'US': `Traditional university: $30,000+/year. Azora: ${yearlyPrice}/year`,
    'GB': `UK university: £9,250/year. Azora: ${yearlyPrice}/year`,
    'IN': `IIT/NIT: ₹2,00,000/year. Azora: ${yearlyPrice}/year`,
    'ZA': `University: R60,000/year. Azora: ${yearlyPrice}/year`,
    'NG': `University: ₦500,000/year. Azora: FREE`,
    'KE': `University: KSh 200,000/year. Azora: FREE`,
  };
  
  return comparisons[countryCode] || `Traditional education: Thousands per year. Azora: ${yearlyPrice}/year`;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  getPricingForUser,
  getPricingTierForCountry,
  detectUserLocation,
  getCurrencyInfo,
  formatPrice,
  calculateLearnToEarn,
  canCoverTuition,
  getPaymentMethods,
  getHeroText,
  getComparisonText,
  PRICING_TIERS,
  LEARN_TO_EARN_RATES
};
