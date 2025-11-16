# Azora Sapiens 2.0 - Knowledge Engine Requirements

## Introduction

Azora Sapiens 2.0 is a real-time knowledge engine that powers the AI Family (Elara, Themba, Naledi, Kofi) with current, verified information from a knowledge ocean. Instead of playing with generic responses, Sapiens 2.0 searches, verifies, and delivers solid results based on latest data.

## Glossary

- **Knowledge Ocean**: Aggregated data from news, market, research, and student ecosystem sources
- **Vector Database**: Semantic search database storing embeddings for fast retrieval
- **Semantic Search**: Finding similar content based on meaning, not just keywords
- **Hybrid Search**: Combining semantic and keyword search for better results
- **Data Source**: External API or database providing information (NewsAPI, Alpha Vantage, etc.)
- **Embedding**: Vector representation of text for semantic search
- **AI Family**: Elara (Teacher), Themba (Career), Naledi (Business), Kofi (Finance)

## Requirements

### Requirement 1: Knowledge Ocean

**User Story:** As an AI Family member, I want access to a comprehensive knowledge ocean so that I can provide current, verified information to students.

#### Acceptance Criteria

1. WHEN a data source is ingested, THE Knowledge Ocean SHALL store content with metadata (date, source, category, verification status)
2. WHILE the system is running, THE Knowledge Ocean SHALL receive real-time updates from news, market, and research sources
3. IF a student asks a question, THE Knowledge Ocean SHALL return relevant information with confidence scores
4. WHERE optional, THE Knowledge Ocean SHALL support filtering by date range, category, and verification status
5. WHEN data is stored, THE Knowledge Ocean SHALL generate embeddings for semantic search

### Requirement 2: Custom Search Engine

**User Story:** As an AI Family member, I want to search across multiple data sources so that I can find the latest and most relevant information.

#### Acceptance Criteria

1. WHEN a search query is submitted, THE Search Engine SHALL query multiple sources (news, market, research, SA data)
2. WHILE searching, THE Search Engine SHALL perform both semantic and keyword search
3. IF results are found, THE Search Engine SHALL rank by relevance and recency
4. WHERE optional, THE Search Engine SHALL support SA-specific searches
5. WHEN results are returned, THE Search Engine SHALL include source attribution and confidence scores

### Requirement 3: AI Family Intelligence

**User Story:** As an AI Family member, I want to use the knowledge engine to provide intelligent, personalized guidance so that students get solid, verified answers.

#### Acceptance Criteria

1. WHEN Elara receives an educational question, THE System SHALL search for latest research and best practices
2. WHEN Themba receives a career question, THE System SHALL search job market data and trends
3. WHEN Naledi receives a business question, THE System SHALL search market opportunities and competitor data
4. WHEN Kofi receives a financial question, THE System SHALL search financial benchmarks and funding opportunities
5. WHEN any AI Family member responds, THE System SHALL cite sources and provide confidence levels

### Requirement 4: Real-Time Data Ingestion

**User Story:** As a system, I want to continuously ingest fresh data so that the knowledge ocean stays current.

#### Acceptance Criteria

1. WHEN the system starts, THE Data Ingestion Pipeline SHALL schedule regular updates from all sources
2. WHILE running, THE System SHALL update news data every hour
3. WHILE running, THE System SHALL update market data every minute
4. WHILE running, THE System SHALL update trends every 6 hours
5. IF an ingestion fails, THE System SHALL log the error and retry

### Requirement 5: Vector Database Integration

**User Story:** As a search system, I want to use vector embeddings so that I can perform fast semantic search.

#### Acceptance Criteria

1. WHEN content is stored, THE System SHALL generate embeddings using OpenAI/Cohere
2. WHEN a search query is submitted, THE System SHALL generate query embedding
3. IF embeddings exist, THE System SHALL perform semantic search in vector database
4. WHILE searching, THE System SHALL return top K results with similarity scores
5. WHERE optional, THE System SHALL support hybrid search combining semantic and keyword results

### Requirement 6: API Endpoints

**User Story:** As a developer, I want API endpoints so that I can integrate the knowledge engine with the student portal.

#### Acceptance Criteria

1. WHEN a search request is made, THE System SHALL return results via /api/sapiens/search endpoint
2. WHEN a business idea is requested, THE System SHALL return via /api/sapiens/business-idea endpoint
3. WHEN market analysis is requested, THE System SHALL return via /api/sapiens/market-analysis endpoint
4. WHEN a career path is requested, THE System SHALL return via /api/sapiens/career-path endpoint
5. WHEN funding opportunities are requested, THE System SHALL return via /api/sapiens/funding-opportunities endpoint
