# Knowledge Ocean Service

AI-powered knowledge indexing, search, and graph management for Azora ecosystem.

## Features

### ✅ Implemented
- **Vector Search**: Semantic search using AI embeddings
- **Knowledge Graph**: Relationship tracking with versioning
- **File Watching**: Automatic workspace indexing
- **Version History**: Track knowledge evolution over time
- **Graph Analysis**: Connection analysis and related node discovery
- **Multi-Provider AI**: Support for multiple embedding providers

## API Endpoints

### Search & Indexing
- `GET /search?q=query` - Semantic search across indexed knowledge
- `POST /index` - Index new knowledge nodes (requires API key)

### Knowledge Graph
- `GET /graph/:id` - Get knowledge node with relationships
- `GET /graph/:id/related?depth=2` - Get related nodes
- `GET /graph/:id/versions` - Get version history
- `GET /health` - Health check

## Usage

```typescript
// Search knowledge
const results = await fetch('http://localhost:4003/search?q=authentication');

// Index new content
await fetch('http://localhost:4003/index', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': process.env.INDEX_API_KEY
  },
  body: JSON.stringify([
    {
      id: 'doc-1',
      path: '/docs/auth.md',
      type: 'documentation',
      title: 'Authentication Guide',
      content: 'How to authenticate...',
      metadata: { author: 'team' }
    }
  ])
});

// Get related knowledge
const related = await fetch('http://localhost:4003/graph/doc-1/related?depth=2');
```

## Knowledge Graph

The knowledge graph tracks:
- **Relationships**: references, imports, extends, implements, calls
- **Versions**: Full version history for each node
- **Connections**: Incoming and outgoing edges
- **Types**: Documentation, code, configuration, etc.

### Edge Types
- `references` - Document references another
- `imports` - Code imports another module
- `extends` - Class extends another
- `implements` - Class implements interface
- `calls` - Function calls another

## Environment Variables

```bash
PORT=4003
WORKSPACE_PATH=/path/to/workspace
INDEX_API_KEY=your-api-key
DATABASE_URL=postgresql://user:pass@localhost:5432/azora
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## File Watching

Automatically indexes files in workspace:
- Watches for file changes
- Generates embeddings
- Updates knowledge graph
- Maintains version history

## Constitutional Compliance

Per Azora Constitution Article V:
- Privacy by design (no PII in embeddings)
- Transparent indexing operations
- User control over indexed data
- Secure storage with encryption

## Development

```bash
npm install
npm run dev
npm test
```

## Architecture

```
KnowledgeOcean
├── DatabaseIndexer (vector search)
├── KnowledgeGraph (relationships & versioning)
├── AIProviderRouter (embeddings)
├── FileWatcher (auto-indexing)
└── Auth Middleware (API key validation)
```

---

**Built with Ubuntu Philosophy**: Knowledge shared becomes wisdom amplified
