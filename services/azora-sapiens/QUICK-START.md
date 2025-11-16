# Azora Sapiens 2.0 - Quick Start Guide

## 5-Minute Setup

### 1. Install & Configure
```bash
cd services/azora-sapiens
npm install

# Create .env file
cat > .env << EOF
OPENAI_API_KEY=your_key_here
PINECONE_API_KEY=your_key_here
NEWSAPI_KEY=your_key_here
ALPHAVANTAGE_KEY=your_key_here
NODE_ENV=development
PORT=3001
EOF
```

### 2. Build & Run
```bash
npm run build
npm start
```

### 3. Test It
```bash
# In another terminal
curl -X POST http://localhost:3001/api/sapiens/search \
  -H "Content-Type: application/json" \
  -d '{"query":"machine learning","type":"hybrid","topK":5}'
```

## API Quick Reference

### Search
```bash
# Hybrid search (recommended)
POST /api/sapiens/search
{
  "query": "your question",
  "type": "hybrid",
  "topK": 10
}

# Semantic search only
POST /api/sapiens/search
{
  "query": "your question",
  "type": "semantic"
}

# Keyword search only
POST /api/sapiens/search
{
  "query": "your question",
  "type": "keyword"
}
```

### Business Ideas
```bash
POST /api/sapiens/business-idea
{
  "skills": ["python", "design"],
  "interests": ["technology", "education"],
  "market": "South Africa"
}
```

### Career Paths
```bash
POST /api/sapiens/career-path
{
  "skills": ["leadership", "communication"],
  "interests": ["management", "technology"]
}
```

### Market Analysis
```bash
POST /api/sapiens/market-analysis
{
  "industry": "technology",
  "location": "South Africa"
}
```

### Funding Opportunities
```bash
POST /api/sapiens/funding-opportunities
{
  "businessType": "technology",
  "requiredAmount": 100000,
  "location": "South Africa"
}
```

### Health Check
```bash
GET /api/sapiens/health
```

## Code Examples

### Use Search Engine
```typescript
import SearchEngine from './src/search-engine';
import EmbeddingService from './src/embeddings';
import VectorStorageService from './src/vector-storage';

const embedding = new EmbeddingService(process.env.OPENAI_API_KEY);
const storage = new VectorStorageService(process.env.PINECONE_API_KEY);
const search = new SearchEngine(embedding, storage);

// Perform search
const results = await search.hybridSearch('machine learning', { topK: 10 });
console.log(results);
```

### Ingest Data
```typescript
import KnowledgeOcean from './src/knowledge-ocean';

const ocean = new KnowledgeOcean(embedding, storage);

const source = {
  type: 'news',
  source: 'TechNews',
  url: 'https://example.com',
  title: 'AI Breakthrough',
  content: 'Full article content...',
  metadata: {
    date: new Date().toISOString(),
    category: 'technology',
    verified: true,
    relevance: 0.9,
    tags: ['ai', 'technology']
  }
};

const ingested = await ocean.ingestSource(source, {
  generateEmbedding: true
});
```

### Use AI Intelligence
```typescript
import ElaraIntelligence from './src/intelligence/elara';
import ThembaIntelligence from './src/intelligence/themba';
import NalediIntelligence from './src/intelligence/naledi';
import KofiIntelligence from './src/intelligence/kofi';

// Educational guidance
const elara = new ElaraIntelligence(search);
const lessonPlan = await elara.generateLessonPlan('Machine Learning', {
  level: 'tertiary',
  duration: 90
});

// Career guidance
const themba = new ThembaIntelligence(search);
const careerPaths = await themba.generateCareerPath(
  ['python', 'leadership'],
  ['technology', 'management']
);

// Business guidance
const naledi = new NalediIntelligence(search);
const businessIdeas = await naledi.generateBusinessIdea(
  ['python', 'design'],
  ['technology', 'education']
);

// Financial guidance
const kofi = new KofiIntelligence(search);
const analysis = await kofi.analyzeBusinessFinancials(
  'technology',
  100000,
  1000
);
```

## Common Tasks

### Add a New Data Source
1. Create file in `src/sources/your-source.ts`
2. Implement data fetching
3. Add conversion to KnowledgeSource
4. Add to scheduler in `src/scheduler.ts`

### Add a New AI Module
1. Create file in `src/intelligence/your-module.ts`
2. Extend with SearchEngine
3. Implement analysis methods
4. Create API endpoint in `apps/app/api/sapiens/`

### Debug Search Results
```typescript
// Enable detailed logging
const results = await search.hybridSearch(query, { topK: 10 });
console.log('Semantic results:', results.filter(r => r.source === 'semantic'));
console.log('Keyword results:', results.filter(r => r.source === 'keyword'));
console.log('Combined score:', results.map(r => r.relevanceScore));
```

### Monitor Performance
```bash
# Check health
curl http://localhost:3001/api/sapiens/health

# Monitor logs
tail -f logs/sapiens.log

# Check cache stats
curl http://localhost:3001/api/sapiens/cache-stats
```

## Troubleshooting

### "No results found"
- Check if data has been ingested
- Verify embeddings were generated
- Try keyword search instead of semantic
- Check filters are not too restrictive

### "Embedding generation failed"
- Verify OpenAI API key is valid
- Check API quota
- Verify network connectivity
- Check rate limits

### "Vector database error"
- Verify Pinecone API key
- Check index exists
- Verify network connectivity
- Check Pinecone quota

### "Slow search response"
- Check network latency
- Verify Pinecone index size
- Check system resources
- Consider caching results

## Performance Tips

1. **Use Caching**: Results are cached for 1 hour
2. **Batch Operations**: Ingest multiple documents at once
3. **Limit Results**: Use topK parameter to limit results
4. **Filter Early**: Use filters to reduce search space
5. **Monitor Metrics**: Track search times and cache hits

## Next Steps

1. Read `SAPIENS-2-README.md` for full documentation
2. Check `SAPIENS-2-INTEGRATION.md` for integration examples
3. Review test files for usage patterns
4. Deploy to staging environment
5. Monitor performance and adjust

## Support

- Documentation: `SAPIENS-2-README.md`
- Integration Guide: `SAPIENS-2-INTEGRATION.md`
- Issues: Check logs in `logs/` directory
- Questions: Contact development team

---

**Version**: 2.0.0
**Last Updated**: November 16, 2025
