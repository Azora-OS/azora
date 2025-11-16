# Azora Sapiens 2.0 - Complete Full Integration Guide

## 🎯 Integration Overview

This guide covers the complete integration of Azora Sapiens 2.0 across the entire Azora ecosystem with full Africa expansion.

## 📋 Integration Checklist

### Core System Integration
- [x] Embedding Service (OpenAI)
- [x] Vector Database (Pinecone)
- [x] Search Engine (Semantic + Keyword + Hybrid)
- [x] Knowledge Ocean (Multi-type storage)
- [x] Data Ingestion Scheduler
- [x] AI Family Intelligence (Elara, Themba, Naledi, Kofi)
- [x] API Endpoints (6 core endpoints)
- [x] Africa Expansion (15 countries)
- [x] Language Service (9 languages)
- [x] Regional Search API

### Student Portal Integration
- [ ] Search Widget Component
- [ ] Business Idea Generator Component
- [ ] Career Path Finder Component
- [ ] Market Analysis Component
- [ ] Funding Finder Component
- [ ] Regional Selector Component
- [ ] Language Selector Component

### Mobile App Integration
- [ ] iOS App Integration
- [ ] Android App Integration
- [ ] Offline Support
- [ ] Biometric Auth
- [ ] Push Notifications

### Backend Integration
- [ ] Database Schema Updates
- [ ] Authentication Integration
- [ ] Logging Integration
- [ ] Metrics Integration
- [ ] Error Handling
- [ ] Rate Limiting

### DevOps Integration
- [ ] Docker Configuration
- [ ] Kubernetes Deployment
- [ ] CI/CD Pipeline
- [ ] Monitoring Setup
- [ ] Alerting Configuration
- [ ] Backup Strategy

## 🔧 Step-by-Step Integration

### Step 1: Environment Setup

```bash
# 1. Install dependencies
cd services/azora-sapiens
npm install

# 2. Create environment file
cat > .env << EOF
# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX_NAME=azora-knowledge

# Data Sources
NEWSAPI_KEY=...
ALPHAVANTAGE_KEY=...
CRYPTO_API_KEY=...

# Service
NODE_ENV=production
PORT=3001
LOG_LEVEL=info

# Database
DATABASE_URL=postgresql://...

# Redis
REDIS_URL=redis://...
EOF

# 3. Build
npm run build

# 4. Start
npm start
```

### Step 2: Database Integration

```sql
-- Add Sapiens tables to Prisma schema
model SapiensSearch {
  id        String   @id @default(cuid())
  userId    String
  query     String
  country   String
  language  String
  type      String   // semantic, keyword, hybrid
  results   Int
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([country])
  @@index([createdAt])
}

model SapiensInteraction {
  id        String   @id @default(cuid())
  userId    String
  type      String   // search, business_idea, career_path, funding
  country   String
  language  String
  input     Json
  output    Json
  confidence Float
  createdAt DateTime @default(now())
  
  @@index([userId])
  @@index([country])
  @@index([type])
}

-- Run migration
npx prisma migrate dev --name add_sapiens_tables
```

### Step 3: React Component Integration

```typescript
// apps/app/components/SapiensIntegration.tsx
import { SapiensSearch } from './SapiensSearch';
import { BusinessIdeaGenerator } from './BusinessIdeaGenerator';
import { CareerPathFinder } from './CareerPathFinder';
import { MarketAnalysis } from './MarketAnalysis';
import { FundingFinder } from './FundingFinder';
import { RegionalSelector } from './RegionalSelector';
import { LanguageSelector } from './LanguageSelector';

export function SapiensIntegration() {
  const [country, setCountry] = useState('south-africa');
  const [language, setLanguage] = useState('en');

  return (
    <div className="sapiens-integration">
      <div className="controls">
        <RegionalSelector value={country} onChange={setCountry} />
        <LanguageSelector value={language} onChange={setLanguage} />
      </div>

      <div className="components">
        <SapiensSearch country={country} language={language} />
        <BusinessIdeaGenerator country={country} language={language} />
        <CareerPathFinder country={country} language={language} />
        <MarketAnalysis country={country} language={language} />
        <FundingFinder country={country} language={language} />
      </div>
    </div>
  );
}
```

### Step 4: API Integration

```typescript
// apps/app/api/sapiens/[...route].ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Route to appropriate handler
  if (pathname.includes('/search')) {
    return handleSearch(request);
  } else if (pathname.includes('/business-idea')) {
    return handleBusinessIdea(request);
  } else if (pathname.includes('/career-path')) {
    return handleCareerPath(request);
  } else if (pathname.includes('/market-analysis')) {
    return handleMarketAnalysis(request);
  } else if (pathname.includes('/funding')) {
    return handleFunding(request);
  } else if (pathname.includes('/africa/regional-search')) {
    return handleRegionalSearch(request);
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
```

### Step 5: Authentication Integration

```typescript
// Middleware to protect Sapiens endpoints
import { withAuth } from '@/services/shared/middleware/auth';

export const config = {
  matcher: ['/api/sapiens/:path*'],
};

export function middleware(request: NextRequest) {
  return withAuth(request);
}
```

### Step 6: Logging Integration

```typescript
// Add logging to all Sapiens operations
import { logger } from '@/services/shared/logging';

logger.info('Sapiens search initiated', {
  query,
  country,
  language,
  userId,
  timestamp: new Date(),
});

logger.error('Sapiens search failed', {
  error: error.message,
  query,
  userId,
});
```

### Step 7: Metrics Integration

```typescript
// Track Sapiens metrics
import { metrics } from '@/services/shared/metrics';

metrics.recordHistogram('sapiens.search.duration', duration);
metrics.recordCounter('sapiens.search.total', 1);
metrics.recordGauge('sapiens.results.count', results.length);
metrics.recordCounter('sapiens.country', 1, { country });
metrics.recordCounter('sapiens.language', 1, { language });
```

### Step 8: Error Handling Integration

```typescript
// Centralized error handling
import { handleError } from '@/services/shared/error-handler';

try {
  const results = await searchEngine.hybridSearch(query);
} catch (error) {
  const response = handleError(error, {
    context: 'sapiens-search',
    userId,
    query,
  });
  return NextResponse.json(response, { status: response.statusCode });
}
```

### Step 9: Rate Limiting Integration

```typescript
// Apply rate limiting to Sapiens endpoints
import rateLimit from 'express-rate-limit';

const sapiensLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  keyGenerator: (req) => req.user.id,
  message: 'Too many requests, please try again later',
});

app.post('/api/sapiens/search', sapiensLimiter, searchHandler);
```

### Step 10: Monitoring Integration

```typescript
// Health check endpoint
export async function GET(request: NextRequest) {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      embeddings: await checkEmbeddingsService(),
      vectorStorage: await checkVectorStorage(),
      searchEngine: await checkSearchEngine(),
      dataIngestion: await checkDataIngestion(),
    },
    version: '2.0.0',
    uptime: process.uptime(),
  };

  return NextResponse.json(health);
}
```

## 🌍 Africa Integration

### Regional Deployment

```bash
# Deploy to South Africa
kubectl apply -f deployment/sa-deployment.yaml

# Deploy to Nigeria
kubectl apply -f deployment/ng-deployment.yaml

# Deploy to Kenya
kubectl apply -f deployment/ke-deployment.yaml

# Deploy to Egypt
kubectl apply -f deployment/eg-deployment.yaml
```

### Regional Configuration

```typescript
// Configure regional settings
const regionConfig = {
  'south-africa': {
    region: 'af-south-1',
    currency: 'ZAR',
    language: 'en',
    timezone: 'Africa/Johannesburg',
  },
  'nigeria': {
    region: 'af-west-1',
    currency: 'NGN',
    language: 'en',
    timezone: 'Africa/Lagos',
  },
  // ... more regions
};
```

## 📊 Testing Integration

### Unit Tests

```bash
# Test Sapiens services
npm test -- services/azora-sapiens

# Test API endpoints
npm test -- apps/app/api/sapiens

# Test Africa expansion
npm test -- services/azora-sapiens/src/regions
```

### Integration Tests

```bash
# Test full flow
npm test -- tests/integration/sapiens-full-flow.test.ts

# Test regional search
npm test -- tests/integration/sapiens-regional-search.test.ts

# Test language service
npm test -- tests/integration/sapiens-language-service.test.ts
```

### E2E Tests

```bash
# Test complete user journey
npm run test:e2e -- tests/e2e/sapiens-journey.spec.ts

# Test regional features
npm run test:e2e -- tests/e2e/sapiens-africa.spec.ts
```

## 🚀 Deployment

### Docker Build

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3001

CMD ["node", "dist/index.js"]
```

### Kubernetes Deployment

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
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
```

## 📈 Performance Optimization

### Caching Strategy

```typescript
// Cache search results
const cacheKey = `search:${query}:${country}:${language}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const results = await searchEngine.hybridSearch(query);
await redis.setex(cacheKey, 3600, JSON.stringify(results));

return results;
```

### Query Optimization

```typescript
// Optimize vector search
const results = await vectorStorage.semanticSearch(queryVector, {
  topK: 10,
  filters: {
    country,
    verified: true,
    date: { $gte: thirtyDaysAgo },
  },
});
```

## 🔐 Security Hardening

### Input Validation

```typescript
// Validate all inputs
const schema = z.object({
  query: z.string().min(1).max(500),
  country: z.enum(supportedCountries),
  language: z.enum(supportedLanguages),
  type: z.enum(['semantic', 'keyword', 'hybrid']),
});

const validated = schema.parse(input);
```

### Rate Limiting

```typescript
// Implement rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  keyGenerator: (req) => req.user.id,
});
```

## 📞 Support & Maintenance

### Monitoring

- Prometheus metrics
- Grafana dashboards
- ELK logging
- Alert rules

### Maintenance

- Regular backups
- Database optimization
- Cache cleanup
- Log rotation

## ✅ Completion Checklist

- [x] Core Sapiens 2.0 implementation
- [x] Africa expansion (15 countries)
- [x] Language support (9 languages)
- [x] Regional search API
- [x] Currency conversion
- [x] API endpoints
- [x] Documentation
- [ ] Student portal integration
- [ ] Mobile app integration
- [ ] Full testing
- [ ] Production deployment

---

**Status**: ✅ INTEGRATION READY
**Version**: 2.0.0
**Coverage**: 15 African Countries, 9 Languages
**Date**: November 16, 2025
