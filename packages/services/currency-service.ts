// Currency conversion service for BuildSpaces pricing
export interface CurrencyRate {
  code: string;
  name: string;
  symbol: string;
  rate: number; // USD to local currency rate
  decimals: number;
}

export interface PricingTier {
  id: string;
  name: string;
  basePriceUSD: number;
  features: string[];
  limits: {
    projects: number;
    computeHours: number;
    storageGB: number;
    aiRequests: number;
    teamMembers?: number;
  };
  popular?: boolean;
}

export interface Discount {
  type: 'student' | 'fund_contribution' | 'annual' | 'volume';
  percentage: number;
  description: string;
  conditions?: {
    minFundContribution?: number;
    minTeamSize?: number;
    studentVerification?: boolean;
  };
}

// Currency rates (you'd fetch these from an API in production)
const CURRENCY_RATES: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1, decimals: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85, decimals: 2 },
  { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73, decimals: 2 },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', rate: 800, decimals: 0 },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', rate: 130, decimals: 0 },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵', rate: 15, decimals: 2 },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: 18, decimals: 2 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83, decimals: 2 },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', rate: 5, decimals: 2 },
  { code: 'MXN', name: 'Mexican Peso', symbol: '$', rate: 17, decimals: 2 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25, decimals: 2 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35, decimals: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110, decimals: 0 },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: 6.5, decimals: 2 },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', rate: 1200, decimals: 0 },
];

// BuildSpaces pricing tiers (USD base prices)
export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    basePriceUSD: 0,
    features: [
      '1 active project',
      '5 hours compute/month',
      '2GB storage',
      'Basic AI assistance',
      'Community support',
      '5 AI requests/day'
    ],
    limits: {
      projects: 1,
      computeHours: 5,
      storageGB: 2,
      aiRequests: 150 // 5/day * 30 days
    }
  },
  {
    id: 'individual',
    name: 'Individual Developer',
    basePriceUSD: 12,
    features: [
      'Unlimited projects',
      '40 hours compute/month',
      '20GB storage',
      'Full AI assistance',
      'Priority support',
      'Unlimited AI requests',
      'Custom environments',
      'Git integration'
    ],
    limits: {
      projects: -1, // unlimited
      computeHours: 40,
      storageGB: 20,
      aiRequests: -1 // unlimited
    },
    popular: true
  },
  {
    id: 'professional',
    name: 'Professional',
    basePriceUSD: 35,
    features: [
      'Everything in Individual',
      '120 hours compute/month',
      '100GB storage',
      'Team collaboration (up to 3)',
      'API access',
      'Advanced debugging',
      'Custom templates',
      'White-label options'
    ],
    limits: {
      projects: -1,
      computeHours: 120,
      storageGB: 100,
      aiRequests: -1,
      teamMembers: 3
    }
  },
  {
    id: 'team',
    name: 'Team',
    basePriceUSD: 99,
    features: [
      'Everything in Professional',
      '500 hours compute/month',
      '500GB storage',
      'Unlimited team members',
      'Admin dashboard',
      'SSO integration',
      'Audit logs',
      'Dedicated support',
      'SLA guarantee'
    ],
    limits: {
      projects: -1,
      computeHours: 500,
      storageGB: 500,
      aiRequests: -1,
      teamMembers: -1 // unlimited
    }
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    basePriceUSD: 299,
    features: [
      'Everything in Team',
      'Unlimited compute (fair use)',
      'Unlimited storage',
      'On-premise deployment',
      'Custom AI models',
      'Training & consulting',
      '24/7 support',
      'Custom integrations'
    ],
    limits: {
      projects: -1,
      computeHours: -1, // unlimited
      storageGB: -1, // unlimited
      aiRequests: -1,
      teamMembers: -1
    }
  }
];

// Available discounts
export const DISCOUNTS: Discount[] = [
  {
    type: 'student',
    percentage: 50,
    description: 'Student Discount',
    conditions: { studentVerification: true }
  },
  {
    type: 'fund_contribution',
    percentage: 25,
    description: 'Community Fund Contributor',
    conditions: { minFundContribution: 100 }
  },
  {
    type: 'annual',
    percentage: 20,
    description: 'Annual Plan (Save 20%)'
  },
  {
    type: 'volume',
    percentage: 15,
    description: 'Team Volume Discount',
    conditions: { minTeamSize: 10 }
  }
];

export class CurrencyService {
  private static instance: CurrencyService;
  private userCurrency: CurrencyRate;
  private cache: Map<string, { rate: number; timestamp: number }> = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  private constructor() {
    this.userCurrency = this.detectUserCurrency();
  }

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService();
    }
    return CurrencyService.instance;
  }

  // Detect user's currency based on location
  private detectUserCurrency(): CurrencyRate {
    if (typeof window === 'undefined') {
      return CURRENCY_RATES[0]; // Default to USD for server-side
    }

    try {
      // Try to get from localStorage first
      const saved = localStorage.getItem('buildspaces-currency');
      if (saved) {
        const currency = CURRENCY_RATES.find(c => c.code === saved);
        if (currency) return currency;
      }

      // Detect from browser language/region
      const locale = navigator.language || 'en-US';
      const region = locale.split('-')[1]?.toUpperCase();
      
      const currencyMap: Record<string, string> = {
        'US': 'USD', 'GB': 'GBP', 'DE': 'EUR', 'FR': 'EUR', 'IT': 'EUR',
        'ES': 'EUR', 'NL': 'EUR', 'NG': 'NGN', 'KE': 'KES', 'GH': 'GHS',
        'ZA': 'ZAR', 'IN': 'INR', 'BR': 'BRL', 'MX': 'MXN', 'CA': 'CAD',
        'AU': 'AUD', 'JP': 'JPY', 'CN': 'CNY', 'KR': 'KRW'
      };

      const detectedCode = currencyMap[region || 'US'] || 'USD';
      return CURRENCY_RATES.find(c => c.code === detectedCode) || CURRENCY_RATES[0];
    } catch {
      return CURRENCY_RATES[0]; // Fallback to USD
    }
  }

  // Get available currencies
  getAvailableCurrencies(): CurrencyRate[] {
    return CURRENCY_RATES;
  }

  // Set user currency preference
  setUserCurrency(currencyCode: string): void {
    const currency = CURRENCY_RATES.find(c => c.code === currencyCode);
    if (currency) {
      this.userCurrency = currency;
      if (typeof window !== 'undefined') {
        localStorage.setItem('buildspaces-currency', currencyCode);
      }
    }
  }

  // Get current user currency
  getUserCurrency(): CurrencyRate {
    return this.userCurrency;
  }

  // Convert USD price to user's currency
  async convertFromUSD(usdAmount: number): Promise<number> {
    if (usdAmount === 0) return 0;

    const cacheKey = `USD_${this.userCurrency.code}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return this.roundAmount(usdAmount * cached.rate);
    }

    try {
      // In production, you'd fetch from a real API like:
      // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`);
      // const data = await response.json();
      // const rate = data.rates[this.userCurrency.code];

      // For now, use static rates
      const rate = this.userCurrency.rate;
      
      this.cache.set(cacheKey, { rate, timestamp: Date.now() });
      return this.roundAmount(usdAmount * rate);
    } catch (error) {
      console.warn('Currency conversion failed, using static rate:', error);
      return this.roundAmount(usdAmount * this.userCurrency.rate);
    }
  }

  // Format price for display
  async formatPrice(usdAmount: number): Promise<string> {
    const converted = await this.convertFromUSD(usdAmount);
    const decimals = this.userCurrency.decimals;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.userCurrency.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(converted);
  }

  // Calculate final price with discounts
  calculateFinalPrice(
    basePriceUSD: number,
    discounts: Discount[] = [],
    userProfile: {
      isStudent?: boolean;
      fundContribution?: number;
      teamSize?: number;
      billingCycle?: 'monthly' | 'annual';
    } = {}
  ): number {
    let finalPrice = basePriceUSD;

    // Apply discounts
    discounts.forEach(discount => {
      let applies = true;

      // Check discount conditions
      if (discount.conditions) {
        if (discount.conditions.studentVerification && !userProfile.isStudent) {
          applies = false;
        }
        if (discount.conditions.minFundContribution && 
            (userProfile.fundContribution || 0) < discount.conditions.minFundContribution) {
          applies = false;
        }
        if (discount.conditions.minTeamSize && 
            (userProfile.teamSize || 0) < discount.conditions.minTeamSize) {
          applies = false;
        }
      }

      if (applies) {
        finalPrice *= (1 - discount.percentage / 100);
      }
    });

    // Annual billing discount
    if (userProfile.billingCycle === 'annual') {
      finalPrice *= 0.8; // 20% off for annual
    }

    return Math.max(0, finalPrice);
  }

  // Get applicable discounts for user
  getApplicableDiscounts(userProfile: {
    isStudent?: boolean;
    fundContribution?: number;
    teamSize?: number;
    billingCycle?: 'monthly' | 'annual';
  }): Discount[] {
    return DISCOUNTS.filter(discount => {
      if (discount.conditions) {
        if (discount.conditions.studentVerification && !userProfile.isStudent) {
          return false;
        }
        if (discount.conditions.minFundContribution && 
            (userProfile.fundContribution || 0) < discount.conditions.minFundContribution) {
          return false;
        }
        if (discount.conditions.minTeamSize && 
            (userProfile.teamSize || 0) < discount.conditions.minTeamSize) {
          return false;
        }
      }
      return true;
    });
  }

  // Round amount to appropriate decimals
  private roundAmount(amount: number): number {
    const decimals = this.userCurrency.decimals;
    const multiplier = Math.pow(10, decimals);
    return Math.round(amount * multiplier) / multiplier;
  }

  // Get price comparison (show savings)
  async getPriceComparison(originalUSD: number, discountedUSD: number): Promise<{
    original: string;
    discounted: string;
    savings: string;
    savingsPercentage: number;
  }> {
    const original = await this.formatPrice(originalUSD);
    const discounted = await this.formatPrice(discountedUSD);
    const savingsUSD = originalUSD - discountedUSD;
    const savings = await this.formatPrice(savingsUSD);
    const savingsPercentage = Math.round((savingsUSD / originalUSD) * 100);

    return {
      original,
      discounted,
      savings,
      savingsPercentage
    };
  }
}

// Export singleton instance
export const currencyService = CurrencyService.getInstance();
