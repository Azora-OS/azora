# Azora Sapiens 2.0 - Architecture Documentation

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STUDENT PORTAL                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Search     │  │  Business    │  │   Career     │              │
│  │   Widget     │  │   Ideas      │  │   Finder     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                        API LAYER (6 Endpoints)                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Search   │ │ Business │ │ Market   │ │ Career   │ │ Funding  │ │
│  │          │ │ Ideas    │ │ Analysis │ │ Path     │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    AI FAMILY LAYER (4 Modules)                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌────────────┐ │
│  │    ELARA     │ │    THEMBA    │ │    NALEDI    │ │    KOFI    │ │
│  │ Educational │ │    Career    │ │   Business   │ │  Financial │ │
│  │ Intelligence │ │ Intelligence │ │ Intelligence │ │Intelligence│ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    SEARCH ENGINE LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    HYBRID SEARCH                             │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │   │
│  │  │  Semantic    │  │   Keyword    │  │   Ranking    │       │   │
│  │  │   Search     │  │   Search     │  │   Engine     │       │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    KNOWLEDGE OCEAN LAYER                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │   News   │ │ Research │ │  Market  │ │    SA    │ │Ecosystem │ │
│  │  Data    │ │  Papers  │ │   Data   │ │   Data   │ │   Data   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    STORAGE LAYER                                    │
│  ┌──────────────────────────┐  ┌──────────────────────────┐         │
│  │   Vector Database        │  │   Embedding Cache        │         │
│  │   (Pinecone)             │  │   (Node-Cache)           │         │
│  │                          │  │                          │         │
│  │ - Semantic Search        │  │ - 24-hour TTL            │         │
│  │ - Metadata Filtering     │  │ - 80%+ Hit Rate          │         │
│  │ - Batch Operations       │  │ - Performance Optimized  │         │
│  └──────────────────────────┘  └──────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    DATA SOURCES                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ NewsAPI  │ │ ArXiv    │ │ Alpha    │ │ Stats SA │ │ CoinGecko│ │
│  │          │ │          │ │ Vantage  │ │ + JSE    │ │          │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        DATA INGESTION FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

External APIs
    ↓
    ├─→ NewsAPI (Hourly)
    ├─→ Alpha Vantage (Every minute)
    ├─→ ArXiv (Every 6 hours)
    ├─→ Stats SA (Every 6 hours)
    └─→ CoinGecko (Every minute)
    ↓
Data Source Adapters
    ├─→ News Source
    ├─→ Market Source
    ├─→ Research Source
    ├─→ South Africa Source
    └─→ Ecosystem Source
    ↓
Data Validation & Cleaning
    ├─→ Content validation
    ├─→ Duplicate detection
    └─→ Source verification
    ↓
Embedding Generation
    ├─→ OpenAI API
    ├─→ Batch processing
    └─→ Caching
    ↓
Knowledge Ocean
    ├─→ Store with metadata
    ├─→ Index by type/category
    └─→ Track statistics
    ↓
Vector Database (Pinecone)
    ├─→ Store embeddings
    ├─→ Index for search
    └─→ Enable semantic search
```

## Search Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SEARCH FLOW                                  │
└─────────────────────────────────────────────────────────────────────┘

User Query
    ↓
Input Validation
    ├─→ Check query length
    ├─→ Sanitize input
    └─→ Validate filters
    ↓
Search Type Selection
    ├─→ Semantic Search
    │   ├─→ Generate query embedding
    │   ├─→ Vector similarity search
    │   └─→ Return top-K results
    │
    ├─→ Keyword Search
    │   ├─→ Tokenize query
    │   ├─→ BM25 scoring
    │   └─→ Return top-K results
    │
    └─→ Hybrid Search
        ├─→ Run semantic search (70% weight)
        ├─→ Run keyword search (30% weight)
        ├─→ Combine and deduplicate
        └─→ Return top-K results
    ↓
Result Ranking
    ├─→ Relevance score
    ├─→ Recency score
    ├─→ Verification status
    └─→ Source credibility
    ↓
Response Formatting
    ├─→ Add metadata
    ├─→ Include sources
    ├─→ Add confidence scores
    └─→ Return to user
```

## AI Intelligence Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AI INTELLIGENCE FLOW                             │
└─────────────────────────────────────────────────────────────────────┘

User Request
    ↓
Request Type Detection
    ├─→ Educational → Elara
    ├─→ Career → Themba
    ├─→ Business → Naledi
    └─→ Financial → Kofi
    ↓
ELARA (Educational)
    ├─→ Search for educational resources
    ├─→ Generate learning objectives
    ├─→ Create lesson plan
    ├─→ Design assessments
    └─→ Return with sources
    ↓
THEMBA (Career)
    ├─→ Search job market data
    ├─→ Match skills to careers
    ├─→ Analyze salary trends
    ├─→ Find opportunities
    └─→ Return career paths
    ↓
NALEDI (Business)
    ├─→ Search market data
    ├─→ Identify opportunities
    ├─→ Analyze competitors
    ├─→ Extract trends
    └─→ Return business ideas
    ↓
KOFI (Finance)
    ├─→ Search financial data
    ├─→ Calculate metrics
    ├─→ Find funding sources
    ├─→ Analyze viability
    └─→ Return analysis
    ↓
Response Synthesis
    ├─→ Combine results
    ├─→ Calculate confidence
    ├─→ Add recommendations
    └─→ Return to user
```

## Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                    COMPONENT INTERACTIONS                            │
└──────────────────────────────────────────────────────────────────────┘

API Endpoints
    ↓
    ├─→ Search Endpoint
    │   ├─→ SearchEngine
    │   │   ├─→ EmbeddingService
    │   │   ├─→ VectorStorageService
    │   │   └─→ KnowledgeOcean
    │   └─→ Return results
    │
    ├─→ Business Idea Endpoint
    │   ├─→ NalediIntelligence
    │   │   ├─→ SearchEngine
    │   │   └─→ KnowledgeOcean
    │   └─→ Return ideas
    │
    ├─→ Career Path Endpoint
    │   ├─→ ThembaIntelligence
    │   │   ├─→ SearchEngine
    │   │   └─→ KnowledgeOcean
    │   └─→ Return paths
    │
    ├─→ Market Analysis Endpoint
    │   ├─→ NalediIntelligence
    │   │   ├─→ SearchEngine
    │   │   └─→ KnowledgeOcean
    │   └─→ Return analysis
    │
    ├─→ Funding Endpoint
    │   ├─→ KofiIntelligence
    │   │   ├─→ SearchEngine
    │   │   └─→ KnowledgeOcean
    │   └─→ Return opportunities
    │
    └─→ Health Endpoint
        └─→ Return service status

Data Ingestion
    ↓
    ├─→ Scheduler
    │   ├─→ NewsDataSource
    │   ├─→ MarketDataSource
    │   ├─→ ResearchDataSource
    │   ├─→ SouthAfricaDataSource
    │   └─→ EcosystemDataSource
    │
    └─→ KnowledgeOcean
        ├─→ EmbeddingService
        ├─→ VectorStorageService
        └─→ Store & Index
```

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT ARCHITECTURE                           │
└──────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                    KUBERNETES CLUSTER                               │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    INGRESS                                   │  │
│  │  (API Gateway / Load Balancer)                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              SAPIENS-2 SERVICE (3 Replicas)                 │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  Pod 1: API + Search + AI Intelligence                │ │  │
│  │  │  - Express Server                                     │ │  │
│  │  │  - Search Engine                                      │ │  │
│  │  │  - AI Modules                                         │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  Pod 2: Data Ingestion + Scheduler                    │ │  │
│  │  │  - Scheduler                                          │ │  │
│  │  │  - Data Sources                                       │ │  │
│  │  │  - Knowledge Ocean                                    │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  │  ┌────────────────────────────────────────────────────────┐ │  │
│  │  │  Pod 3: Caching + Monitoring                          │ │  │
│  │  │  - Embedding Cache                                    │ │  │
│  │  │  - Metrics Collection                                 │ │  │
│  │  │  - Health Checks                                      │ │  │
│  │  └────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              ↓                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              EXTERNAL SERVICES                              │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │  │
│  │  │  Pinecone    │ │  OpenAI      │ │  Redis       │        │  │
│  │  │  (Vector DB) │ │  (Embeddings)│ │  (Cache)     │        │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Technology Stack

```
┌──────────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                                  │
└──────────────────────────────────────────────────────────────────────┘

Language & Runtime
├─→ TypeScript (Strict Mode)
├─→ Node.js 18+
└─→ Express.js

AI & ML
├─→ OpenAI API (Embeddings)
├─→ Pinecone (Vector Database)
└─→ Custom Search Algorithms

Data Processing
├─→ Axios (HTTP Client)
├─→ Node-Cache (In-Memory Cache)
├─→ Node-Cron (Scheduling)
└─→ UUID (ID Generation)

Database
├─→ Prisma ORM
├─→ PostgreSQL (Primary)
└─→ Pinecone (Vector Store)

Testing
├─→ Jest
├─→ Supertest
└─→ Mock Data

Deployment
├─→ Docker
├─→ Kubernetes
├─→ GitHub Actions
└─→ Helm Charts

Monitoring
├─→ Prometheus
├─→ Grafana
├─→ ELK Stack
└─→ Custom Logging
```

## Security Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                   │
└──────────────────────────────────────────────────────────────────────┘

1. API Layer Security
   ├─→ JWT Authentication
   ├─→ Rate Limiting
   ├─→ Input Validation
   └─→ CORS Configuration

2. Data Layer Security
   ├─→ Encrypted Connections
   ├─→ API Key Management
   ├─→ Secrets Rotation
   └─→ Access Control

3. Application Security
   ├─→ Error Message Sanitization
   ├─→ SQL Injection Prevention
   ├─→ XSS Protection
   └─→ CSRF Tokens

4. Infrastructure Security
   ├─→ Network Policies
   ├─→ Pod Security Policies
   ├─→ RBAC
   └─→ Audit Logging
```

---

**Architecture Version**: 2.0.0
**Last Updated**: November 16, 2025
**Status**: Production Ready
