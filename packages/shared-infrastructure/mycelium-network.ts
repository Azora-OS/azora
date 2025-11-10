/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

MYCELIUM NETWORK LAYER
Connected to networks of mycelium - Interconnected service mesh
*/

import { EventEmitter } from 'events';
import { getServiceRegistry, ServiceRegistry } from '@azora/shared-services/service-registry';
import { eventBus } from '@azora/shared-services/event-bus';

export interface MyceliumNode {
  id: string;
  serviceName: string;
  connections: string[];
  health: 'healthy' | 'degraded' | 'disconnected';
  messageCount: number;
  lastMessage: Date;
}

export interface MyceliumMessage {
  from: string;
  to: string[];
  data: any;
  timestamp: Date;
  hops: number;
  path: string[];
}

/**
 * Mycelium Network Layer
 * Connected networks of mycelium - Interconnected services
 */
export class MyceliumNetwork extends EventEmitter {
  private nodes: Map<string, MyceliumNode> = new Map();
  private messageHistory: MyceliumMessage[] = [];
  private serviceRegistry: ServiceRegistry;

  constructor() {
    super();
    this.serviceRegistry = getServiceRegistry();
    this.initializeMyceliumNetwork();
    this.connectToEventBus();
  }

  /**
   * Initialize mycelium network
   * Connect all services in a mesh
   */
  private initializeMyceliumNetwork(): void {
    // Discover services from registry
    const services = [
      'api-gateway',
      'auth-service',
      'lms-service',
      'retail-ai-service',
      'institutional-service',
      'wallet-service',
      'chronicle-service',
      'nexus-service',
      'analytics-service',
      'ai-service',
    ];

    services.forEach(serviceName => {
      const node: MyceliumNode = {
        id: `mycelium-${serviceName}`,
        serviceName,
        connections: [],
        health: 'healthy',
        messageCount: 0,
        lastMessage: new Date(),
      };
      
      this.nodes.set(node.id, node);
    });

    // Establish connections (mycelium network)
    this.establishConnections();
    
    this.emit('network-initialized', { nodeCount: this.nodes.size });
  }

  /**
   * Establish connections between nodes
   * Mycelium forms interconnected network
   */
  private establishConnections(): void {
    const nodeArray = Array.from(this.nodes.values());
    
    // Each node connects to multiple others (mycelium structure)
    nodeArray.forEach(node => {
      const connections: string[] = [];
      
      // Connect to 3-5 other nodes (mycelium network)
      const otherNodes = nodeArray
        .filter(n => n.id !== node.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 3);
      
      otherNodes.forEach(otherNode => {
        connections.push(otherNode.id);
        // Bidirectional connection
        const otherNodeData = this.nodes.get(otherNode.id);
        if (otherNodeData && !otherNodeData.connections.includes(node.id)) {
          otherNodeData.connections.push(node.id);
        }
      });
      
      node.connections = connections;
    });

    this.emit('connections-established', { 
      totalConnections: Array.from(this.nodes.values())
        .reduce((sum, n) => sum + n.connections.length, 0) / 2 
    });
  }

  /**
   * Connect to event bus
   * Mycelium network routes through events
   */
  private connectToEventBus(): void {
    eventBus.on('*', (event: any) => {
      this.routeThroughMycelium(event);
    });
  }

  /**
   * Route message through mycelium network
   */
  private routeThroughMycelium(event: any): void {
    const sourceService = event.metadata?.service || 'unknown';
    const sourceNode = Array.from(this.nodes.values())
      .find(n => n.serviceName === sourceService);

    if (!sourceNode) {
      return;
    }

    // Update source node
    sourceNode.messageCount += 1;
    sourceNode.lastMessage = new Date();

    // Route to connected nodes
    const message: MyceliumMessage = {
      from: sourceNode.id,
      to: sourceNode.connections,
      data: event,
      timestamp: new Date(),
      hops: 0,
      path: [sourceNode.id],
    };

    this.propagateMessage(message);
    this.messageHistory.push(message);
    
    // Keep history limited
    if (this.messageHistory.length > 1000) {
      this.messageHistory.shift();
    }
  }

  /**
   * Propagate message through network
   */
  private propagateMessage(message: MyceliumMessage, maxHops: number = 3): void {
    if (message.hops >= maxHops) {
      return;
    }

    message.to.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (!node || message.path.includes(nodeId)) {
        return; // Avoid loops
      }

      // Update node
      node.messageCount += 1;
      node.lastMessage = new Date();

      // Create new message for next hop
      const nextMessage: MyceliumMessage = {
        ...message,
        hops: message.hops + 1,
        path: [...message.path, nodeId],
        to: node.connections.filter(id => !message.path.includes(id)),
      };

      // Emit to connected service
      eventBus.publish(`${node.serviceName}.mycelium.message`, {
        ...message.data,
        myceliumPath: nextMessage.path,
        hops: nextMessage.hops,
      });

      // Continue propagation
      if (nextMessage.to.length > 0 && nextMessage.hops < maxHops) {
        this.propagateMessage(nextMessage, maxHops);
      }
    });
  }

  /**
   * Get node status
   */
  getNodeStatus(nodeId: string): MyceliumNode | null {
    return this.nodes.get(nodeId) || null;
  }

  /**
   * Get network topology
   */
  getNetworkTopology(): {
    nodes: MyceliumNode[];
    totalConnections: number;
    averageConnections: number;
    networkHealth: 'healthy' | 'degraded' | 'fragmented';
  } {
    const nodes = Array.from(this.nodes.values());
    const totalConnections = nodes.reduce((sum, n) => sum + n.connections.length, 0) / 2;
    const averageConnections = nodes.length > 0 ? totalConnections / nodes.length : 0;
    const healthyNodes = nodes.filter(n => n.health === 'healthy').length;
    
    let networkHealth: 'healthy' | 'degraded' | 'fragmented';
    if (healthyNodes === nodes.length) {
      networkHealth = 'healthy';
    } else if (healthyNodes >= nodes.length * 0.7) {
      networkHealth = 'degraded';
    } else {
      networkHealth = 'fragmented';
    }

    return {
      nodes,
      totalConnections,
      averageConnections,
      networkHealth,
    };
  }

  /**
   * Health check all nodes
   */
  async checkNetworkHealth(): Promise<void> {
    for (const [id, node] of this.nodes.entries()) {
      try {
        const serviceInfo = this.serviceRegistry.getService(node.serviceName);
        if (serviceInfo && serviceInfo.health === 'healthy') {
          node.health = 'healthy';
        } else {
          node.health = 'degraded';
        }
      } catch (error) {
        node.health = 'disconnected';
      }
    }

    this.emit('network-health-updated', this.getNetworkTopology());
  }

  /**
   * Start health monitoring
   */
  startHealthMonitoring(intervalMs: number = 30000): void {
    setInterval(() => {
      this.checkNetworkHealth();
    }, intervalMs);
    
    // Initial check
    this.checkNetworkHealth();
  }
}

// Export singleton
export const myceliumNetwork = new MyceliumNetwork();

// Start health monitoring
myceliumNetwork.startHealthMonitoring();

export default MyceliumNetwork;
