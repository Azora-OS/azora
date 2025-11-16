# Azora Sapiens 2.0 - Integration Guide

## Quick Start

### 1. Environment Setup

Create `.env` file in `services/azora-sapiens/`:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...

# Pinecone Configuration
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=azora-knowledge

# Data Source APIs
NEWSAPI_KEY=...
ALPHAVANTAGE_KEY=...
CRYPTO_API_KEY=...

# Service Configuration
NODE_ENV=production
PORT=3001
LOG_LEVEL=info
```

### 2. Install Dependencies

```bash
cd services/azora-sapiens
npm install
```

### 3. Build and Start

```bash
npm run build
npm start
```

## Integration with Student Portal

### Add Sapiens Search Component

```typescript
// apps/app/components/SapiensSearch.tsx
import { useState } from 'react';

export function SapiensSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/sapiens/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, type: 'hybrid', topK: 10 })
      });

      const data = await response.json();
      setResults(data.results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sapiens-search">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask Sapiens anything..."
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div className="results">
        {results.map((result) => (
          <div key={result.id} className="result-item">
            <h3>{result.metadata.title}</h3>
            <p>{result.metadata.source}</p>
            <a href={result.metadata.url} target="_blank">
              Read More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Add Business Idea Generator

```typescript
// apps/app/components/BusinessIdeaGenerator.tsx
import { useState } from 'react';

export function BusinessIdeaGenerator() {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/sapiens/business-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, interests, market: 'South Africa' })
      });

      const data = await response.json();
      setIdeas(data.ideas);
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="business-idea-generator">
      <h2>Business Idea Generator</h2>
      
      <div className="input-section">
        <label>Your Skills</label>
        <input
          type="text"
          placeholder="e.g., Python, Design, Marketing"
          onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()))}
        />

        <label>Your Interests</label>
        <input
          type="text"
          placeholder="e.g., Technology, Education, Finance"
          onChange={(e) => setInterests(e.target.value.split(',').map(i => i.trim()))}
        />

        <button onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating...' : 'Generate Ideas'}
        </button>
      </div>

      <div className="ideas-section">
        {ideas.map((idea, index) => (
          <div key={index} className="idea-card">
            <h3>{idea.title}</h3>
            <p>{idea.description}</p>
            <div className="metrics">
              <span>Market Size: R{idea.marketSize.toLocaleString()}</span>
              <span>Capital: R{idea.requiredCapital.toLocaleString()}</span>
              <span>Profit Margin: {(idea.profitMargin * 100).toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Add Career Path Finder

```typescript
// apps/app/components/CareerPathFinder.tsx
import { useState } from 'react';

export function CareerPathFinder() {
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFindPaths = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/sapiens/career-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ skills, interests })
      });

      const data = await response.json();
      setPaths(data.paths);
    } catch (error) {
      console.error('Failed to find paths:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="career-path-finder">
      <h2>Career Path Finder</h2>
      
      <div className="input-section">
        <input
          type="text"
          placeholder="Your skills (comma-separated)"
          onChange={(e) => setSkills(e.target.value.split(',').map(s => s.trim()))}
        />
        <input
          type="text"
          placeholder="Your interests (comma-separated)"
          onChange={(e) => setInterests(e.target.value.split(',').map(i => i.trim()))}
        />
        <button onClick={handleFindPaths} disabled={loading}>
          {loading ? 'Finding...' : 'Find Career Paths'}
        </button>
      </div>

      <div className="paths-section">
        {paths.map((path, index) => (
          <div key={index} className="path-card">
            <h3>{path.title}</h3>
            <p>{path.description}</p>
            <div className="salary-range">
              R{path.salaryRange.min.toLocaleString()} - R{path.salaryRange.max.toLocaleString()}
            </div>
            <div className="next-steps">
              <h4>Next Steps:</h4>
              <ul>
                {path.nextSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Add Funding Finder

```typescript
// apps/app/components/FundingFinder.tsx
import { useState } from 'react';

export function FundingFinder() {
  const [businessType, setBusinessType] = useState('');
  const [amount, setAmount] = useState('');
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFind = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/sapiens/funding-opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessType,
          requiredAmount: parseInt(amount),
          location: 'South Africa'
        })
      });

      const data = await response.json();
      setOpportunities(data.opportunities);
    } catch (error) {
      console.error('Failed to find funding:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="funding-finder">
      <h2>Funding Opportunities</h2>
      
      <div className="input-section">
        <input
          type="text"
          placeholder="Business type"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
        />
        <input
          type="number"
          placeholder="Required amount (R)"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <button onClick={handleFind} disabled={loading}>
          {loading ? 'Searching...' : 'Find Funding'}
        </button>
      </div>

      <div className="opportunities-section">
        {opportunities.map((opp, index) => (
          <div key={index} className="opportunity-card">
            <h3>{opp.name}</h3>
            <div className="type-badge">{opp.type}</div>
            <p>Amount: R{opp.amount.toLocaleString()}</p>
            <p>{opp.terms}</p>
            <a href={opp.url} target="_blank" rel="noopener noreferrer">
              Learn More
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Database Setup

### Prisma Schema Update

Add to `prisma/schema.prisma`:

```prisma
model SapiensSearch {
  id        String   @id @default(cuid())
  userId    String
  query     String
  type      String   // semantic, keyword, hybrid
  results   Int
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([createdAt])
}

model SapiensInteraction {
  id        String   @id @default(cuid())
  userId    String
  type      String   // search, business_idea, career_path, funding
  input     Json
  output    Json
  confidence Float
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([type])
}
```

### Run Migration

```bash
npx prisma migrate dev --name add_sapiens_tables
```

## Monitoring and Logging

### Add Logging

```typescript
import { logger } from '@/services/shared/logging';

logger.info('Sapiens search initiated', {
  query,
  type,
  userId,
  timestamp: new Date()
});
```

### Add Metrics

```typescript
import { metrics } from '@/services/shared/metrics';

metrics.recordHistogram('sapiens.search.duration', duration);
metrics.recordCounter('sapiens.search.total', 1);
metrics.recordGauge('sapiens.results.count', results.length);
```

## Error Handling

```typescript
try {
  const results = await searchEngine.hybridSearch(query);
} catch (error) {
  if (error instanceof PineconeError) {
    logger.error('Vector database error', { error });
    // Return cached results or fallback
  } else if (error instanceof EmbeddingError) {
    logger.error('Embedding generation failed', { error });
    // Use keyword search only
  } else {
    logger.error('Unexpected error', { error });
    // Return generic error response
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Cache search results for 1 hour
const cacheKey = `search:${query}:${type}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const results = await searchEngine.hybridSearch(query);
await redis.setex(cacheKey, 3600, JSON.stringify(results));

return results;
```

### Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => req.user.id
});

app.post('/api/sapiens/search', limiter, searchHandler);
```

## Testing

### Unit Tests

```typescript
// services/azora-sapiens/__tests__/search-engine.test.ts
import SearchEngine from '../src/search-engine';

describe('SearchEngine', () => {
  it('should perform semantic search', async () => {
    const results = await searchEngine.semanticSearch('test query');
    expect(results).toHaveLength(10);
  });

  it('should rank results by relevance', () => {
    const results = [
      { id: '1', relevanceScore: 0.5 },
      { id: '2', relevanceScore: 0.9 }
    ];
    const ranked = searchEngine.rankResults(results);
    expect(ranked[0].id).toBe('2');
  });
});
```

## Deployment

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sapiens-2
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sapiens-2
  template:
    metadata:
      labels:
        app: sapiens-2
    spec:
      containers:
      - name: sapiens-2
        image: azora/sapiens-2:latest
        ports:
        - containerPort: 3001
        env:
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: sapiens-secrets
              key: openai-key
        - name: PINECONE_API_KEY
          valueFrom:
            secretKeyRef:
              name: sapiens-secrets
              key: pinecone-key
```

## Support

For issues or questions, refer to the main README or contact the development team.
