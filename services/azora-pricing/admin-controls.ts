/**
 * ADMIN CONTROLS & PRICING MANAGEMENT
 * 
 * Administrative tools for managing pricing, discounts, and system health
 */

import { PRICING_TIERS } from './pricing-engine';
import { cache, invalidateCache } from './cache-manager';
import { getRequestStats } from './rate-limiter';

// ============================================================================
// DYNAMIC PRICING OVERRIDES
// ============================================================================

interface PricingOverride {
  countryCode: string;
  tier?: string;
  discountPercent?: number;
  customPrices?: {
    student?: { monthly: number; yearly: number };
    professional?: { monthly: number; yearly: number };
    enterprise?: { monthly: number; yearly: number };
  };
  validFrom: Date;
  validUntil?: Date;
  reason: string;
  createdBy: string;
  active: boolean;
}

const pricingOverrides = new Map<string, PricingOverride>();

/**
 * Create pricing override for specific country
 */
export function createPricingOverride(override: PricingOverride): { success: boolean; message: string } {
  // Validate override
  if (!override.countryCode || override.countryCode.length !== 2) {
    return { success: false, message: 'Invalid country code' };
  }
  
  if (override.discountPercent && (override.discountPercent < 0 || override.discountPercent > 100)) {
    return { success: false, message: 'Discount must be between 0 and 100' };
  }
  
  if (override.validUntil && override.validUntil < override.validFrom) {
    return { success: false, message: 'validUntil must be after validFrom' };
  }
  
  // Store override
  const key = `${override.countryCode}:${override.validFrom.getTime()}`;
  pricingOverrides.set(key, override);
  
  // Invalidate cache for this country
  cache.delete(`pricing:${override.countryCode}`);
  
  return { 
    success: true, 
    message: `Pricing override created for ${override.countryCode}` 
  };
}

/**
 * Get active pricing override for country
 */
export function getPricingOverride(countryCode: string): PricingOverride | null {
  const now = new Date();
  
  for (const [key, override] of pricingOverrides.entries()) {
    if (
      override.countryCode === countryCode &&
      override.active &&
      override.validFrom <= now &&
      (!override.validUntil || override.validUntil >= now)
    ) {
      return override;
    }
  }
  
  return null;
}

/**
 * Deactivate pricing override
 */
export function deactivatePricingOverride(
  countryCode: string,
  validFrom: Date
): { success: boolean; message: string } {
  const key = `${countryCode}:${validFrom.getTime()}`;
  const override = pricingOverrides.get(key);
  
  if (!override) {
    return { success: false, message: 'Override not found' };
  }
  
  override.active = false;
  cache.delete(`pricing:${countryCode}`);
  
  return { success: true, message: 'Override deactivated' };
}

// ============================================================================
// GLOBAL DISCOUNTS & PROMOTIONS
// ============================================================================

interface Promotion {
  id: string;
  name: string;
  discountPercent: number;
  couponCode?: string;
  applicableCountries?: string[]; // Empty = all countries
  applicableTiers?: string[];     // Empty = all tiers
  validFrom: Date;
  validUntil: Date;
  maxUses?: number;
  currentUses: number;
  active: boolean;
  createdBy: string;
}

const promotions = new Map<string, Promotion>();

/**
 * Create new promotion
 */
export function createPromotion(promo: Omit<Promotion, 'id' | 'currentUses'>): { 
  success: boolean; 
  promotionId?: string; 
  message: string 
} {
  // Validate
  if (promo.discountPercent < 0 || promo.discountPercent > 100) {
    return { success: false, message: 'Discount must be between 0 and 100' };
  }
  
  if (promo.validUntil < promo.validFrom) {
    return { success: false, message: 'validUntil must be after validFrom' };
  }
  
  // Generate ID
  const id = `PROMO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Store
  const promotion: Promotion = {
    ...promo,
    id,
    currentUses: 0
  };
  
  promotions.set(id, promotion);
  
  return { 
    success: true, 
    promotionId: id,
    message: `Promotion created: ${promo.name}` 
  };
}

/**
 * Validate and apply coupon code
 */
export function applyCouponCode(
  couponCode: string,
  countryCode: string,
  tier: string
): { valid: boolean; discountPercent?: number; message: string } {
  const now = new Date();
  
  for (const [id, promo] of promotions.entries()) {
    if (
      promo.couponCode === couponCode &&
      promo.active &&
      promo.validFrom <= now &&
      promo.validUntil >= now
    ) {
      // Check max uses
      if (promo.maxUses && promo.currentUses >= promo.maxUses) {
        return { valid: false, message: 'Coupon code has reached maximum uses' };
      }
      
      // Check country restriction
      if (promo.applicableCountries && promo.applicableCountries.length > 0) {
        if (!promo.applicableCountries.includes(countryCode)) {
          return { valid: false, message: 'Coupon not valid for your country' };
        }
      }
      
      // Check tier restriction
      if (promo.applicableTiers && promo.applicableTiers.length > 0) {
        if (!promo.applicableTiers.includes(tier)) {
          return { valid: false, message: 'Coupon not valid for your pricing tier' };
        }
      }
      
      // Valid! Increment uses
      promo.currentUses++;
      
      return { 
        valid: true, 
        discountPercent: promo.discountPercent,
        message: `Coupon applied: ${promo.discountPercent}% off` 
      };
    }
  }
  
  return { valid: false, message: 'Invalid or expired coupon code' };
}

/**
 * Get all active promotions
 */
export function getActivePromotions(): Promotion[] {
  const now = new Date();
  const active: Promotion[] = [];
  
  for (const [id, promo] of promotions.entries()) {
    if (
      promo.active &&
      promo.validFrom <= now &&
      promo.validUntil >= now &&
      (!promo.maxUses || promo.currentUses < promo.maxUses)
    ) {
      active.push(promo);
    }
  }
  
  return active;
}

// ============================================================================
// EMERGENCY CONTROLS
// ============================================================================

interface EmergencyControl {
  enabled: boolean;
  reason: string;
  setBy: string;
  setAt: Date;
}

const emergencyControls = {
  disablePricing: { enabled: false } as EmergencyControl,
  forceDefaultTier: { enabled: false } as EmergencyControl,
  disableDiscounts: { enabled: false } as EmergencyControl,
  disablePayments: { enabled: false } as EmergencyControl
};

/**
 * Enable emergency control
 */
export function enableEmergencyControl(
  controlType: keyof typeof emergencyControls,
  reason: string,
  setBy: string
): { success: boolean; message: string } {
  emergencyControls[controlType] = {
    enabled: true,
    reason,
    setBy,
    setAt: new Date()
  };
  
  console.error(`🚨 EMERGENCY CONTROL ACTIVATED: ${controlType} - ${reason}`);
  
  return { 
    success: true, 
    message: `Emergency control "${controlType}" activated` 
  };
}

/**
 * Disable emergency control
 */
export function disableEmergencyControl(
  controlType: keyof typeof emergencyControls
): { success: boolean; message: string } {
  emergencyControls[controlType].enabled = false;
  
  console.log(`✅ Emergency control deactivated: ${controlType}`);
  
  return { 
    success: true, 
    message: `Emergency control "${controlType}" deactivated` 
  };
}

/**
 * Check if emergency controls are active
 */
export function checkEmergencyControls(): typeof emergencyControls {
  return emergencyControls;
}

// ============================================================================
// PRICING ANALYTICS
// ============================================================================

export interface PricingAnalytics {
  totalRequests24h: number;
  requestsByCountry: Record<string, number>;
  requestsByTier: Record<string, number>;
  averagePrice: Record<string, number>;
  couponRedemptions: number;
  overrideCount: number;
  fraudAttempts: number;
  cacheHitRate: number;
}

/**
 * Get pricing analytics
 */
export function getPricingAnalytics(): PricingAnalytics {
  const requestStats = getRequestStats();
  const cacheStats = cache.getStats();
  
  return {
    totalRequests24h: requestStats.total24h,
    requestsByCountry: requestStats.topCountries,
    requestsByTier: {
      'TIER_1': 0, // Would be populated from actual logs
      'TIER_2': 0,
      'TIER_3': 0,
      'TIER_4': 0
    },
    averagePrice: {
      'student': 0,
      'professional': 0,
      'enterprise': 0
    },
    couponRedemptions: Array.from(promotions.values())
      .reduce((sum, promo) => sum + promo.currentUses, 0),
    overrideCount: Array.from(pricingOverrides.values())
      .filter(o => o.active).length,
    fraudAttempts: requestStats.suspiciousRequests,
    cacheHitRate: cacheStats.hitRate
  };
}

// ============================================================================
// HEALTH CHECK
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    cache: boolean;
    rateLimiter: boolean;
    exchangeRates: boolean;
    emergencyControls: boolean;
  };
  lastCheck: Date;
}

/**
 * Perform health check on pricing system
 */
export async function healthCheck(): Promise<HealthStatus> {
  const checks = {
    cache: cache.getStats().size < 10000, // Not full
    rateLimiter: true, // Always available (in-memory)
    exchangeRates: await checkExchangeRates(),
    emergencyControls: !Object.values(emergencyControls).some(c => c.enabled)
  };
  
  const healthyCount = Object.values(checks).filter(Boolean).length;
  
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (healthyCount === 4) status = 'healthy';
  else if (healthyCount >= 2) status = 'degraded';
  else status = 'unhealthy';
  
  return {
    status,
    checks,
    lastCheck: new Date()
  };
}

async function checkExchangeRates(): Promise<boolean> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD', {
      signal: AbortSignal.timeout(5000)
    });
    return response.ok;
  } catch {
    return false;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Overrides
  createPricingOverride,
  getPricingOverride,
  deactivatePricingOverride,
  
  // Promotions
  createPromotion,
  applyCouponCode,
  getActivePromotions,
  
  // Emergency
  enableEmergencyControl,
  disableEmergencyControl,
  checkEmergencyControls,
  
  // Analytics
  getPricingAnalytics,
  healthCheck
};
