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
    incomeBasedOptions?: {
      noIncome: number;
      lowIncome: number;
      standard: number;
    };
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
      monthly: 79,
      yearly: 790,
      incomeBasedOptions: {
        noIncome: 29,
        lowIncome: 49,
        standard: 79
      }
    },
    professional: {
      monthly: 149,
      yearly: 1490
    },
    enterprise: {
      monthly: 499,
      minSeats: 10
    }
  },
  
  TIER_2: {
    tier: 'TIER_2',
    countries: [
      'BR', 'MX', 'CN', 'IN', 'TR', 'TH', 'PL', 'MY', 'AR',
      'CL', 'CO', 'PE', 'PH', 'ID', 'VN', 'EG', 'SA', 'AE', 'KR'
    ],
    student: {
      monthly: 29,
      yearly: 290,
      incomeBasedOptions: {
        noIncome: 9,
        lowIncome: 19,
        standard: 29
      }
    },
    professional: {
      monthly: 79,
      yearly: 790
    },
    enterprise: {
      monthly: 249,
      minSeats: 10
    }
  },
  
  TIER_2_AFRICA: {
    tier: 'TIER_2',
    countries: ['ZA'],
    student: {
      monthly: 13,
      yearly: 130,
      incomeBasedOptions: {
        noIncome: 5,
        lowIncome: 8,
        standard: 13
      }
    },
    professional: {
      monthly: 35,
      yearly: 350
    },
    enterprise: {
      monthly: 99,
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
      monthly: 5,
      yearly: 50,
      incomeBasedOptions: {
        noIncome: 2,
        lowIncome: 3,
        standard: 5
      }
    },
    professional: {
      monthly: 19,
      yearly: 190
    },
    enterprise: {
      monthly: 59,
      minSeats: 10
    }
  },
  
  TIER_4: {
    tier: 'TIER_4',
    countries: [
      'SO', 'SS', 'BI', 'CD', 'CF', 'TD', 'ER', 'DJ', 'KM', 'YE'
    ],
    student: {
      monthly: 3,
      yearly: 30,
      incomeBasedOptions: {
        noIncome: 1,
        lowIncome: 2,
        standard: 3
      }
    },
    professional: {
      monthly: 15,
      yearly: 150
    },
    enterprise: {
      monthly: 49,
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
export async function getPricingForUser(incomeLevel: 'NO_INCOME' | 'LOW_INCOME' | 'STANDARD' = 'STANDARD'): Promise<{
  location: UserLocation;
  tier: PricingTier;
  currency: CurrencyInfo;
  localizedPricing: any;
  incomeBasedOptions?: any;
}> {
  const location = await detectUserLocation();
  const tier = getPricingTierForCountry(location.countryCode);
  const currency = await getCurrencyInfo(location.currency);
  
  const getStudentPrice = () => {
    if (tier.student.incomeBasedOptions) {
      const prices = {
        NO_INCOME: tier.student.incomeBasedOptions!.noIncome,
        LOW_INCOME: tier.student.incomeBasedOptions!.lowIncome,
        STANDARD: tier.student.incomeBasedOptions!.standard
      };
      return prices[incomeLevel];
    }
    return tier.student.monthly;
  };
  
  const localizedPricing = {
    student: {
      monthly: Math.round(getStudentPrice() * currency.rate),
      yearly: Math.round(getStudentPrice() * currency.rate * 10),
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
  
  const incomeBasedOptions = tier.student.incomeBasedOptions ? {
    noIncome: Math.round(tier.student.incomeBasedOptions.noIncome * currency.rate),
    lowIncome: Math.round(tier.student.incomeBasedOptions.lowIncome * currency.rate),
    standard: Math.round(tier.student.incomeBasedOptions.standard * currency.rate)
  } : undefined;
  
  return {
    location,
    tier,
    currency,
    localizedPricing,
    incomeBasedOptions
  };
}

// ============================================================================
// CURRENCY CONVERSION
// ============================================================================

const CURRENCY_SYMBOLS: Record<string, string> = {
  'USD': '$', 'ZAR': 'R', 'KES': 'KSh', 'NGN': '₦', 'GBP': '£', 'EUR': '€',
  'INR': '₹', 'CNY': '¥', 'BRL': 'R$', 'MXN': '$', 'JPY': '¥', 'CAD': 'C$',
  'AUD': 'A$', 'TRY': '₺', 'THB': '฿', 'PLN': 'zł', 'MYR': 'RM', 'ARS': '$',
  'CLP': '$', 'COP': '$', 'PEN': 'S/', 'PHP': '₱', 'IDR': 'Rp', 'VND': '₫',
  'EGP': 'E£', 'SAR': 'SR', 'AED': 'د.إ', 'KRW': '₩', 'GHS': '₵', 'ETB': 'Br',
  'TZS': 'TSh', 'UGX': 'USh', 'ZMW': 'ZK', 'RWF': 'FRw', 'MWK': 'MK'
};

const FALLBACK_RATES: Record<string, number> = {
  'USD': 1, 'ZAR': 19.0, 'KES': 130, 'NGN': 750, 'GBP': 0.79, 'EUR': 0.92,
  'INR': 83, 'CNY': 7.2, 'BRL': 5.0, 'MXN': 17, 'JPY': 150, 'CAD': 1.35, 'AUD': 1.52
};

/**
 * Get currency information with live exchange rates
 */
export async function getCurrencyInfo(currencyCode: string): Promise<CurrencyInfo> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: AbortSignal.timeout(5000)
    });
    const data = await response.json();
    
    if (data.rates[currencyCode]) {
      return {
        code: currencyCode,
        symbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode,
        rate: data.rates[currencyCode]
      };
    }
  } catch (error) {
    console.error('Failed to fetch live exchange rates, using fallback:', error);
  }
  
  return {
    code: currencyCode,
    symbol: CURRENCY_SYMBOLS[currencyCode] || currencyCode,
    rate: FALLBACK_RATES[currencyCode] || 1
  };
}

/**
 * Format price with currency symbol
 */
export function formatPrice(amount: number, currency: CurrencyInfo): string {
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
  
  const symbolBefore = ['USD', 'GBP', 'EUR', 'CAD', 'AUD', 'ZAR', 'MXN', 'ARS', 'CLP', 'COP'].includes(currency.code);
  
  return symbolBefore 
    ? `${currency.symbol}${formattedAmount}`
    : `${formattedAmount} ${currency.symbol}`;
}

// ============================================================================
// LEARN-TO-EARN INTEGRATION
// ============================================================================

export interface LearnToEarnDiscount {
  coursesCompleted: number;
  discountPercentage: number;
  maxDiscount: number;
}

/**
 * Calculate Learn-to-Earn discount based on completed courses
 */
export function calculateLearnToEarnDiscount(coursesCompleted: number): LearnToEarnDiscount {
  const discountPerCourse = 5; // 5% per course
  const maxDiscount = 50; // Maximum 50% discount
  
  const discountPercentage = Math.min(coursesCompleted * discountPerCourse, maxDiscount);
  
  return {
    coursesCompleted,
    discountPercentage,
    maxDiscount
  };
}

/**
 * Apply Learn-to-Earn discount to pricing
 */
export function applyLearnToEarnDiscount(price: number, discount: LearnToEarnDiscount): number {
  return Math.round(price * (1 - discount.discountPercentage / 100));
}

/**
 * Learn-to-Earn rates (reduced during trial)
 */
export const LEARN_TO_EARN_RATES = {
  trial: {
    lessonCompleted: 0.02,      // 80% reduction during trial
    assignmentCompleted: 0.20,
    courseCompleted: 1.00,
    certificationEarned: 2.00,
    maxEarnings: 10             // $10 max during trial
  },
  paid: {
    lessonCompleted: 0.10,
    assignmentCompleted: 1.00,
    courseCompleted: 5.00,
    certificationEarned: 10.00,
    maxEarnings: null           // No limit for paid users
  }
};

/**
 * Calculate Learn-to-Earn with trial restrictions
 */
export function calculateTrialLearnToEarn(activities: {
  lessonsCompleted: number;
  assignmentsCompleted: number;
  coursesCompleted: number;
  certificationsEarned: number;
}, isTrial: boolean = false): {
  totalEarned: number;
  breakdown: any;
  isLimited: boolean;
} {
  const rates = isTrial ? LEARN_TO_EARN_RATES.trial : LEARN_TO_EARN_RATES.paid;
  
  const breakdown = {
    lessons: activities.lessonsCompleted * rates.lessonCompleted,
    assignments: activities.assignmentsCompleted * rates.assignmentCompleted,
    courses: activities.coursesCompleted * rates.courseCompleted,
    certifications: activities.certificationsEarned * rates.certificationEarned
  };
  
  let totalEarned = Object.values(breakdown).reduce((sum, val) => sum + val, 0);
  let isLimited = false;
  
  if (isTrial && rates.maxEarnings && totalEarned > rates.maxEarnings) {
    totalEarned = rates.maxEarnings;
    isLimited = true;
  }
  
  return {
    totalEarned: Math.round(totalEarned * 100) / 100,
    breakdown,
    isLimited
  };
}

// ============================================================================
// PRICING ANALYTICS & PROJECTIONS
// ============================================================================

export interface PricingAnalytics {
  totalUsers: number;
  usersByTier: Record<string, number>;
  usersByPlan: Record<string, number>;
  monthlyRevenue: number;
  yearlyRevenue: number;
  averageRevenuePerUser: number;
  conversionRates: {
    studentToProfessional: number;
    professionalToEnterprise: number;
  };
}

export interface RevenueProjection {
  month: string;
  students: number;
  professionals: number;
  enterprise: number;
  totalRevenue: number;
  growth: number;
}

/**
 * Generate pricing analytics and projections
 */
export function generatePricingReport(): {
  analytics: PricingAnalytics;
  projections: RevenueProjection[];
  insights: string[];
} {
  // Mock data for demonstration - in real implementation, this would come from database
  const analytics: PricingAnalytics = {
    totalUsers: 125000,
    usersByTier: {
      TIER_1: 35000,
      TIER_2: 45000,
      TIER_3: 35000,
      TIER_4: 10000
    },
    usersByPlan: {
      student: 75000,
      professional: 40000,
      enterprise: 10000
    },
    monthlyRevenue: 2850000,
    yearlyRevenue: 34200000,
    averageRevenuePerUser: 22.8,
    conversionRates: {
      studentToProfessional: 0.15,
      professionalToEnterprise: 0.08
    }
  };

  // Generate 12-month projections
  const projections: RevenueProjection[] = [];
  const baseGrowth = 0.12; // 12% monthly growth
  let currentStudents = 75000;
  let currentProfessionals = 40000;
  let currentEnterprise = 10000;

  for (let i = 0; i < 12; i++) {
    const month = new Date(2024, i, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    // Apply growth and conversions
    const newStudents = Math.round(currentStudents * (1 + baseGrowth * (1 - i * 0.01)));
    const conversions = Math.round(currentStudents * analytics.conversionRates.studentToProfessional);
    const newProfessionals = Math.round(currentProfessionals * 1.08 + conversions);
    const enterpriseConversions = Math.round(currentProfessionals * analytics.conversionRates.professionalToEnterprise);
    const newEnterprise = Math.round(currentEnterprise * 1.05 + enterpriseConversions);

    // Calculate revenue (using average pricing across tiers)
    const avgStudentPrice = 35; // Weighted average across tiers
    const avgProfessionalPrice = 95;
    const avgEnterprisePrice = 285;

    const totalRevenue = 
      (newStudents * avgStudentPrice) +
      (newProfessionals * avgProfessionalPrice) +
      (newEnterprise * avgEnterprisePrice);

    const growth = i === 0 ? 0 : ((totalRevenue - projections[i-1].totalRevenue) / projections[i-1].totalRevenue) * 100;

    projections.push({
      month,
      students: newStudents,
      professionals: newProfessionals,
      enterprise: newEnterprise,
      totalRevenue,
      growth: Math.round(growth * 100) / 100
    });

    currentStudents = newStudents;
    currentProfessionals = newProfessionals;
    currentEnterprise = newEnterprise;
  }

  const insights = [
    'Tier 2 markets represent 36% of user base with strong growth potential',
    'African markets (Tier 3/4) show 45% of users, indicating successful PPP strategy',
    'Student-to-Professional conversion rate of 15% is above industry average',
    'Enterprise segment growing 5% monthly with high revenue per user',
    'Learn-to-Earn program could increase retention by 25-30%',
    'Geographic pricing strategy reduces barriers in emerging markets',
    'Projected 12-month revenue growth of 180% with current trajectory',
    `ZAR Revenue: R${Math.round(2850000 * 19).toLocaleString()}/month, R${Math.round(617183970 * 19).toLocaleString()} projected total`
  ];

  return { analytics, projections, insights };
}

// ============================================================================
// TRIAL PRICING (COURSERA-STYLE)
// ============================================================================

export interface TrialPricing {
  trialDays: number;
  trialPrice: number;
  fullPrice: number;
  savings: number;
}

/**
 * Get trial pricing for different tiers
 */
export function getTrialPricing(tier: PricingTier): TrialPricing {
  const trialDays = 7;
  const trialPrice = tier.tier === 'TIER_1' ? 1 : 0; // $1 for Tier 1, free for others
  const fullPrice = tier.student.monthly;
  const savings = fullPrice - trialPrice;
  
  return {
    trialDays,
    trialPrice,
    fullPrice,
    savings
  };
}

// ============================================================================
// ZAR REVENUE CALCULATIONS
// ============================================================================

/**
 * Calculate revenue in South African Rands
 */
export function getRevenueInZAR(): {
  monthlyRevenueZAR: number;
  yearlyRevenueZAR: number;
  projectedTotalZAR: number;
} {
  const { analytics, projections } = generatePricingReport();
  const zarRate = 19.0; // USD to ZAR rate
  
  const monthlyRevenueZAR = Math.round(analytics.monthlyRevenue * zarRate);
  const yearlyRevenueZAR = Math.round(analytics.yearlyRevenue * zarRate);
  const projectedTotalZAR = Math.round(
    projections.reduce((sum, p) => sum + p.totalRevenue, 0) * zarRate
  );
  
  return {
    monthlyRevenueZAR,
    yearlyRevenueZAR,
    projectedTotalZAR
  };
}