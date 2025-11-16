# Azora Sapiens 2.0 - Knowledge Engine

## Overview

Azora Sapiens 2.0 is a real-time knowledge engine that powers the AI Family (Elara, Themba, Naledi, Kofi) with current, verified information from a comprehensive knowledge ocean. Instead of generic responses, Sapiens 2.0 searches, verifies, and delivers solid results based on latest data.

## Architecture

```
Student Portal
    ↓
API Layer (Search, Business Ideas, Career Paths, Funding)
    ↓
AI Family Layer (Elara, Themba, Naledi, Kofi)
    ↓
Search Engine (Semantic + Keyword + Hybrid)
    ↓
Knowledge Ocean (News, Market, Research, SA Data, Ecosystem)
    ↓
Data Sources (NewsAPI, Alpha Vantage, ArXiv, Stats SA, JSE)
```

## Core Components

### 1. Embedding Service (`src/embeddings.ts`)
- Generates vector embeddings using OpenAI API
- Implements caching for performance
- Supports batch embedding generation
- 24-hour TTL cache

### 2. Vector Storage (`src/vector-storage.ts`)
- Stores embeddings in Pinecone vector database
- Performs semantic similarity search
- Supports metadata filtering
- Batch operations for efficiency

### 3. Search Engine (`src/search-engine.ts`)
- **Semantic Search**: Vector similarity matching
- **Keyword Search**: BM25-like algorithm
- **Hybrid Search**: Combines both approaches
- Result ranking by relevance and recency

### 4. Knowledge Ocean (`src/knowledge-ocean.ts`)
- Centralized data storage with metadata
- Supports multiple knowledge types (news, research, market, student, business, trend)
- Batch ingestion capabilities
- Statistical analysis

### 5. Data Sources
- **News** (`src/sources/news.ts`): NewsAPI integration
- **Market** (`src/sources/market.ts`): Alpha Vantage + CoinGecko
- **Research** (`src/sources/research.ts`): ArXiv integration
- **South Africa** (`src/sources/south-africa.ts`): Stats SA + JSE
- **Ecosystem** (`src/sources/ecosystem.ts`): Azora internal data

### 6. Data Ingestion Scheduler (`src/scheduler.ts`)
- Hourly news updates
- Minute-level market data updates
- 6-hourly research and SA data updates
- Automatic retry on failures

### 7. AI Family Intelligence
- **Elara** (`src/intelligence/elara.ts`): Educational guidance
- **Themba** (`src/intelligence/themba.ts`): Career intelligence
- **Naledi** (`src/intelligence/naledi.ts`): Business intelligence
- **Kofi** (`src/intelligence/kofi.ts`): Financial intelligence

## API Endpoints

### Search
```
POST /api/sapiens/search
GET /api/sapiens/search?q=query&type=hybrid&topK=10

Request:
{
  "query": "machine learning",
  "type": "hybrid",  // semantic, keyword, or hybrid
  "topK": 10,
  "filters": { "category": "research" }
}

Response:
{
  "success": true,
  "query": "machine learning",
  "type": "hybrid",
  "resultCount": 10,
  "results": [
    {
      "id": "...",
      "score": 0.95,
      "metadata": { ... },
      "relevanceScore": 0.95
    }
  ]
}
```

### Business Ideas
```
POST /api/sapiens/business-idea
GET /api/sapiens/business-idea?skills=python,design&interests=tech,education

Request:
{
  "skills": ["python", "design"],
  "interests": ["technology", "education"],
  "market": "South Africa"
}

Response:
{
  "success": true,
  "ideaCount": 3,
  "ideas": [
    {
      "title": "EdTech Platform",
      "description": "...",
      "marketSize": 1000000,
      "requiredCapital": 50000,
      "profitMargin": 0.4,
      "timeToProfit": "6-12 months",
      "risks": [...],
      "opportunities": [...]
    }
  ]
}
```

### Market Analysis
```
POST /api/sapiens/market-analysis
GET /api/sapiens/market-analysis?industry=technology&location=South%20Africa

Request:
{
  "industry": "technology",
  "location": "South Africa"
}

Response:
{
  "success": true,
  "analysis": {
    "industry": "technology",
    "marketSize": 5000000000,
    "growthRate": 0.15,
    "competitors": [...],
    "trends": [...],
    "opportunities": [...],
    "threats": [...]
  }
}
```

### Career Path
```
POST /api/sapiens/career-path
GET /api/sapiens/career-path?skills=python,leadership&interests=tech,management

Request:
{
  "skills": ["python", "leadership"],
  "interests": ["technology", "management"]
}

Response:
{
  "success": true,
  "pathCount": 3,
  "paths": [
    {
      "title": "Tech Lead Career Path",
      "description": "...",
      "requiredSkills": [...],
      "salaryRange": { "min": 50000, "max": 150000 },
      "growthPotential": "Very High",
      "nextSteps": [...]
    }
  ]
}
```

### Funding Opportunities
```
POST /api/sapiens/funding-opportunities
GET /api/sapiens/funding-opportunities?businessType=tech&requiredAmount=100000

Request:
{
  "businessType": "technology",
  "requiredAmount": 100000,
  "location": "South Africa"
}

Response:
{
  "success": true,
  "opportunityCount": 4,
  "opportunities": [
    {
      "name": "Government Small Business Grant",
      "type": "grant",
      "amount": 100000,
      "terms": "Non-repayable grant",
      "eligibility": [...],
      "source": "Department of Trade and Industry",
      "url": "https://..."
    }
  ]
}
```

### Health Check
```
GET /api/sapiens/health

Response:
{
  "status": "healthy",
  "timestamp": "2025-11-16T...",
  "services": {
    "embeddings": "operational",
    "vectorStorage": "operational",
    "searchEngine": "operational",
    "elara": "operational",
    "themba": "operational",
    "naledi": "operational",
    "kofi": "operational"
  },
  "version": "2.0.0",
  "uptime": 3600
}
```

## Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Configure:
# OPENAI_API_KEY=your_openai_key
# PINECONE_API_KEY=your_pinecone_key
# NEWSAPI_KEY=your_newsapi_key
# ALPHAVANTAGE_KEY=your_alphavantage_key

# Build
npm run build

# Start
npm start
```

## Usage

### Initialize Services
```typescript
import EmbeddingService from './src/embeddings';
import VectorStorageService from './src/vector-storage';
import SearchEngine from './src/search-engine';
import KnowledgeOcean from './src/knowledge-ocean';

const embeddingService = new EmbeddingService(process.env.OPENAI_API_KEY);
const vectorStorage = new VectorStorageService(process.env.PINECONE_API_KEY);
const searchEngine = new SearchEngine(embeddingService, vectorStorage);
const knowledgeOcean = new KnowledgeOcean(embeddingService, vectorStorage);
```

### Perform Search
```typescript
const results = await searchEngine.hybridSearch('machine learning', {
  topK: 10,
  filters: { category: 'research' }
});
```

### Ingest Data
```typescript
const source = {
  type: 'news',
  source: 'TechNews',
  url: 'https://...',
  title: 'AI Breakthrough',
  content: '...',
  metadata: {
    date: new Date().toISOString(),
    category: 'technology',
    verified: true,
    relevance: 0.9,
    tags: ['ai', 'technology']
  }
};

const ingested = await knowledgeOcean.ingestSource(source, {
  generateEmbedding: true
});
```

### Use AI Family
```typescript
import ElaraIntelligence from './src/intelligence/elara';

const elara = new ElaraIntelligence(searchEngine);

const lessonPlan = await elara.generateLessonPlan('Machine Learning', {
  level: 'tertiary',
  duration: 90
});
```

## Performance Targets

- Search response time: <2 seconds
- Embedding generation: <500ms per document
- Data ingestion: 1000+ documents/minute
- Vector search: <100ms for top-10 results
- API response time: <1 second
- System uptime: >99.9%

## Data Update Schedule

- **News**: Every hour
- **Market Data**: Every minute
- **Research**: Every 6 hours
- **South Africa Data**: Every 6 hours
- **Ecosystem Data**: On-demand

## Security

- All API endpoints require authentication
- Input validation on all requests
- Rate limiting: 100 requests/minute per user
- Encrypted data transmission
- Audit logging for all searches

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

## Monitoring

- Health check endpoint: `/api/sapiens/health`
- Prometheus metrics available
- Grafana dashboards configured
- Alert rules for service degradation

## Troubleshooting

### Embedding Generation Fails
- Check OpenAI API key
- Verify API quota
- Check network connectivity

### Vector Search Returns No Results
- Verify Pinecone index exists
- Check data has been ingested
- Verify embeddings were generated

### Data Ingestion Slow
- Check API rate limits
- Verify network connectivity
- Monitor system resources

## Contributing

1. Follow TypeScript strict mode
2. Add tests for new features
3. Update documentation
4. Run linting before commit

## License

Proprietary - Azora ES (Pty) Ltd

## Support

For issues or questions, contact the Azora development team.
