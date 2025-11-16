/**
 * Feature Access Control
 * Manages feature permissions based on subscription tier
 */

import { SubscriptionTier } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
import { logger } from '../shared/logging';
import { ErrorHandler } from '../payment/error-handler';

const prisma = new PrismaClient();

export type Feature =
  | 'view_courses'
  | 'upload_courses'
  | 'sell_courses'
  | 'offline_access'
  | 'certificates'
  | 'advanced_progress_tracking'
  | 'global_leaderboard'
  | 'friend_leaderboard'
  | 'class_leaderboard'
  | 'token_rewards'
  | 'priority_support'
  | 'live_chat'
  | 'phone_support'
  | 'user_management'
  | 'custom_branding'
  | 'white_label'
  | 'sso_integration'
  | 'api_access'
  | 'audit_logs'
  | 'dedicated_support';

export interface FeatureMatrix {
  [key in SubscriptionTier]: Feature[];
}

export interface FeatureLimit {
  feature: Feature;
  limit: number | null; // null = unlimited
}

export interface FeatureLimitMatrix {
  [key in SubscriptionTier]: FeatureLimit[];
}

// Feature matrix defining which features are available for each tier
const FEATURE_MATRIX: FeatureMatrix = {
  FREE: [
    'view_courses',
    'global_leaderboard',
    'token_rewards',
  ],
  PRO: [
    'view_courses',
    'upload_courses',
    'sell_courses',
    'offline_access',
    'certificates',
    'advanced_progress_tracking',
    'global_leaderboard',
    'friend_leaderboard',
    'token_rewards',
    'priority_support',
    'live_chat',
  ],
  ENTERPRISE: [
    'view_courses',
    'upload_courses',
    'sell_courses',
    'offline_access',
    'certificates',
    'advanced_progress_tracking',
    'global_leaderboard',
    'friend_leaderboard',
    'class_leaderboard',
    'token_rewards',
    'priority_support',
    'live_chat',
    'phone_support',
    'user_management',
    'custom_branding',
    'white_label',
    'sso_integration',
    'api_access',
    'audit_logs',
    'dedicated_support',
  ],
};

// Feature limits for each tier
const FEATURE_LIMITS: FeatureLimitMatrix = {
  FREE: [
    { feature: 'view_courses', limit: 5 },
    { feature: 'token_rewards', limit: 50 }, // per month
  ],
  PRO: [
    { feature: 'view_courses', limit: null }, // unlimited
    { feature: 'upload_courses', limit: 5 }, // per month
    { feature: 'token_rewards', limit: 500 }, // per month
  ],
  ENTERPRISE: [
    { feature: 'view_courses', limit: null },
    { feature: 'upload_courses', limit: null },
    { feature: 'token_rewards', limit: 5000 }, // per month
  ],
};

// Cache for feature access (TTL: 5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const featureAccessCache = new Map<string, { tier: SubscriptionTier; timestamp: number }>();

export class FeatureAccessService {
  /**
   * Check if user has access to a feature
   */
  async checkFeatureAccess(userId: string, feature: Feature): Promise<boolean> {
    try {
      const tier = await this.getUserTier(userId);
      const hasAccess = FEATURE_MATRIX[tier].includes(feature);

      logger.debug('Feature access check', { userId, feature, tier, hasAccess });
      return hasAccess;
    } catch (error) {
      logger.error('Failed to check feature access', { error, userId, feature });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Check if user has access to multiple features
   */
  async checkMultipleFeatures(userId: string, features: Feature[]): Promise<Record<Feature, boolean>> {
    try {
      const tier = await this.getUserTier(userId);
      const result: Record<Feature, boolean> = {} as Record<Feature, boolean>;

      for (const feature of features) {
        result[feature] = FEATURE_MATRIX[tier].includes(feature);
      }

      return result;
    } catch (error) {
      logger.error('Failed to check multiple features', { error, userId });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get all features available for a tier
   */
  getFeaturesByTier(tier: SubscriptionTier): Feature[] {
    return FEATURE_MATRIX[tier];
  }

  /**
   * Get feature limit for a tier
   */
  getFeatureLimit(tier: SubscriptionTier, feature: Feature): number | null {
    const limits = FEATURE_LIMITS[tier];
    const limit = limits.find((l) => l.feature === feature);
    return limit?.limit ?? null;
  }

  /**
   * Get all feature limits for a tier
   */
  getFeatureLimitsByTier(tier: SubscriptionTier): FeatureLimit[] {
    return FEATURE_LIMITS[tier];
  }

  /**
   * Get user's subscription tier
   */
  async getUserTier(userId: string): Promise<SubscriptionTier> {
    try {
      // Check cache first
      const cached = featureAccessCache.get(userId);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.tier;
      }

      // Get from database
      const subscription = await prisma.subscription.findUnique({
        where: { userId },
      });

      const tier = subscription?.tier ?? 'FREE';

      // Update cache
      featureAccessCache.set(userId, { tier, timestamp: Date.now() });

      return tier;
    } catch (error) {
      logger.error('Failed to get user tier', { error, userId });
      // Default to FREE tier on error
      return 'FREE';
    }
  }

  /**
   * Invalidate cache for a user
   */
  invalidateCache(userId: string): void {
    featureAccessCache.delete(userId);
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    featureAccessCache.clear();
  }

  /**
   * Get feature comparison between tiers
   */
  getFeatureComparison(): Record<SubscriptionTier, Feature[]> {
    return FEATURE_MATRIX;
  }

  /**
   * Check if feature is available in any tier
   */
  isFeatureAvailable(feature: Feature): boolean {
    return Object.values(FEATURE_MATRIX).some((features) => features.includes(feature));
  }

  /**
   * Get minimum tier required for a feature
   */
  getMinimumTierForFeature(feature: Feature): SubscriptionTier | null {
    const tiers: SubscriptionTier[] = ['FREE', 'PRO', 'ENTERPRISE'];
    for (const tier of tiers) {
      if (FEATURE_MATRIX[tier].includes(feature)) {
        return tier;
      }
    }
    return null;
  }

  /**
   * Validate feature access with limit checking
   */
  async validateFeatureUsage(
    userId: string,
    feature: Feature,
    currentUsage: number
  ): Promise<{ allowed: boolean; remaining: number | null }> {
    try {
      const tier = await this.getUserTier(userId);
      const hasAccess = FEATURE_MATRIX[tier].includes(feature);

      if (!hasAccess) {
        return { allowed: false, remaining: null };
      }

      const limit = this.getFeatureLimit(tier, feature);
      if (limit === null) {
        // Unlimited
        return { allowed: true, remaining: null };
      }

      const remaining = Math.max(0, limit - currentUsage);
      return { allowed: remaining > 0, remaining };
    } catch (error) {
      logger.error('Failed to validate feature usage', { error, userId, feature });
      throw ErrorHandler.handle(error);
    }
  }

  /**
   * Get feature matrix for UI display
   */
  getFeatureMatrixForUI(): {
    features: Feature[];
    tiers: SubscriptionTier[];
    matrix: Record<Feature, Record<SubscriptionTier, boolean>>;
  } {
    const allFeatures = new Set<Feature>();
    Object.values(FEATURE_MATRIX).forEach((features) => {
      features.forEach((f) => allFeatures.add(f));
    });

    const features = Array.from(allFeatures);
    const tiers: SubscriptionTier[] = ['FREE', 'PRO', 'ENTERPRISE'];
    const matrix: Record<Feature, Record<SubscriptionTier, boolean>> = {} as any;

    for (const feature of features) {
      matrix[feature] = {
        FREE: FEATURE_MATRIX.FREE.includes(feature),
        PRO: FEATURE_MATRIX.PRO.includes(feature),
        ENTERPRISE: FEATURE_MATRIX.ENTERPRISE.includes(feature),
      };
    }

    return { features, tiers, matrix };
  }
}

export default new FeatureAccessService();
