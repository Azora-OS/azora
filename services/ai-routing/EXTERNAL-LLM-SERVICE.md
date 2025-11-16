# External LLM Service (Route C)

## Overview

The External LLM Service implements Route C of the hierarchical AI routing system, handling complex queries that require advanced reasoning capabilities. It provides OpenAI GPT-4 integration with comprehensive cost tracking, response caching, and API management.

## Features

- **Multi-Provider Support**: OpenAI and Anthropic integration
- **Cost Tracking**: Detailed cost tracking per API call, by model, and by date
- **Response Caching**: Automatic caching with configurable TTL to minimize API costs
- **API Management**: Validation, model listing, and dynamic configuration
- **Error Handling**: Graceful error handling with detailed error messages
- **Performance Metrics**: Response time and token usage tracking

## Architecture

```
External LLM Service
├── Query Processing
│   ├── Cache Check
│   ├── API Call (OpenAI/Anthropic)
│   ├── Cost Calculation
│   └── Response Caching
├── Cost Tracking
│   ├── Total Cost
│   ├── Cost by Model
│   ├── Cost by Date
│   └── Token Usage
└── Configuration Management
    ├── Provider Settings
    ├── Model Selection
    └── Cache TTL
```

## Usage

### Basic Setup

```typescript
import { ExternalLLMService } from './external-llm-service';

const service = new ExternalLLMService({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY,
  maxTokens: 2000,
  temperature: 0.7,
  topP: 0.9,
  cacheTTL: 3600 // 1 hour
});
```

### Processing Queries

```typescript
const query = {
  query: 'Develop a comprehensive strategy for scaling an education platform',
  userId: 'user-123',
  context: {
    marketSize: 'large',
    targetRegion: 'Africa'
  }
};

const response = await service.processQuery(query);

console.log('Response:', response.content);
console.log('Cost:', response.cost);
console.log('Cached:', response.cached);
console.log('Response Time:', response.responseTime, 'ms');
```

### Cost Tracking

```typescript
// Get overall cost tracking
const tracking = service.getCostTracking();
console.log('Total Cost:', tracking.totalCost);
console.log('Total Requests:', tracking.totalRequests);
console.log('Average Cost per Request:', tracking.averageCostPerRequest);

// Get cost for specific date
const todayCost = service.getCostByDate('2024-01-15');
console.log('Today\'s Cost:', todayCost);

// Get cost for specific model
const gpt4Cost = service.getCostByModel('gpt-4');
console.log('GPT-4 Cost:', gpt4Cost);

// Reset cost tracking for new billing period
service.resetCostTracking();
```

### Cache Management

```typescript
// Get cache statistics
const stats = service.getCacheStats();
console.log('Cache Size:', stats.size);
console.log('Cache Entries:', stats.entries);

// Get cache size
const size = service.getCacheSize();
console.log('Number of cached queries:', size);

// Clear cache
service.clearCache();
```

### Configuration Management

```typescript
// Get current configuration
const config = service.getConfig();
console.log('Current Model:', config.model);

// Update configuration
service.updateConfig({
  maxTokens: 4000,
  temperature: 0.5,
  model: 'gpt-4-turbo'
});

// Validate API key
const isValid = await service.validateApiKey();
console.log('API Key Valid:', isValid);

// Get available models
const models = await service.getAvailableModels();
console.log('Available Models:', models);
```

## Cost Calculation

### OpenAI Pricing

- **GPT-4**: $0.03 per 1K input tokens, $0.06 per 1K output tokens
- **GPT-4 Turbo**: $0.01 per 1K input tokens, $0.03 per 1K output tokens
- **GPT-3.5 Turbo**: $0.0005 per 1K input tokens, $0.0015 per 1K output tokens

### Anthropic Pricing

- **Claude 3 Opus**: $0.015 per 1K input tokens, $0.075 per 1K output tokens
- **Claude 3 Sonnet**: $0.003 per 1K input tokens, $0.015 per 1K output tokens
- **Claude 3 Haiku**: $0.00025 per 1K input tokens, $0.00125 per 1K output tokens

## Caching Strategy

The service implements intelligent caching to minimize API costs:

1. **Query Hashing**: Queries are hashed using SHA-256 for cache lookup
2. **TTL Management**: Cached responses expire after the configured TTL
3. **Cost Savings**: Cached responses have zero API cost
4. **Cache Statistics**: Track cache hits and misses for optimization

### Cache Example

```typescript
// First call - incurs API cost
const response1 = await service.processQuery({ query: 'What is AI?' });
console.log('Cached:', response1.cached); // false
console.log('Cost:', response1.cost); // > 0

// Second call - uses cache, no cost
const response2 = await service.processQuery({ query: 'What is AI?' });
console.log('Cached:', response2.cached); // true
console.log('Cost:', response2.cost); // 0
```

## Integration with Hierarchical Router

The External LLM Service is used as Route C in the hierarchical routing system:

```typescript
import { HierarchicalRouter } from './hierarchical-router';
import { ExternalLLMService } from './external-llm-service';

const externalLLMService = new ExternalLLMService({
  provider: 'openai',
  model: 'gpt-4',
  apiKey: process.env.OPENAI_API_KEY
});

const router = new HierarchicalRouter(
  config,
  prisma,
  queryClassifier,
  localLLMService,
  rapSystem,
  externalLLMService // Route C
);

// Complex queries automatically route to external LLM
const response = await router.route({
  query: 'Complex strategic analysis required'
});
```

## Error Handling

The service handles various error scenarios:

```typescript
try {
  const response = await service.processQuery(query);
} catch (error) {
  if (error.message.includes('API Error')) {
    console.error('API Error:', error);
    // Handle API errors (rate limits, invalid key, etc.)
  } else if (error.message.includes('Network error')) {
    console.error('Network Error:', error);
    // Handle network errors (timeout, connection refused, etc.)
  } else {
    console.error('Unknown Error:', error);
  }
}
```

## Performance Considerations

- **Response Time**: Typically 1-3 seconds for GPT-4
- **Token Limits**: Default 2000 tokens, configurable up to model limits
- **Cache Hit Rate**: Depends on query diversity and TTL settings
- **Cost Optimization**: Caching can reduce costs by 50-80% for repeated queries

## Monitoring and Metrics

Track key metrics for optimization:

```typescript
const tracking = service.getCostTracking();

// Daily cost tracking
const today = new Date().toISOString().split('T')[0];
const dailyCost = service.getCostByDate(today);

// Model-specific costs
const gpt4Cost = service.getCostByModel('gpt-4');
const gpt35Cost = service.getCostByModel('gpt-3.5-turbo');

// Cache efficiency
const stats = service.getCacheStats();
const cacheHitRate = (stats.size / totalQueries) * 100;
```

## Configuration Options

```typescript
interface ExternalLLMConfig {
  provider: 'openai' | 'anthropic';      // LLM provider
  model: string;                          // Model name (e.g., 'gpt-4')
  apiKey: string;                         // API key for authentication
  maxTokens?: number;                     // Max tokens in response (default: 2000)
  temperature?: number;                   // Creativity level 0-1 (default: 0.7)
  topP?: number;                          // Diversity parameter 0-1 (default: 0.9)
  cacheTTL?: number;                      // Cache time-to-live in seconds (default: 3600)
}
```

## Best Practices

1. **Cost Management**
   - Monitor daily costs and set alerts
   - Use caching aggressively for repeated queries
   - Consider GPT-3.5 for simple tasks, GPT-4 for complex ones

2. **Performance**
   - Adjust maxTokens based on response needs
   - Use temperature 0.7 for balanced responses
   - Implement request batching for multiple queries

3. **Reliability**
   - Validate API keys on startup
   - Implement retry logic for transient failures
   - Monitor error rates and adjust fallback strategies

4. **Security**
   - Store API keys in environment variables
   - Never commit API keys to version control
   - Rotate keys regularly

## Testing

Run the test suite:

```bash
# Unit tests
npm test -- services/ai-routing/__tests__/external-llm-service.test.ts

# Integration tests
npm test -- tests/integration/external-llm-routing.test.ts
```

## Troubleshooting

### High Costs
- Check cache hit rate
- Review query patterns for optimization opportunities
- Consider using cheaper models for simple queries

### Slow Responses
- Check API latency
- Reduce maxTokens if possible
- Consider using GPT-3.5 for faster responses

### API Errors
- Verify API key is valid
- Check rate limits
- Ensure sufficient account balance

## Future Enhancements

- [ ] Multi-model load balancing
- [ ] Advanced cost prediction
- [ ] Query optimization suggestions
- [ ] Batch processing support
- [ ] Custom model fine-tuning
- [ ] Advanced caching strategies (semantic similarity)
