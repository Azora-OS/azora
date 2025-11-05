# 🔒 AZORA PRICING SECURITY & MANAGEMENT

## Overview

The Azora Pricing System includes comprehensive security measures, abuse prevention, and administrative controls to ensure fair pricing, prevent fraud, and maintain system health.

---

## 🛡️ Security Features

### 1. Rate Limiting

**Purpose**: Prevent API abuse and excessive requests

**Limits**:
- **Pricing Endpoint**: 10 requests/minute per IP
- **Currency Conversion**: 20 requests/minute per IP
- **Location Detection**: 5 requests/minute per IP (expensive API)
- **Payment Processing**: 3 requests/minute per IP

**Blocking**:
- Exceeding limits results in temporary blocks (5-15 minutes)
- Multiple violations increase block duration
- Rate limit headers provided in responses

**Implementation**:
```typescript
import { checkRateLimit } from './rate-limiter';

const result = checkRateLimit(ip, userAgent, 'PRICING');
if (!result.allowed) {
  throw new Error(result.reason);
}
```

### 2. Fraud Detection

**Indicators** (scored 0-100):
- Suspicious IP addresses (VPNs, proxies, private IPs): +30
- Missing or suspicious user agents: +20
- Rapid location changes (< 5 minutes): +40
- Multiple tier switches: +20

**Actions**:
- Score 30-50: Log warning
- Score 50-70: Enhanced monitoring
- Score 70+: Block request

**Example**:
```typescript
const fraudIndicator = detectFraudulentBehavior(ip, userAgent, requestData);
if (fraudIndicator.score > 70) {
  throw new Error('Request blocked due to suspicious activity');
}
```

### 3. Request Validation

**Checks**:
- Country code format (ISO 3166-1 alpha-2)
- Currency code format (ISO 4217)
- No custom pricing manipulation
- Valid discount ranges (0-100%)
- Required fields present

**Example**:
```typescript
const validation = validatePricingRequest(requestData);
if (!validation.valid) {
  throw new Error(validation.error);
}
```

### 4. Caching System

**Purpose**: Reduce external API calls and improve performance

**Cache TTL**:
- Exchange Rates: 1 hour
- User Location: 24 hours
- Pricing Tier: 24 hours
- Country Config: 7 days
- Currency Info: 7 days

**Benefits**:
- Faster response times
- Lower API costs
- Protection against API downtime
- Reduced load on external services

**Cache Stats**:
```typescript
import { cache } from './cache-manager';

const stats = cache.getStats();
console.log(`Cache hit rate: ${stats.hitRate}%`);
```

---

## 👨‍💼 Admin Controls

### 1. Pricing Overrides

**Purpose**: Temporarily adjust pricing for specific countries

**Use Cases**:
- Market entry promotions
- Emergency economic situations
- Competitive response
- Special partnerships

**Example**:
```typescript
import { createPricingOverride } from './admin-controls';

createPricingOverride({
  countryCode: 'ZA',
  discountPercent: 20,
  validFrom: new Date('2025-11-01'),
  validUntil: new Date('2025-12-31'),
  reason: 'Black Friday promotion',
  createdBy: 'admin@azora.world',
  active: true
});
```

### 2. Promotions & Coupons

**Purpose**: Create global or targeted discount campaigns

**Features**:
- Coupon codes
- Country-specific promotions
- Tier-specific discounts
- Usage limits
- Time-bound campaigns

**Example**:
```typescript
import { createPromotion } from './admin-controls';

createPromotion({
  name: 'African Student Scholarship',
  discountPercent: 50,
  couponCode: 'AFRICA50',
  applicableCountries: ['ZA', 'NG', 'KE', 'GH'],
  applicableTiers: ['TIER_3', 'TIER_4'],
  validFrom: new Date('2025-11-01'),
  validUntil: new Date('2025-12-31'),
  maxUses: 1000,
  active: true,
  createdBy: 'admin@azora.world'
});
```

### 3. Emergency Controls

**Purpose**: Quickly disable features during incidents

**Available Controls**:
- `disablePricing`: Stop all pricing requests
- `forceDefaultTier`: Force all users to default tier
- `disableDiscounts`: Disable all coupons/promotions
- `disablePayments`: Stop payment processing

**Example**:
```typescript
import { enableEmergencyControl } from './admin-controls';

// Enable during incident
enableEmergencyControl(
  'disablePricing',
  'Currency API outage - preventing incorrect pricing',
  'admin@azora.world'
);

// Disable when resolved
disableEmergencyControl('disablePricing');
```

---

## 📊 Monitoring & Analytics

### 1. Request Logging

**All pricing requests are logged with**:
- Timestamp
- IP address
- User agent
- Country & currency
- Pricing tier
- Final price
- Fraud score
- Success/failure

**Retention**: Last 10,000 requests in memory (send to proper logging service in production)

### 2. Analytics Dashboard

```typescript
import { getPricingAnalytics } from './admin-controls';

const analytics = getPricingAnalytics();
console.log(analytics);
```

**Metrics**:
- Total requests (24h)
- Requests by country
- Requests by tier
- Average prices
- Coupon redemptions
- Active overrides
- Fraud attempts
- Cache hit rate

### 3. Health Checks

```typescript
import { healthCheck } from './admin-controls';

const health = await healthCheck();
// Returns: 'healthy' | 'degraded' | 'unhealthy'
```

**Checks**:
- Cache availability
- Rate limiter functionality
- Exchange rate API connectivity
- Emergency controls status

---

## 🚨 Incident Response

### High Fraud Score Alert

1. Review request logs for patterns
2. Check if legitimate user affected by false positive
3. Adjust fraud detection thresholds if needed
4. Block suspicious IPs at firewall level

### Exchange Rate API Failure

1. System automatically falls back to static rates
2. Enable `forceDefaultTier` if needed
3. Monitor for API recovery
4. Invalidate cache when API recovers

### Price Manipulation Attempt

1. Request automatically blocked
2. Incident logged with full details
3. Review logs for patterns
4. Update validation rules if needed

### Excessive Rate Limit Violations

1. IP automatically blocked
2. Review if legitimate user (e.g., corporate proxy)
3. Create whitelist if needed
4. Adjust rate limits for specific use cases

---

## 🔧 Configuration

### Environment Variables

```bash
# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=10

# Caching
CACHE_MAX_SIZE=10000
EXCHANGE_RATE_TTL=3600000

# Security
FRAUD_THRESHOLD=70
BLOCK_VPN_IPS=true

# External APIs
IPAPI_KEY=your_key_here
EXCHANGE_API_KEY=your_key_here
```

### Production Recommendations

1. **Use Redis for caching** (instead of in-memory)
2. **Use Redis for rate limiting** (distributed)
3. **Integrate with logging service** (Datadog, CloudWatch)
4. **Set up alerting** (PagerDuty, Slack)
5. **Use CDN for static pricing data** (Cloudflare)
6. **Implement IP whitelisting** for corporate users
7. **Use proper secrets management** (AWS Secrets Manager)

---

## 📝 Best Practices

### 1. Regular Audits
- Review pricing overrides monthly
- Clean up expired promotions
- Analyze fraud patterns
- Optimize cache hit rates

### 2. Monitoring
- Set up alerts for:
  - High fraud scores (> 50)
  - Low cache hit rates (< 80%)
  - API failures
  - Excessive rate limit violations

### 3. Testing
- Test rate limiting with load tests
- Verify fraud detection with known patterns
- Test emergency controls regularly
- Validate coupon codes before campaigns

### 4. Documentation
- Document all pricing overrides
- Log reasons for emergency controls
- Maintain promotion history
- Track fraud incidents

---

## 🎯 Performance Targets

| Metric | Target | Current |
|--------|--------|---------|
| Cache Hit Rate | > 85% | Varies |
| API Response Time | < 200ms | Varies |
| Fraud Detection Accuracy | > 95% | Monitoring |
| Rate Limit False Positives | < 1% | Monitoring |
| System Uptime | 99.9% | Target |

---

## 📚 Related Documentation

- [Pricing Strategy](../business/AZORA-PRICING-STRATEGY.md)
- [Currency Converter](../../services/azora-pricing/currency-converter.ts)
- [Rate Limiter](../../services/azora-pricing/rate-limiter.ts)
- [Admin Controls](../../services/azora-pricing/admin-controls.ts)

---

**Last Updated**: 2025-11-05
**Owner**: Azora Security Team
**Contact**: security@azora.world
