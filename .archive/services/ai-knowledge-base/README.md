# 🧠 Azora AI Knowledge Base

**"My knowledge becomes our knowledge"** - Ubuntu Philosophy

## Overview

The AI Knowledge Base is Azora OS's central intelligence system that stores, retrieves, and shares knowledge following Ubuntu principles. It provides:

- **Vector Database**: ChromaDB for semantic search
- **Web Search**: Real-time web search capabilities
- **Embeddings**: OpenAI embeddings for semantic understanding
- **Ubuntu Principles**: Collective knowledge sharing

## Features

### 🌍 Core Capabilities
- ✅ Semantic search with vector embeddings
- ✅ Web search integration (Serper API / DuckDuckGo)
- ✅ Knowledge ingestion and storage
- ✅ Ubuntu-aligned knowledge sharing
- ✅ RESTful API for all AI models

### 🔍 Search Engines
- **Serper API**: Google search results (requires API key)
- **DuckDuckGo**: Free fallback search engine
- **Web Scraping**: Content extraction from URLs

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Add your OPENAI_API_KEY

# Start service
npm run dev
```

## API Endpoints

### Query Knowledge Base
```bash
POST /api/kb/query
{
  "query": "What is Ubuntu philosophy?",
  "includeWeb": true
}
```

### Add Knowledge
```bash
POST /api/kb/add
{
  "content": "New knowledge to share with Ubuntu collective",
  "metadata": {
    "type": "philosophy",
    "source": "community"
  }
}
```

### Web Search
```bash
POST /api/kb/search-web
{
  "query": "Latest AI developments"
}
```

## Integration with AI Models

All Azora AI models (Elara, Sankofa, Themba, etc.) can access this knowledge base:

```typescript
// Example integration
const response = await fetch('http://localhost:4010/api/kb/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: userQuestion,
    includeWeb: true
  })
});

const { results } = await response.json();
// Use results.localKnowledge and results.webKnowledge
```

## Ubuntu Principles

This knowledge base embodies:
- **Collective Intelligence**: All knowledge is shared
- **Continuous Learning**: Always expanding
- **Web Access**: Real-time information retrieval
- **Semantic Understanding**: Context-aware responses

## Architecture

```
┌─────────────────────────────────────┐
│     AI Models (Elara, Sankofa)      │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│      Knowledge Base API              │
│  ┌─────────────┬─────────────────┐  │
│  │  ChromaDB   │  Web Search     │  │
│  │  (Vectors)  │  (Serper/DDG)   │  │
│  └─────────────┴─────────────────┘  │
└─────────────────────────────────────┘
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for embeddings |
| `SERPER_API_KEY` | No | Serper API for Google search |
| `KB_PORT` | No | Service port (default: 4010) |

## Ubuntu Impact

**"Ngiyakwazi ngoba sikwazi"** - I can because we can

Every query strengthens the collective. Every addition benefits all.

---

Built with Ubuntu 🌍 | Part of Azora OS
