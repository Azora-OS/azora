/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

AFRICA-FIRST CDN NETWORK
Branches stretching across Africa - Distributed content delivery
*/

import { EventEmitter } from 'events';

export interface CDNNode {
  id: string;
  region: string;
  country: string;
  city: string;
  url: string;
  latency: number;
  capacity: number;
  health: 'healthy' | 'degraded' | 'down';
  lastHealthCheck: Date;
}

export interface CDNRequest {
  path: string;
  region?: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Africa-First CDN Network
 * Branches stretching across Africa
 */
export class AfricaFirstCDN extends EventEmitter {
  private nodes: Map<string, CDNNode> = new Map();
  private nodeRegions: Map<string, CDNNode[]> = new Map();

  constructor() {
    super();
    this.initializeAfricaNodes();
  }

  /**
   * Initialize CDN nodes across Africa
   * Branches stretching across the continent
   */
  private initializeAfricaNodes(): void {
    const africaNodes: CDNNode[] = [
      // Southern Africa
      {
        id: 'jhb-za-01',
        region: 'southern-africa',
        country: 'South Africa',
        city: 'Johannesburg',
        url: 'https://cdn-jhb.azora.africa',
        latency: 0,
        capacity: 1000,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      {
        id: 'cpt-za-01',
        region: 'southern-africa',
        country: 'South Africa',
        city: 'Cape Town',
        url: 'https://cdn-cpt.azora.africa',
        latency: 0,
        capacity: 800,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      // East Africa
      {
        id: 'nrb-ke-01',
        region: 'east-africa',
        country: 'Kenya',
        city: 'Nairobi',
        url: 'https://cdn-nrb.azora.africa',
        latency: 0,
        capacity: 600,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      {
        id: 'dar-tz-01',
        region: 'east-africa',
        country: 'Tanzania',
        city: 'Dar es Salaam',
        url: 'https://cdn-dar.azora.africa',
        latency: 0,
        capacity: 500,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      // West Africa
      {
        id: 'lag-ng-01',
        region: 'west-africa',
        country: 'Nigeria',
        city: 'Lagos',
        url: 'https://cdn-lag.azora.africa',
        latency: 0,
        capacity: 900,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      {
        id: 'acc-gh-01',
        region: 'west-africa',
        country: 'Ghana',
        city: 'Accra',
        url: 'https://cdn-acc.azora.africa',
        latency: 0,
        capacity: 400,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      // North Africa
      {
        id: 'cai-eg-01',
        region: 'north-africa',
        country: 'Egypt',
        city: 'Cairo',
        url: 'https://cdn-cai.azora.africa',
        latency: 0,
        capacity: 700,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
      // Central Africa
      {
        id: 'kin-cd-01',
        region: 'central-africa',
        country: 'DRC',
        city: 'Kinshasa',
        url: 'https://cdn-kin.azora.africa',
        latency: 0,
        capacity: 450,
        health: 'healthy',
        lastHealthCheck: new Date(),
      },
    ];

    // Register all nodes
    africaNodes.forEach(node => {
      this.nodes.set(node.id, node);
      if (!this.nodeRegions.has(node.region)) {
        this.nodeRegions.set(node.region, []);
      }
      this.nodeRegions.get(node.region)!.push(node);
    });

    this.emit('nodes-initialized', { count: africaNodes.length });
  }

  /**
   * Get optimal CDN node for request
   * Routes to nearest healthy branch
   */
  getOptimalNode(request: CDNRequest): CDNNode | null {
    const region = request.region || this.detectRegion();
    const regionNodes = this.nodeRegions.get(region) || Array.from(this.nodes.values());

    // Filter healthy nodes and sort by latency
    const healthyNodes = regionNodes
      .filter(node => node.health === 'healthy')
      .sort((a, b) => a.latency - b.latency);

    return healthyNodes[0] || null;
  }

  /**
   * Detect user region (simplified - in production, use geo-IP)
   */
  private detectRegion(): string {
    // TODO: Implement geo-IP detection
    return 'southern-africa'; // Default
  }

  /**
   * Get CDN URL for asset
   */
  getAssetURL(path: string, region?: string): string {
    const node = this.getOptimalNode({ path, region });
    if (!node) {
      // Fallback to primary node
      return `https://cdn.azora.africa${path}`;
    }
    return `${node.url}${path}`;
  }

  /**
   * Health check all nodes
   */
  async checkNodeHealth(): Promise<void> {
    for (const [id, node] of this.nodes.entries()) {
      try {
        const startTime = Date.now();
        // TODO: Implement actual health check
        const latency = Date.now() - startTime;
        
        node.latency = latency;
        node.lastHealthCheck = new Date();
        node.health = latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'down';
        
        this.emit('node-health-updated', { nodeId: id, health: node.health });
      } catch (error) {
        node.health = 'down';
        node.lastHealthCheck = new Date();
        this.emit('node-health-error', { nodeId: id, error });
      }
    }
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(intervalMs: number = 60000): void {
    setInterval(() => {
      this.checkNodeHealth();
    }, intervalMs);
    
    // Initial check
    this.checkNodeHealth();
  }

  /**
   * Get network status
   */
  getNetworkStatus(): {
    totalNodes: number;
    healthyNodes: number;
    regions: string[];
    nodesByRegion: Record<string, number>;
  } {
    const healthyNodes = Array.from(this.nodes.values()).filter(n => n.health === 'healthy');
    const nodesByRegion: Record<string, number> = {};
    
    this.nodeRegions.forEach((nodes, region) => {
      nodesByRegion[region] = nodes.filter(n => n.health === 'healthy').length;
    });

    return {
      totalNodes: this.nodes.size,
      healthyNodes: healthyNodes.length,
      regions: Array.from(this.nodeRegions.keys()),
      nodesByRegion,
    };
  }
}

// Export singleton
export const africaCDN = new AfricaFirstCDN();

// Start health monitoring
africaCDN.startHealthMonitoring();

export default AfricaFirstCDN;
