# Local LLM Service - Quick Start Guide

## Installation

The Local LLM Service is part of the AI Routing system. No additional installation needed beyond the base setup.

## Basic Setup

### 1. Import the Service

```typescript
import { LocalLLMService } from '@azora/ai-routing';
```

### 2. Create an Instance

```typescript
const llmService = new LocalLLMService();
```

### 3. Initialize

```typescript
await llmService.initialize();
```

### 4. Process Queries

```typescript
const response = await llmService.processQuery({
  query: 'What is Azora?',
  userId: 'user-123'
});

console.log(response.content);
```

## Complete Example

```typescript
import { LocalLLMService, RoutingTier } from '@azora/ai-routing';

async function main() {
  // Create service
  const llmService = new LocalLLMService({
    model: 'llama',
    quantization: 'q4'
  });

  // Initialize
  await llmService.initialize();
  console.log('✓ Local LLM Service initialized');

  // Process queries
  const queries = [
    'What is Azora?',
    'How do I start?',
    'What are tokens?'
  ];

  for (const query of queries) {
    const response = await llmService.processQuery({ query });
    
    console.log(`\nQuery: ${query}`);
    console.log(`Response: ${response.content}`);
    console.log(`Time: ${response.responseTime}ms`);
    console.log(`Cached: ${response.cached}`);
    console.log(`Cost: $${response.cost}`);
  }

  // Get statistics
  const stats = llmService.getCacheStats();
  console.log(`\nCache Stats:`);
  console.log(`  Size: ${stats.size}/${stats.maxSize}`);
  console.log(`  Utilization: ${stats.utilizationPercent.toFixed(1)}%`);

  // Cleanup
  await llmService.unload();
  console.log('\n✓ Local LLM Service unloaded');
}

main().catch(console.error);
```

## Configuration Options

### Model Selection

```typescript
// Use Llama (default)
const llama = new LocalLLMService({ model: 'llama' });

// Use Phi
const phi = new LocalLLMService({ model: 'phi' });
```

### Quantization Levels

```typescript
// Fast (q4) - smallest model, fastest inference
const fast = new LocalLLMService({ quantization: 'q4' });

// Balanced (q5)
const balanced = new LocalLLMService({ quantization: 'q5' });

// Quality (q8) - largest model, best quality
const quality = new LocalLLMService({ quantization: 'q8' });
```

### Inference Parameters

```typescript
const service = new LocalLLMService({
  maxTokens: 512,        // Max tokens to generate
  temperature: 0.7,      // Randomness (0.0-1.0)
  topP: 0.9,             // Nucleus sampling
  contextWindow: 2048    // Context window size
});
```

## Common Queries

### FAQ Queries

```typescript
const faqQueries = [
  'What is Azora?',
  'How do I start?',
  'What are AZR tokens?',
  'How do I earn tokens?',
  'What is proof of knowledge?',
  'How do I purchase a course?'
];

for (const query of faqQueries) {
  const response = await llmService.processQuery({ query });
  console.log(`${query} → ${response.content}`);
}
```

### Factual Queries

```typescript
const factualQueries = [
  'What is the capital of France?',
  'What is the capital of South Africa?',
  'When was Azora founded?'
];

for (const query of factualQueries) {
  const response = await llmService.processQuery({ query });
  console.log(`${query} → ${response.content}`);
}
```

## Monitoring

### Check Service Status

```typescript
if (llmService.isReady()) {
  console.log('✓ Service is ready');
} else {
  console.log('✗ Service is not ready');
}
```

### Get Detailed Status

```typescript
const status = llmService.getStatus();
console.log(`Model: ${status.model}`);
console.log(`Quantization: ${status.quantization}`);
console.log(`Cache Size: ${status.cacheSize}`);
console.log(`Max Tokens: ${status.maxTokens}`);
```

### Cache Statistics

```typescript
const stats = llmService.getCacheStats();
console.log(`Cache Size: ${stats.size}/${stats.maxSize}`);
console.log(`Utilization: ${stats.utilizationPercent.toFixed(1)}%`);
```

## Caching

### Automatic Caching

Responses are automatically cached:

```typescript
// First call - not cached
const response1 = await llmService.processQuery({ query: 'Test' });
console.log(response1.cached); // false

// Second call - cached
const response2 = await llmService.processQuery({ query: 'Test' });
console.log(response2.cached); // true
```

### Clear Cache

```typescript
llmService.clearCache();
console.log('✓ Cache cleared');
```

## Error Handling

### Handle Initialization Errors

```typescript
try {
  await llmService.initialize();
} catch (error) {
  console.error('Failed to initialize:', error);
  // Fall back to external LLM
}
```

### Handle Query Errors

```typescript
try {
  const response = await llmService.processQuery({ query: 'Test' });
  console.log(response.content);
} catch (error) {
  console.error('Query failed:', error);
  // Retry or fall back
}
```

## Integration with Routing System

### With Query Classifier

```typescript
import { QueryClassifier, LocalLLMService, RoutingTier } from '@azora/ai-routing';

const classifier = new QueryClassifier();
const llmService = new LocalLLMService();

await llmService.initialize();

const classification = await classifier.classify({
  query: 'What is Azora?'
});

if (classification.routedTo === RoutingTier.LOCAL_LLM) {
  const response = await llmService.processQuery({
    query: classification.query
  });
  console.log(response.content);
}
```

### With Hierarchical Router

```typescript
import { HierarchicalRouter } from '@azora/ai-routing';

const router = new HierarchicalRouter(config);

const response = await router.route({
  query: 'What is Azora?',
  userId: 'user-123'
});

console.log(response.content);
```

## Performance Tips

### 1. Use q4 Quantization for Speed

```typescript
const fastService = new LocalLLMService({ quantization: 'q4' });
```

### 2. Monitor Cache Hit Rate

```typescript
const stats = llmService.getCacheStats();
const hitRate = (stats.size / totalQueries) * 100;
console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);
```

### 3. Reuse Service Instance

```typescript
// Good: Create once, reuse
const service = new LocalLLMService();
await service.initialize();

for (const query of queries) {
  const response = await service.processQuery({ query });
}

// Bad: Create for each query
for (const query of queries) {
  const service = new LocalLLMService();
  await service.initialize();
  const response = await service.processQuery({ query });
}
```

### 4. Clean Up Resources

```typescript
// On shutdown
await llmService.unload();
```

## Troubleshooting

### Service Not Ready

```typescript
if (!llmService.isReady()) {
  await llmService.initialize();
}
```

### Slow Response Times

```typescript
// Check cache hit rate
const stats = llmService.getCacheStats();
if (stats.size === 0) {
  console.log('Cache is empty, warming up...');
}

// Use faster quantization
const fastService = new LocalLLMService({ quantization: 'q4' });
```

### Out of Memory

```typescript
// Use lower quantization
const service = new LocalLLMService({ quantization: 'q4' });

// Clear cache
llmService.clearCache();

// Reduce context window
const service = new LocalLLMService({ contextWindow: 1024 });
```

## Next Steps

1. Integrate with your API endpoints
2. Set up monitoring and alerting
3. Configure for your use cases
4. Test with real queries
5. Monitor performance metrics

## Support

For issues or questions:
1. Check the main README: `services/ai-routing/README.md`
2. Review test files: `services/ai-routing/__tests__/`
3. Check logs for error messages
4. Open an issue on GitHub
