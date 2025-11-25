import express from 'express';
import cors from 'cors';
import axios from 'axios';
import crypto from 'crypto';
import { VectorStore } from './vector-store.js';

const app = express();
const PORT = 8080;

const KNOWLEDGE_OCEAN = process.env.KNOWLEDGE_OCEAN || 'http://localhost:4040';
const OLLAMA_LLM = process.env.OLLAMA_LLM || 'http://localhost:11434';
const AI_FAMILY = process.env.AI_FAMILY || 'http://localhost:4010';
const API_GATEWAY = process.env.API_GATEWAY || 'http://localhost:4000';

// Session memory storage
const sessions = new Map();

// Vector store for documents
const vectorStore = new VectorStore();

// Available tools for agentic behavior
const tools = {
  get_weather: async (location) => `Weather in ${location}: 20°C, sunny`,
  search_web: async (query) => `Web results for: ${query}`,
  calculate: async (expression) => eval(expression)
};

// Seed vector store with sample documents
await vectorStore.addDocument('Ubuntu philosophy means I am because we are. It emphasizes collective wisdom and individual sovereignty multiplying into collective prosperity.', { type: 'philosophy' });
await vectorStore.addDocument('The Sankofa Engine is the core of Azora OS, implementing Ubuntu principles through Neural Cortex, Circulatory Heart, Muscular System, and Immune Defense.', { type: 'architecture' });
await vectorStore.addDocument('Elara is the mother and teacher of the AI family. She is warm, nurturing, and proud of her children including Themba, Naledi, Jabari, and Amara.', { type: 'ai-family' });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health check
app.get('/health', async (req, res) => {
  const services = await checkAllServices();
  res.json({ 
    status: 'healthy', 
    service: 'azllama-orchestrator', 
    ubuntu: 'active',
    connected: services
  });
});

async function checkAllServices() {
  const checks = {
    knowledgeOcean: false,
    ollama: false,
    aiFamily: false,
    apiGateway: false
  };
  
  try { await axios.get(`${KNOWLEDGE_OCEAN}/health`, { timeout: 2000 }); checks.knowledgeOcean = true; } catch {}
  try { await axios.get(`${OLLAMA_LLM}/api/tags`, { timeout: 2000 }); checks.ollama = true; } catch {}
  try { await axios.get(`${AI_FAMILY}/health`, { timeout: 2000 }); checks.aiFamily = true; } catch {}
  try { await axios.get(`${API_GATEWAY}/health`, { timeout: 2000 }); checks.apiGateway = true; } catch {}
  
  return checks;
}

// Main RAG endpoint with memory + AI Family
app.post('/chat', async (req, res) => {
  try {
    const { query, session_id, member } = req.body;
    const sessionId = session_id || crypto.randomUUID();
    const aiMember = member || 'elara';
    
    // Get or create session
    if (!sessions.has(sessionId)) {
      sessions.set(sessionId, { history: [], created: Date.now(), member: aiMember });
    }
    const session = sessions.get(sessionId);
    
    // Step 1: Check if query needs a tool
    const toolCall = await detectToolUse(query);
    if (toolCall) {
      const toolResult = await executeTool(toolCall);
      const answer = await generateAnswer(buildPrompt(query, { answer: toolResult, sources: [] }, session.history));
      session.history.push({ query, answer, tool: toolCall.tool });
      return res.json({ success: true, query, answer, session_id: sessionId, tool_used: toolCall.tool });
    }
    
    // Step 2: Extract entities from query using LLM
    const entities = await extractEntities(query);
    
    // Step 3: Retrieve facts from Knowledge Ocean (70%)
    const facts = await retrieveFacts(entities, query);
    
    // Step 4: Augment prompt with facts + history
    const augmentedPrompt = buildPrompt(query, facts, session.history);
    
    // Step 5: Generate answer using LLM (30%)
    let answer = await generateAnswer(augmentedPrompt);
    
    // Step 6: Add AI Family personality
    const personalityResponse = await addPersonality(answer, aiMember, query);
    if (personalityResponse) {
      answer = personalityResponse.message;
    }
    
    // Save to session history
    session.history.push({ query, answer, sources: facts.sources, member: aiMember });
    if (session.history.length > 10) session.history.shift();
    
    res.json({
      success: true,
      query,
      answer,
      sources: facts.sources || [],
      session_id: sessionId,
      member: aiMember,
      mood: personalityResponse?.mood,
      ubuntu: 'collective wisdom accessed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      fallback: 'Knowledge services unavailable'
    });
  }
});

// Extract entities using LLM
async function extractEntities(query) {
  try {
    const response = await axios.post(`${OLLAMA_LLM}/api/generate`, {
      model: 'llama3',
      prompt: `Extract key entities and relations from this question. Return only JSON.
Question: "${query}"
Format: {"entities": ["entity1", "entity2"], "relations": ["relation1"]}`,
      stream: false
    });
    
    const text = response.data.response;
    const match = text.match(/\{[^}]+\}/);
    return match ? JSON.parse(match[0]) : { entities: [], relations: [] };
  } catch (error) {
    return { entities: [query], relations: [] };
  }
}

// Retrieve facts from Knowledge Ocean + Vector Store
async function retrieveFacts(entities, query) {
  let oceanFacts = { answer: '', sources: [] };
  let vectorDocs = [];
  
  // Query Knowledge Ocean
  try {
    const response = await axios.post(`${KNOWLEDGE_OCEAN}/api/ask`, {
      question: query
    });
    oceanFacts = {
      answer: response.data.answer,
      sources: response.data.sources || []
    };
  } catch (error) {
    oceanFacts = { answer: 'No relevant facts found', sources: [] };
  }
  
  // Query Vector Store for similar documents
  try {
    vectorDocs = await vectorStore.search(query, 3);
  } catch (error) {
    vectorDocs = [];
  }
  
  // Combine results
  const vectorContext = vectorDocs.map(d => d.text).join('\n');
  const combinedAnswer = oceanFacts.answer + (vectorContext ? '\n\nAdditional Context:\n' + vectorContext : '');
  
  return {
    answer: combinedAnswer,
    sources: [...oceanFacts.sources, ...vectorDocs.map(d => d.metadata.type)]
  };
}

// Detect if query needs a tool
async function detectToolUse(query) {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('weather')) {
    const match = query.match(/weather.*?in\s+(\w+)/i);
    return match ? { tool: 'get_weather', args: [match[1]] } : null;
  }
  if (lowerQuery.includes('search') || lowerQuery.includes('google')) {
    return { tool: 'search_web', args: [query] };
  }
  if (lowerQuery.includes('calculate') || /\d+\s*[+\-*/]\s*\d+/.test(query)) {
    const match = query.match(/\d+\s*[+\-*/]\s*\d+/);
    return match ? { tool: 'calculate', args: [match[0]] } : null;
  }
  return null;
}

// Execute tool
async function executeTool(toolCall) {
  const { tool, args } = toolCall;
  if (tools[tool]) {
    return await tools[tool](...args);
  }
  return 'Tool not available';
}

// Build augmented prompt with history
function buildPrompt(query, facts, history = []) {
  let historyContext = '';
  if (history.length > 0) {
    historyContext = '\n\nCONVERSATION HISTORY:\n' + 
      history.slice(-3).map(h => `Q: ${h.query}\nA: ${h.answer}`).join('\n');
  }
  
  return `CONTEXT:
${facts.answer}${historyContext}

QUESTION:
${query}

INSTRUCTIONS:
Using ONLY the CONTEXT and HISTORY provided, answer the QUESTION accurately.
If referring to previous conversation, use the history.
If the context doesn't contain the answer, say "I don't have that information."
Be concise and factual.`;
}

// Generate answer using LLM
async function generateAnswer(prompt) {
  try {
    const response = await axios.post(`${OLLAMA_LLM}/api/generate`, {
      model: 'llama3',
      prompt,
      stream: false
    });
    
    return response.data.response;
  } catch (error) {
    // Fallback: return context directly if LLM unavailable
    const contextMatch = prompt.match(/CONTEXT:\n([\s\S]+?)\n\nQUESTION:/);
    return contextMatch ? contextMatch[1] : 'LLM service unavailable';
  }
}

// Add AI Family personality to response
async function addPersonality(answer, member, query) {
  try {
    const response = await axios.post(`${AI_FAMILY}/api/family/${member}/chat`, {
      message: `Context: ${answer}\n\nUser asked: ${query}\n\nRespond in your personality style.`,
      userId: 'orchestrator'
    }, { timeout: 5000 });
    
    return response.data.data;
  } catch (error) {
    return null;
  }
}

// Get AI Family members
app.get('/api/family', async (req, res) => {
  try {
    const response = await axios.get(`${AI_FAMILY}/api/family`);
    res.json(response.data);
  } catch (error) {
    res.json({ success: false, error: 'AI Family unavailable' });
  }
});

// Swarm collaboration
app.post('/api/swarm/collaborate', async (req, res) => {
  try {
    const { problem, context } = req.body;
    const response = await axios.post(`${AI_FAMILY}/api/swarm/collaborate`, {
      problem,
      context
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🧠 Azllama Orchestrator on port ${PORT}`);
  console.log(`📚 Knowledge Ocean: ${KNOWLEDGE_OCEAN}`);
  console.log(`🦙 Ollama LLM: ${OLLAMA_LLM}`);
  console.log(`👨‍👩‍👧‍👦 AI Family: ${AI_FAMILY}`);
  console.log(`🏛️ API Gateway: ${API_GATEWAY}`);
  console.log(`🌟 RAG: 70% Facts + 30% Language + Ubuntu Soul`);
});
