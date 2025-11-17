# Knowledge Ocean Setup Guide

This guide walks you through setting up the Knowledge Ocean infrastructure from scratch.

## Prerequisites

1. **Pinecone Account**
   - Sign up at https://www.pinecone.io/
   - Free tier available for development

2. **OpenAI Account**
   - Sign up at https://platform.openai.com/
   - API key required for embeddings

3. **Node.js**
   - Version 18+ recommended

## Step 1: Install Dependencies

```bash
cd services/ai-routing
npm install @pinecone-database/pinecone openai
```

## Step 2: Create Pinecone Index

### Option A: Using Pinecone Console (Recommended for first-time setup)

1. Log in to https://app.pinecone.io/
2. Click "Create Index"
3. Configure:
   - **Name**: `azora-knowledge-ocean`
   - **Dimensions**: `1536` (for OpenAI text-embedding-ada-002)
   - **Metric**: `cosine`
   - **Pod Type**: `p1.x1` (starter) or `serverless` (recommended)
   - **Region**: `us-east-1` (or your preferred region)
4. Click "Create Index"
5. Wait for index to be ready (usually 1-2 minutes)

### Option B: Using Setup Script

The setup script will automatically create the index if it doesn't exist:

```bash
npm run setup:knowledge-ocean
```

## Step 3: Configure Environment Variables

1. Copy the example environment file:

```bash
cp knowledge-ocean/.env.example knowledge-ocean/.env
```

2. Edit `knowledge-ocean/.env` with your credentials:

```bash
# Pinecone Configuration
PINECONE_API_KEY=your_actual_pinecone_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=azora-knowledge-ocean

# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-ada-002

# Knowledge Ocean Settings (optional - defaults shown)
KNOWLEDGE_OCEAN_INTERNAL_RATIO=0.7
KNOWLEDGE_OCEAN_EXTERNAL_RATIO=0.3
KNOWLEDGE_OCEAN_MIN_RELEVANCE_SCORE=0.7
KNOWLEDGE_OCEAN_MAX_RESULTS=10

# Performance Settings (optional - defaults shown)
KNOWLEDGE_OCEAN_CACHE_TTL=3600
KNOWLEDGE_OCEAN_BATCH_SIZE=100
KNOWLEDGE_OCEAN_TIMEOUT_MS=5000
```

### Finding Your Pinecone API Key

1. Go to https://app.pinecone.io/
2. Click on your project
3. Go to "API Keys" section
4. Copy your API key

### Finding Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (you won't be able to see it again!)

## Step 4: Run Setup Script

Run the automated setup script to validate everything:

```bash
cd services/ai-routing/knowledge-ocean
npx ts-node setup.ts
```

Expected output:
```
🌊 Knowledge Ocean Setup Starting...

📋 Validating environment variables...
✓ All required environment variables present

🔌 Initializing Pinecone connection...
✓ Connected to Pinecone successfully
✓ Connection initialized

📊 Setting up Pinecone index...
✓ Index "azora-knowledge-ocean" already exists
✓ Index setup complete

🔍 Validating setup...
✓ Connection health check passed
✓ Index "azora-knowledge-ocean" exists
✓ Index stats: {...}
✓ Validation complete

✅ Knowledge Ocean setup completed successfully!
```

## Step 5: Verify Installation

Create a test script to verify everything works:

```typescript
// test-setup.ts
import { initializePinecone, VectorDBClient } from './knowledge-ocean';

async function test() {
  console.log('Testing Knowledge Ocean setup...');
  
  // Initialize connection
  const connection = await initializePinecone();
  console.log('✓ Connection established');
  
  // Create client
  const client = new VectorDBClient(connection);
  console.log('✓ Client created');
  
  // Get stats
  const stats = await client.getStats();
  console.log('✓ Stats retrieved:', stats);
  
  console.log('\n✅ All tests passed!');
}

test().catch(console.error);
```

Run it:
```bash
npx ts-node test-setup.ts
```

## Step 6: Add to Package.json Scripts

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "setup:knowledge-ocean": "ts-node knowledge-ocean/setup.ts",
    "test:knowledge-ocean": "ts-node knowledge-ocean/test-setup.ts"
  }
}
```

## Troubleshooting

### Error: "PINECONE_API_KEY is required"

**Solution**: Make sure you've created the `.env` file and added your API key.

### Error: "Failed to connect to Pinecone"

**Solutions**:
1. Verify your API key is correct
2. Check your internet connection
3. Verify Pinecone service status at https://status.pinecone.io/

### Error: "Index does not exist"

**Solutions**:
1. Create the index manually in Pinecone console
2. Run the setup script with `createIndex: true`
3. Verify the index name matches your environment variable

### Error: "Dimension mismatch"

**Solution**: Make sure your index dimension (1536) matches the OpenAI embedding model dimension.

### Error: "Rate limit exceeded"

**Solutions**:
1. Wait a few minutes and try again
2. Upgrade your Pinecone plan
3. Reduce batch size in configuration

## Next Steps

1. **Implement the 70/30 Retriever** (Task 8)
2. **Create the Context Injector** (Task 10)
3. **Integrate with RAP System** (Task 10.2)

## Additional Resources

- [Pinecone Documentation](https://docs.pinecone.io/)
- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Knowledge Ocean Design Document](../../../.kiro/specs/final-completion/design.md)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the logs for detailed error messages
3. Verify all environment variables are set correctly
4. Check Pinecone and OpenAI service status
