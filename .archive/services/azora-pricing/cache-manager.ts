/**
 * CACHE MANAGER
 * 
 * Reduces external API calls and improves performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// ============================================================================
// CACHE STORE
// ============================================================================

class CacheManager {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;
  
  constructor(maxSize: number = 10000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    
    // Clean expired entries every 5 minutes
    setInterval(() => this.cleanExpired(), 5 * 60 * 1000);
  }
  
  /**
   * Get cached value
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data as T;
  }
  
  /**
   * Set cached value
   */
  set<T>(key: string, data: T, ttl: number): void {
    // Enforce max size (simple LRU)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }
  
  /**
   * Delete cached value
   */
  delete(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Clean expired entries
   */
  private cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.calculateHitRate()
    };
  }
  
  private hits: number = 0;
  private misses: number = 0;
  
  private calculateHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : (this.hits / total) * 100;
  }
  
  incrementHit(): void {
    this.hits++;
  }
  
  incrementMiss(): void {
    this.misses++;
  }
}

// ============================================================================
// GLOBAL CACHE INSTANCE
// ============================================================================

export const cache = new CacheManager(10000);

// ============================================================================
// CACHE TTL CONFIGURATIONS
// ============================================================================

export const CACHE_TTL = {
  // Exchange rates: 1 hour (they don't change that often)
  EXCHANGE_RATES: 60 * 60 * 1000,
  
  // User location: 24 hours (IP location doesn't change frequently)
  USER_LOCATION: 24 * 60 * 60 * 1000,
  
  // Pricing tier: 24 hours (rarely changes)
  PRICING_TIER: 24 * 60 * 60 * 1000,
  
  // Country configuration: 7 days (static data)
  COUNTRY_CONFIG: 7 * 24 * 60 * 60 * 1000,
  
  // Currency info: 7 days (static data)
  CURRENCY_INFO: 7 * 24 * 60 * 60 * 1000
};

// ============================================================================
// CACHED FETCH WRAPPER
// ============================================================================

/**
 * Fetch with caching
 */
export async function cachedFetch<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number
): Promise<T> {
  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== null) {
    cache.incrementHit();
    return cached;
  }
  
  // Cache miss, fetch fresh data
  cache.incrementMiss();
  const data = await fetchFn();
  
  // Store in cache
  cache.set(key, data, ttl);
  
  return data;
}

// ============================================================================
// SPECIFIC CACHE FUNCTIONS
// ============================================================================

/**
 * Cache exchange rates
 */
export async function getCachedExchangeRates(
  fetchFn: () => Promise<Record<string, number>>
): Promise<Record<string, number>> {
  return cachedFetch('exchange-rates', fetchFn, CACHE_TTL.EXCHANGE_RATES);
}

/**
 * Cache user location by IP
 */
export async function getCachedUserLocation(
  ip: string,
  fetchFn: () => Promise<any>
): Promise<any> {
  const key = `location:${ip}`;
  return cachedFetch(key, fetchFn, CACHE_TTL.USER_LOCATION);
}

/**
 * Cache pricing for country
 */
export async function getCachedPricing(
  countryCode: string,
  fetchFn: () => Promise<any>
): Promise<any> {
  const key = `pricing:${countryCode}`;
  return cachedFetch(key, fetchFn, CACHE_TTL.PRICING_TIER);
}

// ============================================================================
// CACHE WARMING (Pre-populate cache with common data)
// ============================================================================

export async function warmCache(): Promise<void> {
  console.log('🔥 Warming cache with frequently accessed data...');
  
  // Pre-cache exchange rates
  try {
    const rates = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then(res => res.json())
      .then(data => data.rates);
    
    cache.set('exchange-rates', rates, CACHE_TTL.EXCHANGE_RATES);
    console.log('✅ Exchange rates cached');
  } catch (error) {
    console.error('❌ Failed to warm exchange rates cache:', error);
  }
  
  // Pre-cache pricing for top countries
  const topCountries = [
    'US', 'ZA', 'NG', 'KE', 'GB', 'DE', 'IN', 'BR', 'CN', 'AU'
  ];
  
  for (const country of topCountries) {
    // This would normally call your pricing tier function
    // cache.set(`pricing:${country}`, pricingData, CACHE_TTL.PRICING_TIER);
  }
  
  console.log('✅ Cache warming complete');
}

// ============================================================================
// CACHE INVALIDATION
// ============================================================================

/**
 * Invalidate specific cache keys
 */
export function invalidateCache(pattern: string): void {
  const keysToDelete: string[] = [];
  
  for (const [key] of cache['cache'].entries()) {
    if (key.includes(pattern)) {
      keysToDelete.push(key);
    }
  }
  
  for (const key of keysToDelete) {
    cache.delete(key);
  }
  
  console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries matching "${pattern}"`);
}

/**
 * Force refresh exchange rates
 */
export function refreshExchangeRates(): void {
  invalidateCache('exchange-rates');
  console.log('💱 Exchange rates cache invalidated - will refresh on next request');
}

/**
 * Force refresh pricing for specific country
 */
export function refreshCountryPricing(countryCode: string): void {
  cache.delete(`pricing:${countryCode}`);
  console.log(`💰 Pricing cache invalidated for ${countryCode}`);
}

export default {
  cache,
  cachedFetch,
  getCachedExchangeRates,
  getCachedUserLocation,
  getCachedPricing,
  warmCache,
  invalidateCache,
  refreshExchangeRates,
  refreshCountryPricing,
  CACHE_TTL
};
