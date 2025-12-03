# Knowledge Ocean Quick Start

Get up and running with Knowledge Ocean in 5 minutes.

## 1. Install Dependencies (30 seconds)

```bash
cd services/ai-routing
npm install @pinecone-database/pinecone openai dotenv
```

## 2. Configure Environment (1 minute)

```bash
# Copy example env file
cp knowledge-ocean/.env.example knowledge-ocean/.env

# Edit with your credentials
# Required:
# - PINECONE_API_KEY
# - PINECONE_INDEX_NAME
# - OPENAI_API_KEY
```

## 3. Run Setup (2 minutes)

```bash
npm run setup:knowledge-ocean
```

Expected output:
```
🌊 Knowledge Ocean Setup Starting...
✓ All required environment variables present
✓ Connected to Pinecone successfully
✓ Index "azora-knowledge-ocean" created
✅ Knowledge Ocean setup completed successfully!
```

## 4. Test Connection (30 seconds)

```bash
npm run test:connection
```

Expected output:
```
🧪 Testing Knowledge Ocean Connection...
✓ Connection initialized
✓ Connection is healthy
✓ Index "azora-knowledge-ocean" exists
✅ All tests passed!
```

## 5. Start Using (1 minute)

```typescript
import { initializePinecone, VectorDBClient } from './knowledge-ocean';

// Initialize
const connection = await initializePinecone();
const client = new VectorDBClient(connection);

// Search (requires embeddings - see next section)
const results = await client.search(queryEmbedding, {
  topK: 10,
  minScore: 0.7
});

console.log('Found documents:', results);
```

## Common Tasks

### Generate Embeddings

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text
  });
  return response.data[0].embedding;
}
```

### Insert Documents

```typescript
import { Document } from './knowledge-ocean';

const documents: Document[] = [
  {
    id: 'doc-1',
    content: 'Ubuntu philosophy emphasizes collective benefit',
    embedding: await getEmbedding('Ubuntu philosophy...'),
    metadata: {
      source: 'internal',
      category: 'philosophy',
      timestamp: new Date(),
      tags: ['ubuntu', 'philosophy']
    }
  }
];

await client.upsert(documents);
```

### Search Documents

```typescript
const query = 'What is Ubuntu philosophy?';
const queryEmbedding = await getEmbedding(query);

const results = await client.search(queryEmbedding, {
  topK: 5,
  minScore: 0.7,
  filter: { source: 'internal' }
});

results.forEach(doc => {
  console.log(`Score: ${doc.score}`);
  console.log(`Content: ${doc.content}`);
});
```

## Troubleshooting

### "PINECONE_API_KEY is required"
→ Add your API key to `.env` file

### "Failed to connect to Pinecone"
→ Check your API key and internet connection

### "Index does not exist"
→ Run `npm run setup:knowledge-ocean`

### "Dimension mismatch"
→ Ensure index dimension is 1536 for OpenAI embeddings

## Next Steps

1. ✅ Setup complete
2. 📚 Read [SETUP-GUIDE.md](./SETUP-GUIDE.md) for detailed instructions
3. 🏗️ Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
4. 🔨 Implement 70/30 Retriever (Task 8)
5. 🎯 Integrate with RAP System (Task 10)

## Useful Commands

```bash
# Setup Knowledge Ocean
npm run setup:knowledge-ocean

# Test connection
npm run test:connection

# Run tests
npm test

# Check index stats
npx ts-node -e "
  import('./knowledge-ocean').then(async ({ initializePinecone, VectorDBClient }) => {
    const conn = await initializePinecone();
    const client = new VectorDBClient(conn);
    console.log(await client.getStats());
  });
"
```

## Resources

- [Pinecone Docs](https://docs.pinecone.io/)
- [OpenAI Embeddings](https://platform.openai.com/docs/guides/embeddings)
- [Full Setup Guide](./SETUP-GUIDE.md)
