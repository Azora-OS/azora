# RAP System (Route B) - Retrieval-Augmented Prompt

## Overview

The RAP System is Route B in Azora's Hierarchical AI Routing system. It combines Knowledge Ocean retrieval with external LLM processing to handle moderate complexity queries that require analysis, recommendations, and multi-step reasoning.

**Route B** is optimized for:
- Analysis and synthesis tasks
- Recommendations based on context
- Multi-step reasoning problems
- Queries requiring external knowledge integration

## Architecture

```
Query Input
    ↓
Query Embedding (OpenAI Embeddings)
    ↓
Knowledge Ocean Retrieval (70% internal, 30% external)
    ↓
Context Formatting & Ranking
    ↓
RAP Building (Retrieval-Augmented Prompt)
    ↓
External LLM Call (GPT-4 or Claude)
    ↓
Response Caching & Cost Tracking
    ↓
Response Output
```

## Key Features

### 1. **70/30 Rule Implementation**
- **70% Internal Sources**: Verified Azora knowledge (courses, documentation, user data)
- **30% External Sources**: Research, news, APIs, and supplementary information
- Automatic weighting and prioritization in prompt construction

### 2. **Knowledge Ocean Integration**
- Semantic search using vector embeddings
- Verified source prioritization
- Category and tag-based filtering
- Relevance scoring

### 3. **Retrieval-Augmented Prompt (RAP)**
- Automatic context injection into prompts
- Source citation and attribution
- Confidence scoring based on relevance
- Fallback handling for missing context

### 4. **Cost Optimization**
- Response caching with TTL
- Cost calculation per query
- Token-based pricing estimation
- Cost tracking per routing tier

### 5. **Performance Monitoring**
- Response time tracking
- Cache hit/miss metrics
- Source retrieval statistics
- Cost per query analysis

## Configuration

```typescript
const config: RAPSystemConfig = {
  // Knowledge Ocean settings
  internalSourceWeight: 0.7,      // 70% internal
  externalSourceWeight: 0.3,      // 30% external
  maxContextTokens: 2000,         // Max context size
  maxRetrievalResults: 10,        // Max sources to retrieve
  
  // External LLM settings
  externalLLMProvider: 'openai',  // 'openai' or 'anthropic'
  externalLLMModel: 'gpt-4',      // Model name
  externalLLMApiKey: 'sk-...',    // API key
  
  // Embedding settings
  embeddingApiKey: 'sk-...',      // OpenAI API key
  
  // Vector database settings
  vectorDbApiKey: 'pc-...',       // Pinecone API key
  vectorDbIndexName: 'azora-knowledge'
};

const rapSystem = new RAPSystem(config);
```

## Usage

### Basic Query Processing

```typescript
import { RAPSystem } from './services/ai-routing/rap-system';
import { AIQuery } from './services/ai-routing/types';

const rapSystem = new RAPSystem(config);

const query: AIQuery = {
  query: 'What are the best practices for machine learning?',
  userId: 'user-123',
  context: {
    courseId: 'ml-101',
    difficulty: 'intermediate'
  }
};

const response = await rapSystem.processQuery(query);

console.log('Response:', response.content);
console.log('Cost:', response.cost);
console.log('Response Time:', response.responseTime);
console.log('Cached:', response.cached);
console.log('Internal Sources:', response.metadata?.internalSourcesCount);
console.log('External Sources:', response.metadata?.externalSourcesCount);
```

### Knowledge Ocean Integration

```typescript
// Ingest a single knowledge source
const source = {
  type: 'research',
  source: 'academic',
  url: 'https://example.com/paper',
  title: 'Machine Learning Fundamentals',
  content: 'Detailed content about ML...',
  metadata: {
    date: '2024-01-01',
    category: 'ML',
    verified: true,
    relevance: 0.95,
    tags: ['machine-learning', 'fundamentals']
  }
};

const ingested = await rapSystem.ingestKnowledgeSource(source);

// Ingest multiple sources in batch
const sources = [/* ... */];
const ingestedBatch = await rapSystem.ingestKnowledgeSources(sources);

// Get Knowledge Ocean statistics
const stats = rapSystem.getKnowledgeOceanStats();
console.log('Total sources:', stats.totalSources);
console.log('Verified sources:', stats.verifiedSources);
```

### Cache Management

```typescript
// Get cache statistics
const stats = rapSystem.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Cache entries:', stats.entries);

// Clear cache
rapSystem.clearCache();
```

## Response Format

```typescript
interface AIResponse {
  id: string;                    // Unique response ID
  content: string;               // Generated response
  routingTier: RoutingTier;      // RAP_SYSTEM
  responseTime: number;          // Milliseconds
  cost: number;                  // Estimated cost in USD
  cached: boolean;               // Whether response was cached
  metadata?: {
    cacheHit: boolean;
    retrievalMethod: 'cache' | 'rap';
    internalSourcesCount: number;
    externalSourcesCount: number;
    contextLength: number;
    internalWeight: number;
    externalWeight: number;
  };
}
```

## Performance Characteristics

| Metric | Target | Notes |
|--------|--------|-------|
| Response Time | <1000ms | Includes retrieval + LLM call |
| Cache Hit Time | <50ms | Cached responses |
| Retrieval Time | <300ms | Vector search + formatting |
| LLM Call Time | <700ms | External API call |
| Cost per Query | $0.01-0.05 | Depends on context size |

## 70/30 Rule Details

### Internal Sources (70%)
- Verified Azora knowledge
- Course materials and documentation
- User-generated content (reviews, discussions)
- Internal research and case studies
- Prioritized in context ranking

### External Sources (30%)
- Academic research papers
- News and current events
- Public APIs and datasets
- Industry reports
- Supplementary information

### Weighting Algorithm
1. Retrieve top 7 internal sources (70% of max results)
2. Retrieve top 3 external sources (30% of max results)
3. Format with clear section headers
4. Inject into RAP with weight indicators
5. LLM synthesizes response prioritizing internal sources

## Error Handling

### Common Errors

| Error | Cause | Resolution |
|-------|-------|-----------|
| Embedding Generation Failed | API error or invalid input | Retry with valid query |
| Vector Search Failed | Database connection issue | Check Pinecone connection |
| LLM API Error | Rate limit or API issue | Implement exponential backoff |
| Context Retrieval Failed | No relevant sources found | Proceed with empty context |

### Resilience Strategies

```typescript
// Automatic fallback to external LLM if retrieval fails
try {
  const context = await retrieveContext(query);
} catch (error) {
  console.warn('Retrieval failed, proceeding without context');
  // Continue with empty context
}

// Retry logic for API calls
const maxRetries = 3;
let lastError;
for (let i = 0; i < maxRetries; i++) {
  try {
    return await callExternalLLM(prompt);
  } catch (error) {
    lastError = error;
    await delay(Math.pow(2, i) * 1000); // Exponential backoff
  }
}
throw lastError;
```

## Integration with Hierarchical Router

The RAP System is automatically selected by the Hierarchical Router for moderate complexity queries:

```typescript
import { HierarchicalRouter } from './hierarchical-router';

const router = new HierarchicalRouter();

// Query classification determines routing
const query = 'Analyze the impact of AI on education';
const response = await router.route(query);

// If classified as MODERATE complexity, routes to RAP System (Route B)
// Response includes routing tier and cost information
```

## Monitoring and Metrics

### Key Metrics to Track

```typescript
// Response time distribution
const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;

// Cache effectiveness
const cacheHitRate = cachedResponses.length / totalResponses;

// Cost analysis
const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);
const avgCostPerQuery = totalCost / responses.length;

// Source utilization
const avgInternalSources = responses.reduce((sum, r) => sum + (r.metadata?.internalSourcesCount || 0), 0) / responses.length;
const avgExternalSources = responses.reduce((sum, r) => sum + (r.metadata?.externalSourcesCount || 0), 0) / responses.length;
```

### Logging

```typescript
// Log RAP system metrics
logger.info('RAP Query Processed', {
  queryId: response.id,
  responseTime: response.responseTime,
  cost: response.cost,
  cached: response.cached,
  internalSources: response.metadata?.internalSourcesCount,
  externalSources: response.metadata?.externalSourcesCount
});
```

## Best Practices

1. **Query Optimization**
   - Keep queries focused and specific
   - Include relevant context in metadata
   - Use consistent terminology

2. **Knowledge Ocean Maintenance**
   - Regularly ingest new sources
   - Verify and tag sources appropriately
   - Remove outdated or irrelevant content
   - Monitor source quality metrics

3. **Cost Management**
   - Monitor cost per query
   - Implement cost thresholds
   - Cache frequently asked questions
   - Use appropriate LLM models

4. **Performance Tuning**
   - Adjust maxRetrievalResults based on needs
   - Tune maxContextTokens for balance
   - Monitor cache hit rates
   - Implement query batching

5. **Quality Assurance**
   - Validate response accuracy
   - Track user satisfaction
   - Monitor source relevance
   - Audit bias and fairness

## Testing

### Unit Tests
```bash
npm test -- services/ai-routing/__tests__/rap-system.test.ts
```

### Integration Tests
```bash
npm test -- tests/integration/rap-system-integration.test.ts
```

### Test Coverage
- Query processing pipeline
- Context retrieval and formatting
- RAP building and prompt injection
- External LLM integration
- Caching mechanisms
- Error handling and resilience
- Cost calculation
- Metadata tracking

## Troubleshooting

### Issue: High Response Times
**Solution**: 
- Check vector database performance
- Reduce maxRetrievalResults
- Verify LLM API latency
- Check network connectivity

### Issue: High Costs
**Solution**:
- Increase cache TTL
- Reduce context size
- Use cheaper LLM model
- Implement query deduplication

### Issue: Low Quality Responses
**Solution**:
- Improve Knowledge Ocean quality
- Adjust internal/external weighting
- Enhance prompt engineering
- Add more verified sources

### Issue: Cache Misses
**Solution**:
- Increase cache TTL
- Implement query normalization
- Add semantic similarity matching
- Monitor cache eviction

## Future Enhancements

1. **Multi-LLM Support**
   - Support for multiple external LLM providers
   - Automatic provider selection based on cost/quality
   - Fallback chains for reliability

2. **Advanced Retrieval**
   - Hybrid search (semantic + keyword)
   - Multi-hop reasoning
   - Dynamic context sizing

3. **Optimization**
   - Query result caching at multiple levels
   - Batch processing for efficiency
   - Adaptive weighting based on performance

4. **Monitoring**
   - Real-time performance dashboards
   - Anomaly detection
   - Cost forecasting
   - Quality metrics tracking

## References

- [Retrieval-Augmented Generation (RAG)](https://arxiv.org/abs/2005.11401)
- [Knowledge Ocean Architecture](../azora-sapiens/ARCHITECTURE.md)
- [Hierarchical AI Router](./README.md)
- [Azora AI Routing System](./SETUP-GUIDE.md)
