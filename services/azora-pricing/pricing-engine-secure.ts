/**
 * AZORA SECURE PRICING ENGINE
 * 
 * Production-ready pricing with comprehensive security:
 * - Rate limiting & abuse prevention
 * - Fraud detection
 * - Request validation
 * - Caching for performance
 * - Admin controls & overrides
 * - Comprehensive logging
 */

import { PRICING_TIERS, PricingTier, UserLocation, CurrencyInfo } from './pricing-engine';
import { 
  checkRateLimit, 
  detectFraudulentBehavior, 
  validatePricingRequest,
  logPricingRequest 
} from './rate-limiter';
import { getCachedExchangeRates, getCachedUserLocation, getCachedPricing } from './cache-manager';
import { getPricingOverride, applyCouponCode, checkEmergencyControls } from './admin-controls';
import { convertUSDTo, formatPrice } from './currency-converter';

// ============================================================================
// SECURE GEO-DETECTION
// ============================================================================

/**
 * Detect user location with rate limiting and caching
 */
export async function secureDetectUserLocation(
  ip?: string,
  userAgent?: string
): Promise<UserLocation> {
  // Check rate limit
  if (ip) {
    const rateLimit = checkRateLimit(ip, userAgent, 'LOCATION');
    if (!rateLimit.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimit.reason}`);
    }
  }
  
  const actualIp = ip || 'auto';
  
  try {
    // Use cached location if available
    const data = await getCachedUserLocation(actualIp, async () => {
      const url = actualIp === 'auto' 
        ? 'https://ipapi.co/json/' 
        : `https://ipapi.co/${actualIp}/json/`;
      
      const response = await fetch(url, { 
        signal: AbortSignal.timeout(5000) 
      });
      
      if (!response.ok) {
        throw new Error(`Location API returned ${response.status}`);
      }
      
      return await response.json();
    });
    
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
    // Default fallback
    return {
      country: 'Unknown',
      countryCode: 'US',
      currency: 'USD',
      continent: 'NA',
      city: 'Unknown',
      ip: actualIp
    };
  }
}

// ============================================================================
// SECURE CURRENCY CONVERSION
// ============================================================================

/**
 * Get currency info with caching
 */
export async function secureGetCurrencyInfo(currencyCode: string): Promise<CurrencyInfo> {
  try {
    const rates = await getCachedExchangeRates(async () => {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
        signal: AbortSignal.timeout(5000)
      });
      
      if (!response.ok) {
        throw new Error('Exchange rate API unavailable');
      }
      
      const data = await response.json();
      return data.rates;
    });
    
    if (rates[currencyCode]) {
      return {
        code: currencyCode,
        symbol: getCurrencySymbol(currencyCode),
        rate: rates[currencyCode]
      };
    }
  } catch (error) {
    console.warn('Using fallback exchange rates:', error);
  }
  
  // Fallback to static rates
  return {
    code: currencyCode,
    symbol: getCurrencySymbol(currencyCode),
    rate: getStaticRate(currencyCode)
  };
}

function getCurrencySymbol(code: string): string {
  const symbols: Record<string, string> = {
    'USD': '$', 'ZAR': 'R', 'KES': 'KSh', 'NGN': '₦',
    'GBP': '£', 'EUR': '€', 'INR': '₹', 'CNY': '¥',
    'BRL': 'R$', 'MXN': '$', 'JPY': '¥', 'CAD': 'C$', 'AUD': 'A$'
  };
  return symbols[code] || code;
}

function getStaticRate(code: string): number {
  const rates: Record<string, number> = {
    'USD': 1, 'ZAR': 18.5, 'KES': 130, 'NGN': 750,
    'GBP': 0.79, 'EUR': 0.92, 'INR': 83, 'CNY': 7.2,
    'BRL': 5.0, 'MXN': 17, 'JPY': 150, 'CAD': 1.35, 'AUD': 1.52
  };
  return rates[code] || 1;
}

// ============================================================================
// SECURE PRICING RETRIEVAL
// ============================================================================

export interface SecurePricingResponse {
  location: UserLocation;
  tier: PricingTier;
  currency: CurrencyInfo;
  localizedPricing: {
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
  };
  discountApplied?: number;
  couponApplied?: string;
  fraudScore?: number;
  emergency?: string;
  rateLimit?: {
    remaining: number;
    resetIn: number;
  };
}

/**
 * Get pricing with full security checks
 */
export async function secureGetPricingForUser(
  ip?: string,
  userAgent?: string,
  couponCode?: string
): Promise<SecurePricingResponse> {
  const startTime = Date.now();
  
  // ========== STEP 1: Emergency Controls ==========
  const emergencyControls = checkEmergencyControls();
  if (emergencyControls.disablePricing.enabled) {
    throw new Error(
      `Pricing temporarily unavailable: ${emergencyControls.disablePricing.reason}`
    );
  }
  
  // ========== STEP 2: Rate Limiting ==========
  let rateLimitInfo;
  if (ip) {
    rateLimitInfo = checkRateLimit(ip, userAgent, 'PRICING');
    if (!rateLimitInfo.allowed) {
      throw new Error(`Rate limit exceeded: ${rateLimitInfo.reason}`);
    }
  }
  
  // ========== STEP 3: Location Detection ==========
  const location = await secureDetectUserLocation(ip, userAgent);
  
  // ========== STEP 4: Request Validation ==========
  const validation = validatePricingRequest({
    country: location.countryCode,
    currency: location.currency
  });
  
  if (!validation.valid) {
    throw new Error(`Invalid request: ${validation.error}`);
  }
  
  // ========== STEP 5: Fraud Detection ==========
  let fraudIndicator = { score: 0, reasons: [] };
  if (ip) {
    fraudIndicator = detectFraudulentBehavior(ip, userAgent, {
      country: location.countryCode
    });
    
    // Block high fraud scores
    if (fraudIndicator.score > 70) {
      logPricingRequest({
        timestamp: Date.now(),
        ip,
        userAgent,
        country: location.countryCode,
        currency: location.currency,
        tier: 'BLOCKED',
        price: 0,
        fraudScore: fraudIndicator.score,
        success: false
      });
      
      throw new Error('Request blocked due to suspicious activity. Please contact support.');
    }
  }
  
  // ========== STEP 6: Check Pricing Override ==========
  const override = getPricingOverride(location.countryCode);
  
  // ========== STEP 7: Get Base Pricing Tier ==========
  let tier: PricingTier;
  
  if (override?.tier) {
    tier = PRICING_TIERS[override.tier];
  } else {
    // Use cached pricing or calculate
    tier = await getCachedPricing(location.countryCode, async () => {
      return getPricingTierForCountry(location.countryCode);
    });
  }
  
  function getPricingTierForCountry(countryCode: string): PricingTier {
    for (const t of Object.values(PRICING_TIERS)) {
      if (t.countries.includes(countryCode)) {
        return t;
      }
    }
    return PRICING_TIERS.TIER_2; // Default
  }
  
  // ========== STEP 8: Apply Discounts ==========
  let discountPercent = override?.discountPercent || 0;
  let appliedCoupon: string | undefined;
  
  if (couponCode && !emergencyControls.disableDiscounts.enabled) {
    const couponResult = applyCouponCode(
      couponCode,
      location.countryCode,
      tier.tier
    );
    
    if (couponResult.valid) {
      discountPercent = Math.max(discountPercent, couponResult.discountPercent || 0);
      appliedCoupon = couponCode;
    }
  }
  
  // ========== STEP 9: Currency Conversion ==========
  const currency = await secureGetCurrencyInfo(location.currency);
  
  // ========== STEP 10: Calculate Final Prices ==========
  const basePricing = override?.customPrices || {
    student: tier.student,
    professional: tier.professional,
    enterprise: tier.enterprise
  };
  
  const applyDiscount = (price: number) => 
    Math.round(price * (1 - discountPercent / 100) * currency.rate);
  
  const localizedPricing = {
    student: {
      monthly: applyDiscount(basePricing.student.monthly),
      yearly: applyDiscount(basePricing.student.yearly),
      premium: basePricing.student.premium 
        ? applyDiscount(basePricing.student.premium) 
        : undefined
    },
    professional: {
      monthly: applyDiscount(basePricing.professional.monthly),
      yearly: applyDiscount(basePricing.professional.yearly)
    },
    enterprise: {
      monthly: applyDiscount(basePricing.enterprise.monthly),
      minSeats: basePricing.enterprise.minSeats
    }
  };
  
  // ========== STEP 11: Logging ==========
  if (ip) {
    logPricingRequest({
      timestamp: Date.now(),
      ip,
      userAgent,
      country: location.countryCode,
      currency: location.currency,
      tier: tier.tier,
      price: localizedPricing.student.monthly,
      fraudScore: fraudIndicator.score,
      success: true
    });
  }
  
  // ========== STEP 12: Return Response ==========
  const response: SecurePricingResponse = {
    location,
    tier,
    currency,
    localizedPricing
  };
  
  if (discountPercent > 0) {
    response.discountApplied = discountPercent;
  }
  
  if (appliedCoupon) {
    response.couponApplied = appliedCoupon;
  }
  
  if (fraudIndicator.score > 30) {
    response.fraudScore = fraudIndicator.score;
  }
  
  if (Object.values(emergencyControls).some(c => c.enabled)) {
    response.emergency = 'Some features are temporarily limited';
  }
  
  if (rateLimitInfo) {
    response.rateLimit = {
      remaining: rateLimitInfo.remaining,
      resetIn: rateLimitInfo.resetIn
    };
  }
  
  const duration = Date.now() - startTime;
  console.log(`Pricing request completed in ${duration}ms (fraud score: ${fraudIndicator.score})`);
  
  return response;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  secureGetPricingForUser,
  secureDetectUserLocation,
  secureGetCurrencyInfo
};
