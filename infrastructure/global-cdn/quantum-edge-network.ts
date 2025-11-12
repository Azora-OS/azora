import { createHash } from 'crypto';

interface EdgeNode {
  id: string;
  region: string;
  lat: number;
  lon: number;
  load: number;
  health: number;
}

const EDGE_NODES: EdgeNode[] = [
  { id: 'us-east', region: 'Virginia', lat: 37.4, lon: -78.6, load: 0, health: 1 },
  { id: 'us-west', region: 'Oregon', lat: 45.5, lon: -122.6, load: 0, health: 1 },
  { id: 'eu-west', region: 'Ireland', lat: 53.3, lon: -6.2, load: 0, health: 1 },
  { id: 'ap-south', region: 'Mumbai', lat: 19.0, lon: 72.8, load: 0, health: 1 },
  { id: 'ap-east', region: 'Tokyo', lat: 35.6, lon: 139.6, load: 0, health: 1 },
  { id: 'sa-east', region: 'SaoPaulo', lat: -23.5, lon: -46.6, load: 0, health: 1 }
];

class QuantumEdgeCDN {
  private cache = new Map<string, { data: any; exp: number; nodes: Set<string> }>();
  private nodeHealth = new Map<string, number>();

  constructor() {
    EDGE_NODES.forEach(n => this.nodeHealth.set(n.id, 1));
    setInterval(() => this.healthCheck(), 5000);
  }

  route(userLat: number, userLon: number): EdgeNode {
    const healthy = EDGE_NODES.filter(n => (this.nodeHealth.get(n.id) || 0) > 0.5);
    return healthy.reduce((best, node) => {
      const dist = Math.sqrt((node.lat - userLat) ** 2 + (node.lon - userLon) ** 2);
      const score = dist * (2 - node.health) + node.load * 0.1;
      const bestDist = Math.sqrt((best.lat - userLat) ** 2 + (best.lon - userLon) ** 2);
      const bestScore = bestDist * (2 - best.health) + best.load * 0.1;
      return score < bestScore ? node : best;
    });
  }

  async get(key: string, userLat: number, userLon: number): Promise<any> {
    const node = this.route(userLat, userLon);
    const cached = this.cache.get(key);
    
    if (cached && cached.exp > Date.now() && cached.nodes.has(node.id)) {
      node.load = Math.max(0, node.load - 0.01);
      return cached.data;
    }
    
    node.load += 0.1;
    return null;
  }

  set(key: string, data: any, ttl = 3600): void {
    const exp = Date.now() + ttl * 1000;
    const nodes = new Set(EDGE_NODES.map(n => n.id));
    this.cache.set(key, { data, exp, nodes });
  }

  private healthCheck(): void {
    EDGE_NODES.forEach(node => {
      const health = Math.random() > 0.001 ? 1 : 0.3;
      this.nodeHealth.set(node.id, health);
      node.health = health;
      node.load = Math.max(0, node.load * 0.95);
    });
  }

  getUptime(): number {
    const healthy = Array.from(this.nodeHealth.values()).filter(h => h > 0.5).length;
    return (healthy / EDGE_NODES.length) * 100;
  }
}

export const cdn = new QuantumEdgeCDN();
