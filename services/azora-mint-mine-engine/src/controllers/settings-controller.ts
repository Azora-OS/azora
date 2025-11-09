/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

/**
 * SETTINGS CONTROLLER
 *
 * Manages user mining preferences, algorithm selection, and configuration
 * Handles learning multiplier settings and mining optimization preferences
 */

import { logger } from '../../../../packages/lib/logger';

export type MiningAlgorithm = 'randomx' | 'ethash' | 'kawpow' | 'sha256';

export type UserRegion = 'africa' | 'world';

export interface RegionalSettings {
  region: UserRegion;
  maxCpuUsage: number;
  maxMemoryUsage: number;
  allowedAlgorithms: MiningAlgorithm[];
  learningMultiplier: number;
  metabolicTaxRate: number;
  heavyMiningRestricted: boolean;
  pricingTier: 'economy' | 'standard' | 'premium';
}

export interface UserMiningSettings {
  userId: string;
  region: UserRegion;
  enabledAlgorithms: MiningAlgorithm[];
  preferredAlgorithm: MiningAlgorithm;
  maxCpuUsage: number; // 0-100%
  maxMemoryUsage: number; // MB
  autoStart: boolean;
  learningMode: boolean;
  notifications: {
    earnings: boolean;
    performance: boolean;
    maintenance: boolean;
  };
  schedule: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  };
  advanced: {
    threadCount: number;
    intensity: number; // 0-100%
    workSize: number;
    gpuAcceleration: boolean;
  };
  lastUpdated: Date;
}

export interface MiningPreferences {
  algorithm: MiningAlgorithm;
  priority: 'profitability' | 'efficiency' | 'learning' | 'balanced';
  maxHashrate: number;
  minEfficiency: number;
  autoSwitch: boolean;
}

export class SettingsController {
  private regionalSettings: Record<UserRegion, RegionalSettings> = {
    africa: {
      region: 'africa',
      maxCpuUsage: 60, // Conservative to preserve capacity
      maxMemoryUsage: 1024, // 1GB limit
      allowedAlgorithms: ['randomx'], // Only CPU mining to save resources
      learningMultiplier: 8.0, // Maximum learning multiplier
      metabolicTaxRate: 0.05, // Reduced tax (5% vs 10%)
      heavyMiningRestricted: true,
      pricingTier: 'economy'
    },
    world: {
      region: 'world',
      maxCpuUsage: 85, // Higher limits for advanced capacity
      maxMemoryUsage: 4096, // 4GB limit
      allowedAlgorithms: ['randomx', 'ethash', 'kawpow', 'sha256'], // All algorithms
      learningMultiplier: 2.0, // Standard multiplier
      metabolicTaxRate: 0.10, // Full tax rate
      heavyMiningRestricted: false,
      pricingTier: 'premium'
    }
  };

  private defaultSettings: Omit<UserMiningSettings, 'userId' | 'region' | 'lastUpdated'> = {
    enabledAlgorithms: ['randomx', 'ethash', 'kawpow', 'sha256'],
    preferredAlgorithm: 'randomx',
    maxCpuUsage: 75,
    maxMemoryUsage: 2048, // 2GB
    autoStart: true,
    learningMode: true,
    notifications: {
      earnings: true,
      performance: true,
      maintenance: true
    },
    schedule: {
      enabled: false,
      startTime: '09:00',
      endTime: '17:00',
      daysOfWeek: [1, 2, 3, 4, 5] // Monday-Friday
    },
    advanced: {
      threadCount: 0, // Auto-detect
      intensity: 50,
      workSize: 8,
      gpuAcceleration: false
    }
  };

  // In-memory storage (in production, use database)
  private userSettings: Map<string, UserMiningSettings> = new Map();

  /**
   * Get user mining settings
   */
  public async getSettings(userId: string): Promise<UserMiningSettings> {
    let settings = this.userSettings.get(userId);

    if (!settings) {
      // Detect user region (IP-based in production)
      const region = await this.detectUserRegion(userId);

      // Create default settings for new user with regional overrides
      const regionalConfig = this.regionalSettings[region];

      settings = {
        userId,
        region,
        ...this.defaultSettings,
        // Apply regional overrides
        maxCpuUsage: Math.min(this.defaultSettings.maxCpuUsage, regionalConfig.maxCpuUsage),
        maxMemoryUsage: Math.min(this.defaultSettings.maxMemoryUsage, regionalConfig.maxMemoryUsage),
        enabledAlgorithms: this.defaultSettings.enabledAlgorithms.filter(alg =>
          regionalConfig.allowedAlgorithms.includes(alg)
        ),
        lastUpdated: new Date()
      };
      this.userSettings.set(userId, settings);
    }

    return settings;
  }

  /**
   * Update user mining settings
   */
  public async updateSettings(
    userId: string,
    updates: Partial<Omit<UserMiningSettings, 'userId' | 'region' | 'lastUpdated'>>
  ): Promise<UserMiningSettings> {
    try {
      let settings = this.userSettings.get(userId);

      if (!settings) {
        const region = await this.detectUserRegion(userId);
        const regionalConfig = this.regionalSettings[region];

        settings = {
          userId,
          region,
          ...this.defaultSettings,
          // Apply regional overrides
          maxCpuUsage: Math.min(this.defaultSettings.maxCpuUsage, regionalConfig.maxCpuUsage),
          maxMemoryUsage: Math.min(this.defaultSettings.maxMemoryUsage, regionalConfig.maxMemoryUsage),
          enabledAlgorithms: this.defaultSettings.enabledAlgorithms.filter(alg =>
            regionalConfig.allowedAlgorithms.includes(alg)
          ),
          lastUpdated: new Date()
        };
      }

      // Validate updates against regional constraints
      await this.validateSettings(updates, settings.region);

      // Apply updates
      settings = {
        ...settings,
        ...updates,
        lastUpdated: new Date()
      };

      this.userSettings.set(userId, settings);

      logger.info('⚙️ Mining settings updated', {
        userId,
        region: settings.region,
        updates: Object.keys(updates)
      });

      return settings;

    } catch (error) {
      logger.error('Failed to update settings:', error);
      throw error;
    }
  }

  /**
   * Reset user settings to defaults
   */
  public async resetSettings(userId: string): Promise<UserMiningSettings> {
    const region = await this.detectUserRegion(userId);
    const regionalConfig = this.regionalSettings[region];

    const settings: UserMiningSettings = {
      userId,
      region,
      ...this.defaultSettings,
      // Apply regional overrides
      maxCpuUsage: Math.min(this.defaultSettings.maxCpuUsage, regionalConfig.maxCpuUsage),
      maxMemoryUsage: Math.min(this.defaultSettings.maxMemoryUsage, regionalConfig.maxMemoryUsage),
      enabledAlgorithms: this.defaultSettings.enabledAlgorithms.filter(alg =>
        regionalConfig.allowedAlgorithms.includes(alg)
      ),
      lastUpdated: new Date()
    };

    this.userSettings.set(userId, settings);

    logger.info('🔄 Mining settings reset to defaults', { userId, region });

    return settings;
  }

  /**
   * Get mining preferences based on settings
   */
  public async getMiningPreferences(userId: string): Promise<MiningPreferences> {
    const settings = await this.getSettings(userId);

    return {
      algorithm: settings.preferredAlgorithm,
      priority: settings.learningMode ? 'learning' : 'profitability',
      maxHashrate: 0, // Will be determined by algorithm
      minEfficiency: 0.8, // 80% minimum efficiency
      autoSwitch: true
    };
  }

  /**
   * Check if mining should be active based on schedule
   */
  public async shouldMine(userId: string): Promise<boolean> {
    const settings = await this.getSettings(userId);

    if (!settings.schedule.enabled) {
      return true; // Always mine if schedule disabled
    }

    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Check if current day is enabled
    if (!settings.schedule.daysOfWeek.includes(currentDay)) {
      return false;
    }

    // Check if current time is within schedule
    const startTime = settings.schedule.startTime;
    const endTime = settings.schedule.endTime;

    return currentTime >= startTime && currentTime <= endTime;
  }

  /**
   * Get resource limits for user
   */
  public async getResourceLimits(userId: string): Promise<{
    maxCpuUsage: number;
    maxMemoryUsage: number;
    threadCount: number;
  }> {
    const settings = await this.getSettings(userId);

    return {
      maxCpuUsage: settings.maxCpuUsage,
      maxMemoryUsage: settings.maxMemoryUsage,
      threadCount: settings.advanced.threadCount || this.detectOptimalThreads()
    };
  }

  /**
   * Enable/disable learning mode
   */
  public async setLearningMode(userId: string, enabled: boolean): Promise<UserMiningSettings> {
    return this.updateSettings(userId, {
      learningMode: enabled,
      preferredAlgorithm: enabled ? 'randomx' : 'ethash' // RandomX better for learning
    });
  }

  /**
   * Update algorithm preferences
   */
  public async updateAlgorithmPreferences(
    userId: string,
    enabledAlgorithms: MiningAlgorithm[],
    preferredAlgorithm: MiningAlgorithm
  ): Promise<UserMiningSettings> {
    // Validate preferred algorithm is enabled
    if (!enabledAlgorithms.includes(preferredAlgorithm)) {
      throw new Error(`Preferred algorithm ${preferredAlgorithm} must be in enabled algorithms list`);
    }

    return this.updateSettings(userId, {
      enabledAlgorithms,
      preferredAlgorithm
    });
  }

  /**
   * Get notification settings
   */
  public async getNotificationSettings(userId: string): Promise<UserMiningSettings['notifications']> {
    const settings = await this.getSettings(userId);
    return settings.notifications;
  }

  /**
   * Update notification settings
   */
  public async updateNotifications(
    userId: string,
    notifications: Partial<UserMiningSettings['notifications']>
  ): Promise<UserMiningSettings> {
    const settings = await this.getSettings(userId);

    return this.updateSettings(userId, {
      notifications: {
        ...settings.notifications,
        ...notifications
      }
    });
  }

  /**
   * Export user settings for backup
   */
  public async exportSettings(userId: string): Promise<string> {
    const settings = await this.getSettings(userId);
    return JSON.stringify(settings, null, 2);
  }

  /**
   * Import user settings from backup
   */
  public async importSettings(userId: string, settingsJson: string): Promise<UserMiningSettings> {
    try {
      const importedSettings = JSON.parse(settingsJson);

      // Validate imported settings
      await this.validateSettings(importedSettings);

      const settings: UserMiningSettings = {
        ...importedSettings,
        userId,
        lastUpdated: new Date()
      };

      this.userSettings.set(userId, settings);

      logger.info('📥 Mining settings imported', { userId });

      return settings;

    } catch (error) {
      logger.error('Failed to import settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  /**
   * Get all user settings (admin function)
   */
  public async getAllSettings(): Promise<UserMiningSettings[]> {
    return Array.from(this.userSettings.values());
  }

  /**
   * Validate settings updates
   */
  private async validateSettings(
    updates: Partial<UserMiningSettings>,
    region?: UserRegion
  ): Promise<void> {
    if (updates.maxCpuUsage !== undefined) {
      if (updates.maxCpuUsage < 1 || updates.maxCpuUsage > 100) {
        throw new Error('CPU usage must be between 1-100%');
      }

      // Check regional constraints
      if (region) {
        const regionalConfig = this.regionalSettings[region];
        if (updates.maxCpuUsage > regionalConfig.maxCpuUsage) {
          throw new Error(`CPU usage exceeds regional limit of ${regionalConfig.maxCpuUsage}% for ${region} region`);
        }
      }
    }

    if (updates.maxMemoryUsage !== undefined) {
      if (updates.maxMemoryUsage < 128) {
        throw new Error('Memory usage must be at least 128MB');
      }

      // Check regional constraints
      if (region) {
        const regionalConfig = this.regionalSettings[region];
        if (updates.maxMemoryUsage > regionalConfig.maxMemoryUsage) {
          throw new Error(`Memory usage exceeds regional limit of ${regionalConfig.maxMemoryUsage}MB for ${region} region`);
        }
      }
    }

    if (updates.enabledAlgorithms !== undefined) {
      const validAlgorithms: MiningAlgorithm[] = ['randomx', 'ethash', 'kawpow', 'sha256'];
      const invalidAlgorithms = updates.enabledAlgorithms.filter(
        alg => !validAlgorithms.includes(alg)
      );

      if (invalidAlgorithms.length > 0) {
        throw new Error(`Invalid algorithms: ${invalidAlgorithms.join(', ')}`);
      }

      // Check regional algorithm restrictions
      if (region) {
        const regionalConfig = this.regionalSettings[region];
        const unauthorizedAlgorithms = updates.enabledAlgorithms.filter(
          alg => !regionalConfig.allowedAlgorithms.includes(alg)
        );

        if (unauthorizedAlgorithms.length > 0) {
          throw new Error(`Algorithms ${unauthorizedAlgorithms.join(', ')} not allowed in ${region} region`);
        }
      }
    }

    if (updates.preferredAlgorithm !== undefined && updates.enabledAlgorithms) {
      if (!updates.enabledAlgorithms.includes(updates.preferredAlgorithm)) {
        throw new Error('Preferred algorithm must be in enabled algorithms list');
      }
    }

    if (updates.schedule) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.schedule.startTime)) {
        throw new Error('Invalid start time format (HH:MM)');
      }
      if (!timeRegex.test(updates.schedule.endTime)) {
        throw new Error('Invalid end time format (HH:MM)');
      }
    }
  }

  /**
   * Detect user region based on IP address
   * In production, this would use IP geolocation services
   */
  private async detectUserRegion(userId: string): Promise<UserRegion> {
    // For now, use a simple heuristic based on userId
    // In production, this would query IP geolocation services
    // African users get priority treatment for economic transcendence

    // List of African country codes for IP detection (simplified)
    const africanIndicators = [
      'africa', 'nigeria', 'kenya', 'southafrica', 'egypt', 'morocco',
      'ethiopia', 'ghana', 'tanzania', 'uganda', 'rwanda', 'zimbabwe',
      'botswana', 'namibia', 'mozambique', 'angola', 'zambia'
    ];

    const userIdLower = userId.toLowerCase();
    const isAfrican = africanIndicators.some(indicator =>
      userIdLower.includes(indicator)
    );

    return isAfrican ? 'africa' : 'world';
  }

  /**
   * Get regional settings for a user
   */
  public async getRegionalSettings(userId: string): Promise<RegionalSettings> {
    const region = await this.detectUserRegion(userId);
    return this.regionalSettings[region];
  }

  /**
   * Detect optimal thread count for CPU mining
   */
  private detectOptimalThreads(): number {
    // In production, this would detect actual CPU cores
    // For now, return a reasonable default
    return Math.max(1, Math.floor(navigator.hardwareConcurrency * 0.75));
  }

  /**
   * Get health status of settings controller
   */
  public async getHealth(): Promise<{ status: string; details: any }> {
    const totalUsers = this.userSettings.size;
    const learningModeUsers = Array.from(this.userSettings.values())
      .filter(s => s.learningMode).length;

    return {
      status: 'healthy',
      details: {
        totalUsers,
        learningModeUsers,
        defaultSettings: this.defaultSettings
      }
    };
  }
}
