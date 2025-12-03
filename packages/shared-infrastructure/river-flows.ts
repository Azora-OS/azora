/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

RIVER DATA FLOWS
Roots by the rivers - Streaming data infrastructure
*/

import { EventEmitter } from 'events';
import { eventBus } from '@azora/shared-services/event-bus';

export interface RiverFlow {
  id: string;
  name: string;
  source: string;
  destination: string;
  flowType: 'stream' | 'batch' | 'event';
  status: 'flowing' | 'dammed' | 'dried';
  throughput: number;
  latency: number;
}

export interface RiverEvent {
  flowId: string;
  data: any;
  timestamp: Date;
  priority: 'high' | 'medium' | 'low';
}

/**
 * River Data Flows
 * Roots by the rivers - Continuous data streaming
 */
export class RiverDataFlows extends EventEmitter {
  private flows: Map<string, RiverFlow> = new Map();
  private flowStreams: Map<string, NodeJS.ReadableStream> = new Map();

  constructor() {
    super();
    this.initializeRiverFlows();
    this.connectToEventBus();
  }

  /**
   * Initialize river flows
   * Roots connecting to data sources
   */
  private initializeRiverFlows(): void {
    const flows: RiverFlow[] = [
      {
        id: 'user-activity-river',
        name: 'User Activity River',
        source: 'user-service',
        destination: 'analytics-service',
        flowType: 'stream',
        status: 'flowing',
        throughput: 0,
        latency: 0,
      },
      {
        id: 'learning-progress-river',
        name: 'Learning Progress River',
        source: 'lms-service',
        destination: 'chronicle-service',
        flowType: 'stream',
        status: 'flowing',
        throughput: 0,
        latency: 0,
      },
      {
        id: 'financial-transactions-river',
        name: 'Financial Transactions River',
        source: 'wallet-service',
        destination: 'ledger-service',
        flowType: 'event',
        status: 'flowing',
        throughput: 0,
        latency: 0,
      },
      {
        id: 'ai-insights-river',
        name: 'AI Insights River',
        source: 'ai-service',
        destination: 'dashboard-service',
        flowType: 'stream',
        status: 'flowing',
        throughput: 0,
        latency: 0,
      },
      {
        id: 'system-events-river',
        name: 'System Events River',
        source: 'api-gateway',
        destination: 'nexus-service',
        flowType: 'event',
        status: 'flowing',
        throughput: 0,
        latency: 0,
      },
    ];

    flows.forEach(flow => {
      this.flows.set(flow.id, flow);
    });

    this.emit('flows-initialized', { count: flows.length });
  }

  /**
   * Connect to event bus
   * Rivers flow through the event system
   */
  private connectToEventBus(): void {
    // Subscribe to events and route through rivers
    eventBus.on('*', (event: any) => {
      this.routeEventToRivers(event);
    });
  }

  /**
   * Route event to appropriate rivers
   */
  private routeEventToRivers(event: any): void {
    const eventType = event.type || '';
    
    // Route based on event type
    if (eventType.includes('user') || eventType.includes('activity')) {
      this.flowThroughRiver('user-activity-river', event);
    }
    if (eventType.includes('learning') || eventType.includes('progress')) {
      this.flowThroughRiver('learning-progress-river', event);
    }
    if (eventType.includes('transaction') || eventType.includes('financial')) {
      this.flowThroughRiver('financial-transactions-river', event);
    }
    if (eventType.includes('ai') || eventType.includes('insight')) {
      this.flowThroughRiver('ai-insights-river', event);
    }
    // All events flow through system events river
    this.flowThroughRiver('system-events-river', event);
  }

  /**
   * Flow data through a river
   */
  private flowThroughRiver(flowId: string, data: any): void {
    const flow = this.flows.get(flowId);
    if (!flow || flow.status !== 'flowing') {
      return;
    }

    const startTime = Date.now();
    
    // Emit river event
    const riverEvent: RiverEvent = {
      flowId,
      data,
      timestamp: new Date(),
      priority: 'medium',
    };

    this.emit('river-flow', riverEvent);
    
    // Update flow metrics
    const latency = Date.now() - startTime;
    flow.latency = latency;
    flow.throughput += 1;

    // Forward to destination via event bus
    eventBus.publish(`${flow.destination}.river.${flowId}`, data);
  }

  /**
   * Create new river flow
   */
  createFlow(flow: Omit<RiverFlow, 'throughput' | 'latency'>): RiverFlow {
    const newFlow: RiverFlow = {
      ...flow,
      throughput: 0,
      latency: 0,
    };
    
    this.flows.set(flow.id, newFlow);
    this.emit('flow-created', { flowId: flow.id });
    
    return newFlow;
  }

  /**
   * Get flow status
   */
  getFlowStatus(flowId: string): RiverFlow | null {
    return this.flows.get(flowId) || null;
  }

  /**
   * Get all flows
   */
  getAllFlows(): RiverFlow[] {
    return Array.from(this.flows.values());
  }

  /**
   * Get network status
   */
  getNetworkStatus(): {
    totalFlows: number;
    flowingFlows: number;
    totalThroughput: number;
    averageLatency: number;
  } {
    const flowingFlows = Array.from(this.flows.values()).filter(f => f.status === 'flowing');
    const totalThroughput = flowingFlows.reduce((sum, f) => sum + f.throughput, 0);
    const averageLatency = flowingFlows.length > 0
      ? flowingFlows.reduce((sum, f) => sum + f.latency, 0) / flowingFlows.length
      : 0;

    return {
      totalFlows: this.flows.size,
      flowingFlows: flowingFlows.length,
      totalThroughput,
      averageLatency,
    };
  }
}

// Export singleton
export const riverFlows = new RiverDataFlows();

export default RiverDataFlows;
