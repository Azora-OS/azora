import { EventEmitter } from 'events';

interface MiningNode {
  id: string;
  hashRate: number;
  earnings: number;
  lastActive: Date;
}

export class DistributedMiningNetwork extends EventEmitter {
  private nodes = new Map<string, MiningNode>();
  private totalHashRate = 0;

  registerNode(deviceId: string, capabilities: number): string {
    const node: MiningNode = {
      id: deviceId,
      hashRate: capabilities,
      earnings: 0,
      lastActive: new Date()
    };
    this.nodes.set(deviceId, node);
    this.totalHashRate += capabilities;
    this.emit('nodeJoined', node);
    return deviceId;
  }

  submitWork(nodeId: string, shares: number): number {
    const node = this.nodes.get(nodeId);
    if (!node) return 0;
    
    const reward = (shares / this.totalHashRate) * 100;
    node.earnings += reward;
    node.lastActive = new Date();
    return reward;
  }

  getNetworkStats() {
    return {
      activeNodes: this.nodes.size,
      totalHashRate: this.totalHashRate,
      totalEarnings: Array.from(this.nodes.values()).reduce((sum, n) => sum + n.earnings, 0)
    };
  }
}
