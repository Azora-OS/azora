# Knowledge Ocean Architecture

## Overview

Knowledge Ocean is a vector database retrieval system that implements the 70/30 rule for AI context retrieval. It ensures that AI responses are grounded in relevant internal and external knowledge sources.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        API Gateway                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AI Routing System                             │
│                                                                  │
│  ┌──────────────────┐         ┌──────────────────┐            │
│  │ Query Classifier │────────►│ Routing Decision │            │
│  └──────────────────┘         └──────────────────┘            │
│                                         │                       │
│                                         ▼                       │
│                              ┌─────────────────┐               │
│                              │  RAP Required?  │               │
│                              └────────┬────────┘               │
│                                       │ Yes                     │
└───────────────────────────────────────┼─────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Knowledge Ocean                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Connection Layer                         │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         PineconeConnection (Singleton)             │  │  │
│  │  │  - Manages connection lifecycle                    │  │  │
│  │  │  - Health checks                                   │  │  │
│  │  │  - Index management                                │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Data Access Layer                        │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │            VectorDBClient                          │  │  │
│  │  │  - search(embedding, options)                     │  │  │
│  │  │  - upsert(documents)                              │  │  │
│  │  │  - delete(ids)                                    │  │  │
│  │  │  - fetch(ids)                                     │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Business Logic Layer                     │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         KnowledgeOceanRetriever (Future)          │  │  │
│  │  │  - retrieve(query)                                │  │  │
│  │  │  - enforce70/30Rule(documents)                    │  │  │
│  │  │  - rankDocuments(documents)                       │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │         ContextInjector (Future)                  │  │  │
│  │  │  - injectContext(prompt, documents)               │  │  │
│  │  │  - formatContext(documents)                       │  │  │
│  │  │  - truncateToTokenLimit(context)                  │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

### 1. Connection Layer

**PineconeConnection** (`connection.ts`)
- **Purpose**: Manages the lifecycle of the Pinecone connection
- **Pattern**: Singleton
- **Responsibilities**:
  - Initialize connection to Pinecone
  - Manage connection state
  - Provide health checks
  - Create and manage indexes
  - Handle connection errors and retries

**Key Methods**:
```typescript
- getInstance(config): Get singleton instance
- connect(): Initialize connection
- getClient(): Get Pinecone client
- getIndex(name): Get specific index
- indexExists(name): Check if index exists
- ensureIndex(name, dimension, metric): Create index if needed
- healthCheck(): Verify connection health
- disconnect(): Close connection
```

### 2. Data Access Layer

**VectorDBClient** (`vector-db-client.ts`)
- **Purpose**: Provides CRUD operations for vector database
- **Pattern**: Repository
- **Responsibilities**:
  - Execute vector similarity searches
  - Insert/update documents with embeddings
  - Delete documents
  - Fetch documents by ID
  - Manage metadata

**Key Methods**:
```typescript
- search(embedding, options): Find similar documents
- upsert(documents, options): Insert or update documents
- delete(ids): Remove documents
- fetch(ids): Get documents by ID
- getStats(): Get index statistics
- updateMetadata(id, metadata): Update document metadata
```

### 3. Business Logic Layer (Future Tasks)

**KnowledgeOceanRetriever** (Task 8 - Not yet implemented)
- **Purpose**: Implements 70/30 retrieval rule
- **Responsibilities**:
  - Retrieve relevant documents for queries
  - Enforce 70% internal / 30% external ratio
  - Rank documents by relevance
  - Apply diversity scoring

**ContextInjector** (Task 10 - Not yet implemented)
- **Purpose**: Formats retrieved context for AI prompts
- **Responsibilities**:
  - Format documents into prompt context
  - Handle token limits
  - Create structured context templates

## Data Flow

### Document Ingestion Flow

```
1. Document Source (DB, Files, APIs)
   │
   ▼
2. Generate Embedding (OpenAI)
   │
   ▼
3. Create Document Object
   │
   ▼
4. VectorDBClient.upsert()
   │
   ▼
5. Pinecone Index
```

### Query Retrieval Flow

```
1. User Query
   │
   ▼
2. Generate Query Embedding (OpenAI)
   │
   ▼
3. VectorDBClient.search()
   │
   ▼
4. Pinecone Vector Search
   │
   ▼
5. Filter by Relevance Score
   │
   ▼
6. Apply 70/30 Rule (Future)
   │
   ▼
7. Rank Documents (Future)
   │
   ▼
8. Format Context (Future)
   │
   ▼
9. Inject into AI Prompt
```

## Configuration Management

**Config** (`config.ts`)
- Centralized configuration management
- Environment variable loading
- Configuration validation
- Default values

**Configuration Sections**:
1. **Pinecone Settings**: API key, environment, index name
2. **OpenAI Settings**: API key, embedding model
3. **Retrieval Settings**: 70/30 ratios, relevance thresholds
4. **Performance Settings**: Cache TTL, batch sizes, timeouts
5. **Feature Flags**: Enable/disable features

## Error Handling Strategy

### Connection Errors
- Retry with exponential backoff
- Fallback to cached results if available
- Log errors for monitoring
- Graceful degradation

### Search Errors
- Return empty results on timeout
- Log search failures
- Provide fallback to keyword search

### Upsert Errors
- Batch retry on partial failures
- Queue failed documents for retry
- Alert on persistent failures

## Performance Considerations

### Optimization Strategies

1. **Connection Pooling**
   - Singleton connection instance
   - Reuse connections across requests

2. **Batch Operations**
   - Batch upserts for efficiency
   - Configurable batch sizes

3. **Caching** (Future)
   - Cache frequent queries
   - TTL-based invalidation

4. **Async Operations**
   - Non-blocking I/O
   - Promise-based API

### Performance Targets

- **Search Latency**: <100ms (p95)
- **Upsert Throughput**: >1000 docs/sec
- **Connection Health**: 99.9% uptime
- **Cache Hit Rate**: >40% (future)

## Security Considerations

### API Key Management
- Store keys in environment variables
- Never commit keys to version control
- Rotate keys regularly

### Access Control
- Document-level access control via metadata
- Filter results by user permissions
- Audit log all access

### Data Privacy
- Encrypt embeddings at rest
- Sanitize PII before indexing
- Implement data retention policies

## Monitoring and Observability

### Key Metrics

1. **Connection Metrics**
   - Connection health status
   - Connection errors
   - Reconnection attempts

2. **Search Metrics**
   - Search latency (p50, p95, p99)
   - Search success rate
   - Average relevance scores

3. **Upsert Metrics**
   - Upsert throughput
   - Upsert failures
   - Batch sizes

4. **Index Metrics**
   - Total document count
   - Index size
   - Namespace distribution

### Logging Strategy

- **Info**: Successful operations, stats
- **Warn**: Retries, degraded performance
- **Error**: Failures, exceptions
- **Debug**: Detailed operation traces

## Testing Strategy

### Unit Tests
- Test each component in isolation
- Mock external dependencies
- Test error handling

### Integration Tests
- Test with real Pinecone instance
- Test end-to-end flows
- Test error scenarios

### Performance Tests
- Load testing with concurrent requests
- Latency benchmarking
- Throughput testing

## Future Enhancements

1. **Multi-Index Support**
   - Support multiple indexes for different domains
   - Cross-index search

2. **Advanced Filtering**
   - Complex metadata filters
   - Date range queries
   - Faceted search

3. **Hybrid Search**
   - Combine vector and keyword search
   - Weighted result merging

4. **Real-time Updates**
   - Streaming document updates
   - Incremental indexing

5. **Analytics**
   - Query analytics
   - Document usage tracking
   - Relevance feedback loop

## Dependencies

### External Services
- **Pinecone**: Vector database
- **OpenAI**: Embedding generation

### NPM Packages
- `@pinecone-database/pinecone`: Pinecone client
- `openai`: OpenAI API client
- `dotenv`: Environment variable management

## Related Documentation

- [Setup Guide](./SETUP-GUIDE.md)
- [README](./README.md)
- [Design Document](../../../.kiro/specs/final-completion/design.md)
- [Requirements](../../../.kiro/specs/final-completion/requirements.md)
