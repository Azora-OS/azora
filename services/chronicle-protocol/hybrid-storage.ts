class HybridStorage {
  getStats() {
    return {
      memoriesInCache: 0,
      thoughtsInCache: 0,
      memoriesOnChain: 0,
      thoughtsOnChain: 0,
      cacheHitRate: 0,
      evolutionLevel: 0,
    };
  }
}

export const hybridStorage = new HybridStorage();
