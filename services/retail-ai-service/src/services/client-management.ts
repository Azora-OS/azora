/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { EventEmitter } from 'events';
import type {
  RetailClient,
  RetailLocation,
  EnterpriseAlert,
  SubscriptionTier,
  BillingInformation
} from '../interfaces';

/**
 * CLIENT MANAGEMENT SERVICE
 * 
 * Handles enterprise client lifecycle:
 * - Client onboarding and provisioning
 * - Location management
 * - Subscription and billing coordination
 * - Health monitoring and alerts
 */
export class ClientManagementService extends EventEmitter {
  private clients: Map<string, RetailClient> = new Map();
  private locations: Map<string, RetailLocation> = new Map();
  private alerts: Map<string, EnterpriseAlert[]> = new Map();

  constructor() {
    super();
  }

  /**
   * Onboard new enterprise client
   */
  async onboardClient(data: {
    companyName: string;
    industry: RetailClient['industry'];
    tier: SubscriptionTier['tier'];
    billingInfo: Omit<BillingInformation, 'status' | 'nextBillingDate'>;
  }): Promise<RetailClient> {
    const client: RetailClient = {
      id: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyName: data.companyName,
      industry: data.industry,
      locations: [],
      subscription: this.getSubscriptionTier(data.tier),
      status: 'trial',
      createdAt: new Date(),
      billingInfo: {
        ...data.billingInfo,
        status: 'current',
        nextBillingDate: this.calculateNextBillingDate(data.billingInfo.billingCycle)
      }
    };

    this.clients.set(client.id, client);
    this.emit('clientOnboarded', client);

    return client;
  }

  /**
   * Add location to client account
   */
  async addLocation(clientId: string, locationData: Omit<RetailLocation, 'id' | 'clientId' | 'cameras' | 'sensors'>): Promise<RetailLocation> {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    if (client.locations.length >= client.subscription.maxLocations) {
      throw new Error('Maximum locations reached for subscription tier');
    }

    const location: RetailLocation = {
      id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      ...locationData,
      cameras: [],
      sensors: []
    };

    this.locations.set(location.id, location);
    client.locations.push(location);

    this.emit('locationAdded', { clientId, location });

    return location;
  }

  /**
   * Get client by ID
   */
  async getClient(clientId: string): Promise<RetailClient | null> {
    return this.clients.get(clientId) || null;
  }

  /**
   * Get all client locations
   */
  async getClientLocations(clientId: string): Promise<RetailLocation[]> {
    const client = this.clients.get(clientId);
    if (!client) return [];
    
    return client.locations;
  }

  /**
   * Update client subscription
   */
  async updateSubscription(clientId: string, newTier: SubscriptionTier['tier']): Promise<RetailClient> {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const oldTier = client.subscription.tier;
    client.subscription = this.getSubscriptionTier(newTier);

    this.emit('subscriptionUpdated', { clientId, oldTier, newTier });

    return client;
  }

  /**
   * Create alert for client
   */
  async createAlert(clientId: string, alert: Omit<EnterpriseAlert, 'id' | 'clientId' | 'timestamp' | 'acknowledged'>): Promise<EnterpriseAlert> {
    const fullAlert: EnterpriseAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      clientId,
      timestamp: new Date(),
      acknowledged: false,
      ...alert
    };

    const clientAlerts = this.alerts.get(clientId) || [];
    clientAlerts.push(fullAlert);
    this.alerts.set(clientId, clientAlerts);

    this.emit('alertCreated', fullAlert);

    // Send notification based on severity
    if (fullAlert.severity === 'critical') {
      await this.sendCriticalNotification(clientId, fullAlert);
    }

    return fullAlert;
  }

  /**
   * Get client alerts
   */
  async getClientAlerts(clientId: string, filters?: {
    unacknowledgedOnly?: boolean;
    severity?: EnterpriseAlert['severity'];
    type?: EnterpriseAlert['type'];
  }): Promise<EnterpriseAlert[]> {
    let alerts = this.alerts.get(clientId) || [];

    if (filters) {
      if (filters.unacknowledgedOnly) {
        alerts = alerts.filter(a => !a.acknowledged);
      }
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.type) {
        alerts = alerts.filter(a => a.type === filters.type);
      }
    }

    return alerts;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    for (const [clientId, alerts] of this.alerts.entries()) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.acknowledged = true;
        alert.resolvedAt = new Date();
        this.emit('alertAcknowledged', { alertId, clientId });
        return;
      }
    }
    throw new Error('Alert not found');
  }

  /**
   * Get client dashboard data
   */
  async getClientDashboard(clientId: string): Promise<{
    client: RetailClient;
    locations: RetailLocation[];
    alerts: EnterpriseAlert[];
    healthMetrics: {
      systemUptime: number;
      activeLocations: number;
      activeCameras: number;
      dataQuality: number;
    };
  }> {
    const client = this.clients.get(clientId);
    if (!client) {
      throw new Error('Client not found');
    }

    const locations = client.locations;
    const alerts = this.alerts.get(clientId) || [];
    const activeCameras = locations.reduce((sum, loc) => 
      sum + loc.cameras.filter(c => c.status === 'active').length, 0
    );

    return {
      client,
      locations,
      alerts: alerts.filter(a => !a.acknowledged),
      healthMetrics: {
        systemUptime: 99.9,
        activeLocations: locations.length,
        activeCameras,
        dataQuality: 98.5
      }
    };
  }

  // Private helper methods

  private getSubscriptionTier(tier: SubscriptionTier['tier']): SubscriptionTier {
    const tiers: Record<SubscriptionTier['tier'], SubscriptionTier> = {
      basic: {
        tier: 'basic',
        features: ['Basic Analytics', 'Up to 5 cameras per location', 'Daily reports'],
        pricePerLocation: 99,
        billingCycle: 'monthly',
        maxLocations: 3,
        maxCameras: 15,
        analyticsRetention: 30
      },
      professional: {
        tier: 'professional',
        features: ['Advanced Analytics', 'Up to 20 cameras per location', 'Real-time alerts', 'API access'],
        pricePerLocation: 299,
        billingCycle: 'monthly',
        maxLocations: 10,
        maxCameras: 200,
        analyticsRetention: 90
      },
      enterprise: {
        tier: 'enterprise',
        features: ['Full AI Suite', 'Unlimited cameras', '24/7 support', 'Custom integrations', 'Dedicated account manager'],
        pricePerLocation: 999,
        billingCycle: 'monthly',
        maxLocations: 999,
        maxCameras: 99999,
        analyticsRetention: 365
      }
    };

    return tiers[tier];
  }

  private calculateNextBillingDate(cycle: 'monthly' | 'annual'): Date {
    const now = new Date();
    if (cycle === 'monthly') {
      now.setMonth(now.getMonth() + 1);
    } else {
      now.setFullYear(now.getFullYear() + 1);
    }
    return now;
  }

  private async sendCriticalNotification(clientId: string, alert: EnterpriseAlert): Promise<void> {
    // In production: integrate with notification service
    console.log(`CRITICAL ALERT for ${clientId}:`, alert.message);
    this.emit('criticalNotification', { clientId, alert });
  }
}

export const clientManagement = new ClientManagementService();
