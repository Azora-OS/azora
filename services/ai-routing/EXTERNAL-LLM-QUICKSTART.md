# External LLM Service - Quick Start Guide

## Installation

The External LLM Service is part of the AI Routing system. No additional installation needed beyond the main project setup.

## Basic Usage

### 1. Initialize the Service

```typescript
import { ExternalLLMService } from './services/ai-routing';

const externalLLMService = new ExternalLLMService({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  maxTokens: 2000,
  temperature: 0.7,
  topP: 0.9,
  cacheTTL: 3600 // 1 hour
});
```

### 2. Process a Query

```typescript
const response = await externalLLMService.processQuery({
  query: 'Develop a comprehensive strategy for scaling an education platform',
  userId: 'user-123',
  context: {
    marketSize: 'large',
    targetRegion: 'Africa'
  }
});

console.log('Response:', response.content);
console.log('Cost:', response.cost);
console.log('Cached:', response.cached);
console.log('Response Time:', response.responseTime, 'ms');
```

### 3. Track Costs

```typescript
// Get cost tracking data
const tracking = externalLLMService.getCostTracking();
console.log('Total Cost:', tracking.totalCost);
console.log('Total Requests:', tracking.totalRequests);
console.log('Average Cost per Request:', tracking.averageCostPerRequest);

// Get daily cost
const today = new Date().toISOString().split('T')[0];
const dailyCost = externalLLMService.getCostByDate(today);
console.log('Today\'s Cost:', dailyCost);
```

### 4. Manage Cache

```typescript
// Get cache statistics
const stats = externalLLMService.getCacheStats();
console.log('Cached Queries:', stats.size);

// Clear cache
externalLLMService.clearCache();
```

## Integration with Hierarchical Router

```typescript
import { HierarchicalRouter, ExternalLLMService } from './services/ai-routing';

// Create external LLM service
const externalLLMService = new ExternalLLMService({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY
});

// Create hierarchical router with external LLM service
const router = new HierarchicalRouter(
  config,
  prisma,
  queryClassifier,
  localLLMService,
  rapSystem,
  externalLLMService // Route C
);

// Route complex queries automatically
const response = await router.route({
  query: 'Complex strategic analysis required'
});
```

## Configuration Options

```typescript
interface ExternalLLMConfig {
  provider: 'openai' | 'anthropic';  // LLM provider
  model: string;                      // Model name
  apiKey: string;                     // API key
  maxTokens?: number;                 // Max response tokens (default: 2000)
  temperature?: number;               // Creativity 0-1 (default: 0.7)
  topP?: number;                      // Diversity 0-1 (default: 0.9)
  cacheTTL?: number;                  // Cache TTL in seconds (default: 3600)
}
```

## Supported Models

### OpenAI
- `gpt-4` - Most capable, highest cost
- `gpt-4-turbo` - Faster, lower cost
- `gpt-3.5-turbo` - Cheapest, good for simple tasks

### Anthropic
- `claude-3-opus` - Most capable
- `claude-3-sonnet` - Balanced
- `claude-3-haiku` - Fastest, cheapest

## Cost Optimization Tips

1. **Use Caching**: Identical queries use cached responses (zero cost)
2. **Choose Right Model**: Use GPT-3.5 for simple queries, GPT-4 for complex
3. **Monitor Costs**: Track daily and model-specific costs
4. **Batch Queries**: Process multiple queries together
5. **Adjust Parameters**: Lower maxTokens if possible

## Example: Cost-Aware Query Processing

```typescript
const service = new ExternalLLMService({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  cacheTTL: 3600
});

// Process query
const response = await service.processQuery({
  query: 'Your query here'
});

// Check if cached (no cost)
if (response.cached) {
  console.log('Using cached response - no cost');
} else {
  console.log('API call cost:', response.cost);
}

// Monitor daily spending
const today = new Date().toISOString().split('T')[0];
const dailyCost = service.getCostByDate(today);
if (dailyCost > 10) {
  console.warn('Daily cost exceeds $10');
}
```

## Error Handling

```typescript
try {
  const response = await service.processQuery(query);
} catch (error) {
  if (error.message.includes('API Error')) {
    console.error('API Error - check API key and rate limits');
  } else if (error.message.includes('Network error')) {
    console.error('Network Error - check connection');
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## Testing

```bash
# Run unit tests
npm test -- services/ai-routing/__tests__/external-llm-service.test.ts

# Run integration tests
npm test -- tests/integration/external-llm-routing.test.ts
```

## Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...

# Optional
EXTERNAL_LLM_PROVIDER=openai
EXTERNAL_LLM_MODEL=gpt-4
EXTERNAL_LLM_MAX_TOKENS=2000
EXTERNAL_LLM_TEMPERATURE=0.7
EXTERNAL_LLM_CACHE_TTL=3600
```

## Common Issues

### High Costs
- Check cache hit rate
- Review query patterns
- Consider using cheaper models

### Slow Responses
- Check API latency
- Reduce maxTokens
- Use GPT-3.5 for faster responses

### API Errors
- Verify API key
- Check rate limits
- Ensure account has balance

## Next Steps

1. Review [EXTERNAL-LLM-SERVICE.md](./EXTERNAL-LLM-SERVICE.md) for detailed documentation
2. Check [HIERARCHICAL-ROUTER-README.md](./HIERARCHICAL-ROUTER-README.md) for router integration
3. Run tests to verify setup
4. Monitor costs and optimize queries

## Support

For issues or questions:
1. Check the troubleshooting section in EXTERNAL-LLM-SERVICE.md
2. Review test files for usage examples
3. Check error messages for specific guidance
