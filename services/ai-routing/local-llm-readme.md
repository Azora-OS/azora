# Local LLM Service (Route A)

## Overview

The Local LLM Service implements Route A of the hierarchical AI routing system. It handles on-device inference using quantized Llama/Phi models for simple queries.

## Features

- **On-Device Inference**: Quantized models run locally without external API calls
- **Zero Cost**: No API charges for local processing
- **Fast Response Times**: <500ms response time target
- **Response Caching**: Intelligent caching of responses
- **Multiple Quantization Levels**: Support for q4, q5, and q8
- **Model Flexibility**: Support for both Llama and Phi models

## Usage

```typescript
import { LocalLLMService } from '@azora/ai-routing';

const llmService = new LocalLLMService();
await llmService.initialize();

const response = await llmService.processQuery({
  query: 'What is Azora?',
  userId: 'user-123'
});

console.log(response.content);
// "Azora is an autonomous education and economic platform..."
```

## Configuration

```typescript
const llmService = new LocalLLMService({
  model: 'llama',           // 'llama' or 'phi'
  quantization: 'q4',       // 'q4', 'q5', or 'q8'
  maxTokens: 512,           // Maximum tokens to generate
  temperature: 0.7,         // Randomness (0.0-1.0)
  topP: 0.9,                // Nucleus sampling
  contextWindow: 2048       // Context window size
});
```

## Query Types

Optimized for simple queries:
- FAQ: "What is Azora?"
- Factual: "What is the capital of France?"
- Basic Search: "Tell me about courses"

## Performance

- **Response Time**: <500ms (target)
- **Cost**: $0.00 per query
- **Cache Hit Rate**: >40% typical
- **Memory**: 4-10GB typical deployment

## Caching

- Automatic response caching with 1-hour TTL
- Maximum 1000 cached entries
- Automatic cleanup of expired entries

## Service Lifecycle

```typescript
// Initialize
await service.initialize();

// Check status
if (service.isReady()) {
  // Process queries
}

// Get statistics
const stats = service.getCacheStats();

// Cleanup
await service.unload();
```

## Integration

Routes simple queries from the Query Classifier:

```typescript
const classification = await classifier.classify({
  query: 'What is Azora?'
});

if (classification.routedTo === RoutingTier.LOCAL_LLM) {
  const response = await llmService.processQuery({
    query: classification.query
  });
}
```

## Fallback Strategy

If Local LLM fails:
1. Retry with same service
2. Fall back to RAP System (Route B)
3. Fall back to External LLM (Route C)

## Testing

```bash
npm test -- services/ai-routing/__tests__/local-llm-service.test.ts
npm test -- services/ai-routing/__tests__/local-llm-integration.test.ts
```

## Monitoring

Key metrics:
- Response time per query
- Cache hit rate
- Model utilization
- Memory usage
- Query distribution

## Limitations

- Best for simple queries only
- Limited context window
- Knowledge cutoff from training data
- May hallucinate plausible but incorrect information
- No real-time data access

## Next Steps

1. Integrate with API Gateway
2. Set up monitoring and alerting
3. Fine-tune for domain-specific queries
4. Add streaming response support
5. Implement adaptive quantization
