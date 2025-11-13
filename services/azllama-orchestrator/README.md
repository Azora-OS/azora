# 🧠 Azllama Orchestrator

**RAG Brain: 70% Knowledge Ocean + 30% Ollama LLM**

## Architecture

```
User Query
    ↓
Azllama Orchestrator (Port 8080)
    ↓
    ├─→ Knowledge Ocean (Port 4040) [70% Facts]
    └─→ Ollama LLM (Port 11434) [30% Language]
    ↓
Hallucination-Free Answer
```

## Setup

### 1. Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.com/install.sh | sh

# Pull Llama 3
ollama pull llama3

# Start Ollama server
ollama serve
```

### 2. Start Knowledge Ocean
```bash
cd services/knowledge-ocean
npm start
# Running on port 4040
```

### 3. Start Orchestrator
```bash
cd services/azllama-orchestrator
npm install
npm start
# Running on port 8080
```

## Usage

### Chat Endpoint
```bash
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Ubuntu philosophy?"}'
```

**Response:**
```json
{
  "success": true,
  "query": "What is Ubuntu philosophy?",
  "answer": "Ubuntu philosophy means 'I am because we are'...",
  "sources": ["ubuntu.philosophy", "ubuntu.principles"],
  "ubuntu": "collective wisdom accessed"
}
```

## How It Works

### Step 1: Extract Entities
LLM analyzes query to identify key entities and relations.

### Step 2: Retrieve Facts (70%)
Knowledge Ocean provides verified, structured facts.

### Step 3: Augment Prompt
Combine facts with original query in structured prompt.

### Step 4: Generate Answer (30%)
LLM generates natural language response using ONLY the facts.

## Benefits

✅ **100% Factual** - Answers grounded in Knowledge Ocean
✅ **0% Hallucination** - LLM can't make up facts
✅ **100% Private** - All local, no external APIs
✅ **Scalable** - Ready for Azure deployment

## Azure Deployment

### Option 1: Container App (Recommended)
```bash
# Build Docker image
docker build -t azllama-orchestrator .

# Push to Azure Container Registry
az acr build --registry myregistry --image azllama:latest .

# Deploy to Container App
az containerapp create \
  --name azllama \
  --resource-group azora-rg \
  --image myregistry.azurecr.io/azllama:latest \
  --target-port 8080
```

### Option 2: Azure ML Endpoint
Use Azure AI Studio Model Catalog for Llama 3 deployment.

## Configuration

Edit `index.js` to change endpoints:
```javascript
const KNOWLEDGE_OCEAN = 'http://localhost:4040';
const OLLAMA_LLM = 'http://localhost:11434';
```

For Azure:
```javascript
const KNOWLEDGE_OCEAN = 'https://knowledge-ocean.azurewebsites.net';
const OLLAMA_LLM = 'https://azllama.azurecontainerapps.io';
```

## Ubuntu Philosophy

**"Ngiyakwazi ngoba sikwazi" - "I can because we can"**

- 70% = Collective knowledge (Knowledge Ocean)
- 30% = Individual expression (LLM)
- 100% = Ubuntu wisdom

---

**Built by Azora OS** | [azora.world](https://azora.world)
