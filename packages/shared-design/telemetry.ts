/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

DESIGN TELEMETRY SERVICE
Provides telemetry for design system integration and design overhaul tracking
*/

import { eventBus } from './event-bus';
import { prisma } from '@azora/shared-database/prisma';

export interface DesignTelemetryEvent {
  component: string;
  action: string;
  userId?: string;
  sessionId?: string;
  metadata?: {
    loadTime?: number;
    renderTime?: number;
    interactionTime?: number;
    error?: string;
  };
  timestamp: Date;
}

/**
 * Design Telemetry Service
 * Tracks design system usage and performance
 */
export class DesignTelemetryService {
  /**
   * Track component usage
   */
  async trackComponentUsage(event: Omit<DesignTelemetryEvent, 'timestamp'>): Promise<void> {
    const telemetryEvent: DesignTelemetryEvent = {
      ...event,
      timestamp: new Date(),
    };

    // Emit event
    await eventBus.publish('design.component.used', {
      component: event.component,
      action: event.action,
      userId: event.userId,
      metadata: event.metadata,
    });

    // Store in database (if needed)
    try {
      // Could store in analytics table
      // await prisma.analytics.create({ data: ... });
    } catch (error) {
      // Silently fail - telemetry shouldn't break the app
      console.error('Failed to store design telemetry:', error);
    }
  }

  /**
   * Track design system performance
   */
  async trackPerformance(metrics: {
    component: string;
    loadTime: number;
    renderTime: number;
    userId?: string;
  }): Promise<void> {
    await this.trackComponentUsage({
      component: metrics.component,
      action: 'performance',
      userId: metrics.userId,
      metadata: {
        loadTime: metrics.loadTime,
        renderTime: metrics.renderTime,
      },
    });
  }

  /**
   * Track design system errors
   */
  async trackError(component: string, error: string, userId?: string): Promise<void> {
    await this.trackComponentUsage({
      component,
      action: 'error',
      userId,
      metadata: {
        error,
      },
    });
  }

  /**
   * Get design system usage statistics
   */
  async getUsageStats(component?: string, startDate?: Date, endDate?: Date): Promise<any> {
    // Get events from event bus history
    const events = eventBus.getEventHistory('design.component.used');
    
    let filtered = events;
    if (component) {
      filtered = filtered.filter((e: any) => e.payload.component === component);
    }
    if (startDate) {
      filtered = filtered.filter((e: any) => new Date(e.timestamp) >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter((e: any) => new Date(e.timestamp) <= endDate);
    }

    // Calculate statistics
    const stats = {
      totalEvents: filtered.length,
      uniqueComponents: new Set(filtered.map((e: any) => e.payload.component)).size,
      uniqueUsers: new Set(filtered.map((e: any) => e.payload.userId).filter(Boolean)).size,
      averageLoadTime: this.calculateAverageLoadTime(filtered),
      errorRate: this.calculateErrorRate(filtered),
      components: this.getComponentUsage(filtered),
    };

    return stats;
  }

  /**
   * Calculate average load time
   */
  private calculateAverageLoadTime(events: any[]): number {
    const loadTimes = events
      .map((e: any) => e.payload.metadata?.loadTime)
      .filter((t: any) => typeof t === 'number');

    if (loadTimes.length === 0) {return 0;}
    return loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
  }

  /**
   * Calculate error rate
   */
  private calculateErrorRate(events: any[]): number {
    const errors = events.filter((e: any) => e.payload.action === 'error').length;
    return events.length > 0 ? errors / events.length : 0;
  }

  /**
   * Get component usage breakdown
   */
  private getComponentUsage(events: any[]): Record<string, number> {
    const usage: Record<string, number> = {};
    
    events.forEach((e: any) => {
      const component = e.payload.component;
      usage[component] = (usage[component] || 0) + 1;
    });

    return usage;
  }
}

// Export singleton instance
export const designTelemetry = new DesignTelemetryService();

export default designTelemetry;
