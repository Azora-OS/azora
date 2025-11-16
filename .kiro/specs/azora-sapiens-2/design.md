# Azora Sapiens 2.0 - Design Document

## Overview

Azora Sapiens 2.0 is a real-time knowledge engine that powers the AI Family with current, verified information. It combines semantic search, real-time data ingestion, and intelligent routing to provide solid, sourced answers instead of generic responses.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Student Portal                            │
│  (Search Widget, Business Ideas, Career Guidance)           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API Layer                                 │
│  /api/sapiens/search                                        │
│  /api/sapiens/business-idea                                 │
│  /api/sapiens/market-analysis                               │
│  /api/sapiens/career-path                                   │
│  /api/sapiens/funding-opportunities                         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  AI Family Layer                             │
│  ├─ Elara (Educational Intelligence)                        │
│  ├─ Themba (Career Intelligence)                            │
│  ├─ Naledi (Business Intelligence)                          │
│  └─ Kofi (Financial Intelligence)                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Search Engine Layer                         │
│  ├─ Semantic Search (Vector DB)                             │
│  ├─ Keyword Search (BM25)                                   │
│  └─ Hybrid Search (Combined)                                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                Knowledge Ocean Layer                         │
│  ├─ News Data                                               │
│  ├─ Market Data                                             │
│  ├─ Research Data                                           │
│  ├─ SA-Specific Data                                        │
│  └─ Student Ecosystem Data                                  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  Data Sources                                │
│  ├─ NewsAPI                                                 │
│  ├─ Alpha Vantage                                           │
│  ├─ ArXiv                                                   │
│  ├─ Stats SA                                                │
│  └─ Azora Ecosystem                                         │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Knowledge Ocean
- Stores all ingested data with metadata
- Generates embeddings for semantic search
- Supports filtering and querying
- Real-time update capability

### 2. Search Engine
- Semantic search using vector similarity
- Keyword search using BM25
- Hybrid search combining both
- Result ranking and deduplication

### 3. AI Family Intelligence
- Elara: Educational research and lesson planning
- Themba: Career path and job market analysis
- Naledi: Business ideas and market opportunities
- Kofi: Financial analysis and funding opportunities

### 4. Data Ingestion Pipeline
- Scheduled updates from multiple sources
- Error handling and retries
- Data validation and cleaning
- Metadata extraction

### 5. Vector Database
- Pinecone/Weaviate for semantic search
- Embedding generation and storage
- Fast similarity search
- Metadata filtering

## Data Models

### Knowledge Entry
```typescript
interface KnowledgeEntry {
  id: string;
  type: 'news' | 'research' | 'market' | 'student' | 'business' | 'trend';
  source: string;
  url: string;
  content: string;
  embedding: number[];
  metadata: {
    date: Date;
    relevance: number;
    verified: boolean;
    category: string;
    tags: string[];
  };
}
```

### Search Result
```typescript
interface SearchResult {
  id: string;
  title: string;
  content: string;
  source: string;
  url: string;
  relevance: number;
  confidence: number;
  date: Date;
}
```

### AI Response
```typescript
interface AIResponse {
  answer: string;
  sources: SearchResult[];
  confidence: number;
  aiMember: 'elara' | 'themba' | 'naledi' | 'kofi';
  metadata: {
    searchTime: number;
    resultCount: number;
  };
}
```

## API Endpoints

### Search
```
POST /api/sapiens/search
{
  query: string;
  type?: 'web' | 'sa' | 'ecosystem' | 'business';
  filters?: {
    dateRange?: [Date, Date];
    verified?: boolean;
    category?: string;
  };
}
```

### Business Idea
```
POST /api/sapiens/business-idea
{
  skills: string[];
  interests: string[];
  market: string;
}
```

### Market Analysis
```
POST /api/sapiens/market-analysis
{
  industry: string;
  location: string;
}
```

### Career Path
```
POST /api/sapiens/career-path
{
  skills: string[];
  interests: string[];
}
```

### Funding Opportunities
```
POST /api/sapiens/funding-opportunities
{
  businessType: string;
  amount: number;
}
```

## Data Flow

1. **Ingestion**: Data sources → Data Ingestion Pipeline → Knowledge Ocean
2. **Embedding**: Knowledge Ocean → Embedding Service → Vector Database
3. **Search**: User Query → Search Engine → Vector DB + Keyword Search → Results
4. **AI Response**: Search Results → AI Family Member → Formatted Response
5. **API Response**: AI Response → API Endpoint → Student Portal

## Error Handling

- Data source failures: Log and retry with exponential backoff
- Search failures: Return cached results or fallback to keyword search
- Embedding failures: Skip embedding, use keyword search only
- API failures: Return error with fallback suggestions

## Performance Considerations

- Cache search results for 1 hour
- Batch embedding generation
- Limit search results to top 10
- Implement rate limiting (100 requests/minute per user)
- Use CDN for static content

## Security

- Validate all user inputs
- Sanitize search queries
- Rate limit API endpoints
- Authenticate all requests
- Log all searches for audit trail

## Testing Strategy

- Unit tests for each component
- Integration tests for data flow
- API endpoint tests
- Performance tests for search
- Load tests for concurrent users

## Deployment

- Deploy vector database first
- Deploy data ingestion pipeline
- Deploy search engine
- Deploy AI Family services
- Deploy API endpoints
- Monitor and verify all components
