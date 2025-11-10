/*
AZORA PROPRIETARY LICENSE
Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

TREE STRUCTURE ARCHITECTURE
Roots by the rivers, branches across Africa - Hierarchical distributed system
*/

import { EventEmitter } from 'events';
import { africaCDN } from './africa-cdn';
import { riverFlows } from './river-flows';
import { myceliumNetwork } from './mycelium-network';

export interface TreeRoot {
  id: string;
  name: string;
  type: 'data' | 'compute' | 'storage' | 'network';
  location: string;
  connections: string[];
  health: 'healthy' | 'degraded' | 'down';
}

export interface TreeBranch {
  id: string;
  name: string;
  region: string;
  rootId: string;
  endpoints: string[];
  capacity: number;
  health: 'healthy' | 'degraded' | 'down';
}

export interface TreeStatus {
  roots: TreeRoot[];
  branches: TreeBranch[];
  networkHealth: 'healthy' | 'degraded' | 'fragmented';
  totalCapacity: number;
  activeConnections: number;
}

/**
 * Tree Structure Architecture
 * Roots by the rivers, branches across Africa
 */
export class TreeArchitecture extends EventEmitter {
  private roots: Map<string, TreeRoot> = new Map();
  private branches: Map<string, TreeBranch> = new Map();
  private rootConnections: Map<string, string[]> = new Map();

  constructor() {
    super();
    this.initializeTreeStructure();
    this.connectInfrastructure();
  }

  /**
   * Initialize tree structure
   * Roots by the rivers (data sources)
   */
  private initializeTreeStructure(): void {
    // Roots - Data sources by rivers
    const roots: TreeRoot[] = [
      {
        id: 'root-data-primary',
        name: 'Primary Data Root',
        type: 'data',
        location: 'southern-africa',
        connections: [],
        health: 'healthy',
      },
      {
        id: 'root-compute-primary',
        name: 'Primary Compute Root',
        type: 'compute',
        location: 'southern-africa',
        connections: [],
        health: 'healthy',
      },
      {
        id: 'root-storage-primary',
        name: 'Primary Storage Root',
        type: 'storage',
        location: 'southern-africa',
        connections: [],
        health: 'healthy',
      },
      {
        id: 'root-network-primary',
        name: 'Primary Network Root',
        type: 'network',
        location: 'southern-africa',
        connections: [],
        health: 'healthy',
      },
    ];

    roots.forEach(root => {
      this.roots.set(root.id, root);
    });

    // Establish root connections (rivers connect roots)
    this.establishRootConnections();

    // Branches - Stretching across Africa
    const cdnStatus = africaCDN.getNetworkStatus();
    cdnStatus.regions.forEach(region => {
      const branch: TreeBranch = {
        id: `branch-${region}`,
        name: `${region} Branch`,
        region,
        rootId: 'root-network-primary',
        endpoints: [],
        capacity: cdnStatus.nodesByRegion[region] * 100,
        health: 'healthy',
      };
      
      this.branches.set(branch.id, branch);
    });

    this.emit('tree-initialized', { 
      rootCount: roots.length, 
      branchCount: this.branches.size 
    });
  }

  /**
   * Establish root connections
   * Rivers connect the roots
   */
  private establishRootConnections(): void {
    const rootArray = Array.from(this.roots.values());
    
    // Each root connects to others (rivers flow between them)
    rootArray.forEach(root => {
      const connections = rootArray
        .filter(r => r.id !== root.id && r.type !== root.type)
        .map(r => r.id);
      
      root.connections = connections;
      this.rootConnections.set(root.id, connections);
    });
  }

  /**
   * Connect infrastructure layers
   * Tree connects CDN, Rivers, and Mycelium
   */
  private connectInfrastructure(): void {
    // Connect CDN branches to tree branches
    africaCDN.on('node-health-updated', (data: any) => {
      this.updateBranchHealth(data.nodeId, data.health);
    });

    // Connect river flows to roots
    riverFlows.on('river-flow', (event: any) => {
      this.routeThroughRoots(event);
    });

    // Connect mycelium network to branches
    myceliumNetwork.on('network-health-updated', (topology: any) => {
      this.updateNetworkHealth(topology);
    });
  }

  /**
   * Update branch health
   */
  private updateBranchHealth(nodeId: string, health: string): void {
    // Find corresponding branch and update health
    const branch = Array.from(this.branches.values())
      .find(b => nodeId.includes(b.region));
    
    if (branch) {
      branch.health = health as 'healthy' | 'degraded' | 'down';
      this.emit('branch-health-updated', { branchId: branch.id, health });
    }
  }

  /**
   * Route data through roots
   */
  private routeThroughRoots(event: any): void {
    // Route based on data type
    const flowType = event.flowId || '';
    
    if (flowType.includes('data')) {
      const root = this.roots.get('root-data-primary');
      if (root) {
        root.health = 'healthy';
      }
    }
    
    if (flowType.includes('compute')) {
      const root = this.roots.get('root-compute-primary');
      if (root) {
        root.health = 'healthy';
      }
    }
  }

  /**
   * Update network health
   */
  private updateNetworkHealth(topology: any): void {
    // Update tree health based on mycelium network
    if (topology.networkHealth === 'healthy') {
      Array.from(this.roots.values()).forEach(root => {
        if (root.health !== 'down') {
          root.health = 'healthy';
        }
      });
    }
  }

  /**
   * Get tree status
   */
  getTreeStatus(): TreeStatus {
    const roots = Array.from(this.roots.values());
    const branches = Array.from(this.branches.values());
    const healthyRoots = roots.filter(r => r.health === 'healthy').length;
    const healthyBranches = branches.filter(b => b.health === 'healthy').length;
    
    let networkHealth: 'healthy' | 'degraded' | 'fragmented';
    if (healthyRoots === roots.length && healthyBranches === branches.length) {
      networkHealth = 'healthy';
    } else if (healthyRoots >= roots.length * 0.7 && healthyBranches >= branches.length * 0.7) {
      networkHealth = 'degraded';
    } else {
      networkHealth = 'fragmented';
    }

    const totalCapacity = branches.reduce((sum, b) => sum + b.capacity, 0);
    const activeConnections = roots.reduce((sum, r) => sum + r.connections.length, 0);

    return {
      roots,
      branches,
      networkHealth,
      totalCapacity,
      activeConnections,
    };
  }

  /**
   * Get infrastructure status
   */
  getInfrastructureStatus(): {
    tree: TreeStatus;
    cdn: any;
    rivers: any;
    mycelium: any;
  } {
    return {
      tree: this.getTreeStatus(),
      cdn: africaCDN.getNetworkStatus(),
      rivers: riverFlows.getNetworkStatus(),
      mycelium: myceliumNetwork.getNetworkTopology(),
    };
  }
}

// Export singleton
export const treeArchitecture = new TreeArchitecture();

export default TreeArchitecture;
