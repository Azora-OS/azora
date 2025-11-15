/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

PREMIUM EDUCATION SERVICE
Backend service for premium education features
*/

import { EventEmitter } from 'events';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'ai' | 'analytics' | 'support' | 'tools';
  tier: 'basic' | 'advanced' | 'elite';
  unlocked: boolean;
}

export interface PremiumSubscription {
  userId: string;
  tier: 'basic' | 'advanced' | 'elite';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  features: PremiumFeature[];
}

export class PremiumEducationService extends EventEmitter {
  private subscriptions: Map<string, PremiumSubscription> = new Map();
  private premiumFeatures: Map<string, PremiumFeature> = new Map();

  constructor() {
    super();
    this.initializePremiumFeatures();
  }

  private initializePremiumFeatures() {
    const features: PremiumFeature[] = [
      {
        id: 'advanced-ai-tutor',
        name: 'Advanced AI Tutor',
        description: '24/7 personalized AI tutoring with advanced reasoning',
        category: 'ai',
        tier: 'basic',
        unlocked: false,
      },
      {
        id: 'premium-video-library',
        name: 'Premium Video Library',
        description: 'Access to exclusive video courses and tutorials',
        category: 'content',
        tier: 'basic',
        unlocked: false,
      },
      {
        id: 'advanced-analytics',
        name: 'Advanced Learning Analytics',
        description: 'Detailed insights into learning patterns and progress',
        category: 'analytics',
        tier: 'advanced',
        unlocked: false,
      },
      {
        id: 'priority-support',
        name: 'Priority Support',
        description: 'Get help from mentors within 1 hour',
        category: 'support',
        tier: 'basic',
        unlocked: false,
      },
      {
        id: 'download-certificates',
        name: 'Download Certificates',
        description: 'Download and share verified blockchain certificates',
        category: 'tools',
        tier: 'basic',
        unlocked: false,
      },
      {
        id: 'premium-study-groups',
        name: 'Premium Study Groups',
        description: 'Join exclusive study groups with top learners',
        category: 'support',
        tier: 'advanced',
        unlocked: false,
      },
      {
        id: 'unlimited-courses',
        name: 'Unlimited Course Access',
        description: 'Access to all premium courses without limits',
        category: 'content',
        tier: 'elite',
        unlocked: false,
      },
      {
        id: 'personal-mentor',
        name: 'Personal Mentor',
        description: 'Dedicated personal mentor for 1-on-1 guidance',
        category: 'support',
        tier: 'elite',
        unlocked: false,
      },
    ];

    features.forEach((feature) => {
      this.premiumFeatures.set(feature.id, feature);
    });
  }

  /**
   * Subscribe user to premium tier
   */
  async subscribe(userId: string, tier: 'basic' | 'advanced' | 'elite'): Promise<PremiumSubscription> {
    const subscription: PremiumSubscription = {
      userId,
      tier,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      autoRenew: true,
      features: this.getFeaturesForTier(tier),
    };

    this.subscriptions.set(userId, subscription);
    this.emit('subscription-created', subscription);

    return subscription;
  }

  /**
   * Get features for a specific tier
   */
  private getFeaturesForTier(tier: 'basic' | 'advanced' | 'elite'): PremiumFeature[] {
    const allFeatures = Array.from(this.premiumFeatures.values());
    
    if (tier === 'elite') {
      return allFeatures.map((f) => ({ ...f, unlocked: true }));
    }
    
    if (tier === 'advanced') {
      return allFeatures.map((f) => ({
        ...f,
        unlocked: f.tier === 'basic' || f.tier === 'advanced',
      }));
    }
    
    return allFeatures.map((f) => ({
      ...f,
      unlocked: f.tier === 'basic',
    }));
  }

  /**
   * Check if user has premium access
   */
  isPremium(userId: string): boolean {
    const subscription = this.subscriptions.get(userId);
    return subscription?.status === 'active' && subscription.endDate > new Date();
  }

  /**
   * Check if user has access to specific feature
   */
  hasFeatureAccess(userId: string, featureId: string): boolean {
    const subscription = this.subscriptions.get(userId);
    if (!subscription || subscription.status !== 'active') {
      return false;
    }

    const feature = subscription.features.find((f) => f.id === featureId);
    return feature?.unlocked || false;
  }

  /**
   * Get user's premium subscription
   */
  getSubscription(userId: string): PremiumSubscription | undefined {
    return this.subscriptions.get(userId);
  }

  /**
   * Get all premium features
   */
  getAllFeatures(): PremiumFeature[] {
    return Array.from(this.premiumFeatures.values());
  }

  /**
   * Upgrade subscription tier
   */
  async upgrade(userId: string, newTier: 'basic' | 'advanced' | 'elite'): Promise<PremiumSubscription> {
    const current = this.subscriptions.get(userId);
    if (!current) {
      throw new Error('No active subscription found');
    }

    const subscription: PremiumSubscription = {
      ...current,
      tier: newTier,
      features: this.getFeaturesForTier(newTier),
    };

    this.subscriptions.set(userId, subscription);
    this.emit('subscription-upgraded', subscription);

    return subscription;
  }

  /**
   * Cancel subscription
   */
  async cancel(userId: string): Promise<void> {
    const subscription = this.subscriptions.get(userId);
    if (!subscription) {
      throw new Error('No subscription found');
    }

    subscription.status = 'cancelled';
    subscription.autoRenew = false;
    this.subscriptions.set(userId, subscription);
    this.emit('subscription-cancelled', subscription);
  }
}

// Create singleton instance
export const premiumEducationService = new PremiumEducationService();

export default premiumEducationService;
