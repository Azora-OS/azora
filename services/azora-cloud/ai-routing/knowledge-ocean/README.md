# Knowledge Ocean - Vector Database Retrieval System

## Overview

Knowledge Ocean implements the 70/30 rule for AI context retrieval:
- 70% internal sources (Azora databases, courses, constitution)
- 30% external sources (web, APIs, external knowledge bases)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Knowledge Ocean                        │
│                                                          │
│  ┌──────────────────┐      ┌──────────────────┐       │
│  │ Vector DB Client │      │  70/30 Retriever │       │
│  │   (Pinecone)     │◄─────┤   (Core Logic)   │       │
│  └──────────────────┘      └──────────────────┘       │
│                                      │                  │
│                                      ▼                  │
│                            ┌──────────────────┐        │
│                            │ Context Injector │        │
│                            └──────────────────┘        │
└─────────────────────────────────────────────────────────┘
```

## Components

### Vector Database Client (`vector-db-client.ts`)
- Connects to Pinecone vector database
- Performs semantic search using embeddings
- Manages document CRUD operations

### 70/30 Retriever (`retriever.ts`)
- Enforces 70/30 internal/external ratio
- Ranks documents by relevance
- Applies diversity scoring

### Context Injector (`context-injector.ts`)
- Formats retrieved documents for AI prompts
- Handles token limits
- Creates structured context

## Setup

### 1. Pinecone Account Setup

1. Sign up at https://www.pinecone.io/
2. Create a new project
3. Create an index with:
   - Dimensions: 1536 (for OpenAI embeddings)
   - Metric: cosine
   - Pod type: p1.x1 (starter)

### 2. Environment Variables

```bash
PINECONE_API_KEY=your_api_key_here
PINECONE_ENVIRONMENT=your_environment_here
PINECONE_INDEX_NAME=azora-knowledge-ocean
OPENAI_API_KEY=your_openai_key_here
```

### 3. Install Dependencies

```bash
npm install @pinecone-database/pinecone openai
```

## Usage

```typescript
import { KnowledgeOceanRetriever } from './knowledge-ocean/retriever';

const retriever = new KnowledgeOceanRetriever();

// Retrieve context for a query
const result = await retriever.retrieve('What is Ubuntu philosophy?');

console.log(result.documents); // Retrieved documents
console.log(result.internalCount); // Number of internal sources
console.log(result.externalCount); // Number of external sources
```

## Performance Targets

- Retrieval latency: <100ms (p95)
- 70/30 ratio adherence: 100%
- Relevance score: >0.7 average

## Monitoring

Key metrics tracked:
- Retrieval latency
- 70/30 ratio compliance
- Average relevance scores
- Cache hit rates
- Document usage statistics
