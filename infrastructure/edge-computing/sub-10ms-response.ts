interface CacheEntry {
  data: any;
  timestamp: number;
  hits: number;
}

class EdgeCompute {
  private cache = new Map<string, CacheEntry>();
  private readonly HOT_THRESHOLD = 10;
  private readonly TTL = 60000;

  async execute(key: string, fn: () => Promise<any>): Promise<{ data: any; latency: number }> {
    const start = performance.now();
    
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      cached.hits++;
      return { data: cached.data, latency: performance.now() - start };
    }

    const data = await fn();
    this.cache.set(key, { data, timestamp: Date.now(), hits: 1 });
    
    if (this.cache.size > 10000) {
      const coldKeys = Array.from(this.cache.entries())
        .filter(([_, v]) => v.hits < this.HOT_THRESHOLD)
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 1000)
        .map(([k]) => k);
      coldKeys.forEach(k => this.cache.delete(k));
    }

    return { data, latency: performance.now() - start };
  }

  preload(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now(), hits: 100 });
  }

  getStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      hot: entries.filter(e => e.hits >= this.HOT_THRESHOLD).length,
      avgHits: entries.reduce((s, e) => s + e.hits, 0) / entries.length || 0
    };
  }
}

export const edge = new EdgeCompute();
