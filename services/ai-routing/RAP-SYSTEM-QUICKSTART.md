# RAP System Quick Start Guide

## 5-Minute Setup

### 1. Install Dependencies

```bash
npm install openai @pinecone-database/pinecone uuid node-cache
```

### 2. Set Environment Variables

```bash
export OPENAI_API_KEY="sk-..."
export PINECONE_API_KEY="pc-..."
export PINECONE_INDEX_NAME="azora-knowledge"
```

### 3. Initialize RAP System

```typescript
import { RAPSystem } from './services/ai-routing/rap-system';

const rapSystem = new RAPSystem({
  internalSourceWeight: 0.7,
  externalSourceWeight: 0.3,
  maxContextTokens: 2000,
  maxRetrievalResults: 10,
  externalLLMProvider: 'openai',
  externalLLMModel: 'gpt-4',
  externalLLMApiKey: process.env.OPENAI_API_KEY!,
  embeddingApiKey: process.env.OPENAI_API_KEY!,
  vectorDbApiKey: process.env.PINECONE_API_KEY!,
  vectorDbIndexName: process.env.PINECONE_INDEX_NAME || 'azora-knowledge'
});
```

### 4. Process Your First Query

```typescript
const response = await rapSystem.processQuery({
  query: 'What are the best practices for machine learning?',
  userId: 'user-123'
});

console.log('Response:', response.content);
console.log('Cost:', response.cost);
console.log('Response Time:', response.responseTime, 'ms');
```

## Common Use Cases

### Use Case 1: Educational Content Analysis

```typescript
const query = {
  query: 'Explain the transformer architecture and its applications',
  userId: 'student-456',
  context: {
    courseId: 'ai-201',
    difficulty: 'advanced'
  }
};

const response = await rapSystem.processQuery(query);
// Response includes verified educational sources + external research
```

### Use Case 2: Business Analysis

```typescript
const query = {
  query: 'Analyze market trends in AI adoption across industries',
  userId: 'analyst-789',
  context: {
    industry: 'technology',
    region: 'africa'
  }
};

const response = await rapSystem.processQuery(query);
// Response combines internal market data + external research
```

### Use Case 3: Research Synthesis

```typescript
const query = {
  query: 'Synthesize recent findings on neural network optimization',
  userId: 'researcher-101',
  context: {
    researchArea: 'deep-learning',
    timeframe: 'last-6-months'
  }
};

const response = await rapSystem.processQuery(query);
// Response prioritizes verified internal research + external papers
```

## Ingesting Knowledge Sources

### Single Source

```typescript
const source = {
  type: 'research',
  source: 'academic',
  url: 'https://example.com/paper.pdf',
  title: 'Deep Learning Fundamentals',
  content: 'Comprehensive guide to deep learning...',
  metadata: {
    date: '2024-01-15',
    category: 'AI',
    verified: true,
    relevance: 0.95,
    tags: ['deep-learning', 'neural-networks', 'fundamentals']
  }
};

const ingested = await rapSystem.ingestKnowledgeSource(source);
console.log('Ingested source:', ingested.id);
```

### Batch Ingestion

```typescript
const sources = [
  { /* source 1 */ },
  { /* source 2 */ },
  { /* source 3 */ }
];

const ingested = await rapSystem.ingestKnowledgeSources(sources);
console.log(`Ingested ${ingested.length} sources`);
```

## Monitoring Performance

### Check Cache Statistics

```typescript
const stats = rapSystem.getCacheStats();
console.log('Cache entries:', stats.entries);
console.log('Cache size:', stats.size);
```

### Get Knowledge Ocean Stats

```typescript
const koStats = rapSystem.getKnowledgeOceanStats();
console.log('Total sources:', koStats.totalSources);
console.log('Verified sources:', koStats.verifiedSources);
console.log('By type:', koStats.byType);
console.log('By category:', koStats.byCategory);
```

### Track Metrics

```typescript
const responses = [];

for (let i = 0; i < 10; i++) {
  const response = await rapSystem.processQuery({
    query: `Query ${i}`
  });
  responses.push(response);
}

// Calculate metrics
const avgResponseTime = responses.reduce((sum, r) => sum + r.responseTime, 0) / responses.length;
const cacheHitRate = responses.filter(r => r.cached).length / responses.length;
const totalCost = responses.reduce((sum, r) => sum + r.cost, 0);

console.log('Average response time:', avgResponseTime, 'ms');
console.log('Cache hit rate:', (cacheHitRate * 100).toFixed(2), '%');
console.log('Total cost:', totalCost.toFixed(4), 'USD');
```

## Integration with Express API

```typescript
import express from 'express';
import { RAPSystem } from './services/ai-routing/rap-system';

const app = express();
const rapSystem = new RAPSystem(config);

app.post('/api/query', async (req, res) => {
  try {
    const { query, userId, context } = req.body;
    
    const response = await rapSystem.processQuery({
      query,
      userId,
      context
    });
    
    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.listen(3000, () => {
  console.log('RAP System API running on port 3000');
});
```

## Testing

### Run Unit Tests

```bash
npm test -- services/ai-routing/__tests__/rap-system.test.ts
```

### Run Integration Tests

```bash
npm test -- tests/integration/rap-system-integration.test.ts
```

### Test a Specific Scenario

```typescript
import { RAPSystem } from './services/ai-routing/rap-system';

async function testRAP() {
  const rapSystem = new RAPSystem(config);
  
  // Test 1: Simple query
  console.log('Test 1: Simple query');
  const response1 = await rapSystem.processQuery({
    query: 'What is machine learning?'
  });
  console.log('✓ Response:', response1.content.substring(0, 100) + '...');
  
  // Test 2: Caching
  console.log('\nTest 2: Caching');
  const response2 = await rapSystem.processQuery({
    query: 'What is machine learning?'
  });
  console.log('✓ Cached:', response2.cached);
  
  // Test 3: Cost tracking
  console.log('\nTest 3: Cost tracking');
  console.log('✓ Cost:', response1.cost.toFixed(4), 'USD');
  
  // Test 4: Metadata
  console.log('\nTest 4: Metadata');
  console.log('✓ Internal sources:', response1.metadata?.internalSourcesCount);
  console.log('✓ External sources:', response1.metadata?.externalSourcesCount);
}

testRAP().catch(console.error);
```

## Troubleshooting

### Issue: "API key not found"
**Solution**: Set environment variables
```bash
export OPENAI_API_KEY="your-key"
export PINECONE_API_KEY="your-key"
```

### Issue: "Vector database connection failed"
**Solution**: Verify Pinecone credentials and index name
```typescript
const config = {
  vectorDbApiKey: process.env.PINECONE_API_KEY,
  vectorDbIndexName: 'azora-knowledge' // Verify this exists
};
```

### Issue: "High response times"
**Solution**: Check LLM API status and reduce context size
```typescript
const config = {
  maxContextTokens: 1000, // Reduce from 2000
  maxRetrievalResults: 5   // Reduce from 10
};
```

### Issue: "High costs"
**Solution**: Enable caching and use cheaper model
```typescript
const config = {
  externalLLMModel: 'gpt-3.5-turbo', // Cheaper than gpt-4
  // Caching is enabled by default
};
```

## Next Steps

1. **Ingest Your Knowledge Base**
   - Add your course materials
   - Add research papers
   - Add documentation

2. **Integrate with Your Application**
   - Add RAP endpoints to your API
   - Connect to your frontend
   - Set up monitoring

3. **Optimize Performance**
   - Monitor response times
   - Track cache hit rates
   - Analyze costs
   - Adjust configuration

4. **Scale to Production**
   - Set up load balancing
   - Configure auto-scaling
   - Implement rate limiting
   - Add comprehensive logging

## Resources

- [RAP System Documentation](./RAP-SYSTEM-README.md)
- [AI Routing Setup Guide](./SETUP-GUIDE.md)
- [Knowledge Ocean Architecture](../azora-sapiens/ARCHITECTURE.md)
- [Hierarchical Router](./README.md)

## Support

For issues or questions:
1. Check the [RAP System README](./RAP-SYSTEM-README.md)
2. Review [test files](.//__tests__/rap-system.test.ts)
3. Check [integration tests](../../tests/integration/rap-system-integration.test.ts)
4. Open an issue on GitHub
