/**
 * Elara Orchestrator Service
 * Multi-agent LLM routing engine with constitutional validation
 * 
 * Routes queries to optimal agent (Sankofa, Themba, Jabari, Nia, Imani)
 * Manages session state, tool use, and streaming responses
 */

import express from 'express';
import { Router } from './router';
import { SessionManager } from './session-manager';

const app = express();
const port = process.env.PORT || 3010;

app.use(express.json());

const router = new Router();
const sessionManager = new SessionManager();

/**
 * POST /agent/prompt
 * Route a user prompt through the agent network
 */
app.post('/agent/prompt', async (req, res) => {
  const { message, sessionId, agentPreference } = req.body;

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    // Get or create session
    const session = sessionManager.getOrCreateSession(sessionId);

    // Route to optimal agent
    const response = await router.route({
      message,
      sessionId: session.id,
      agentPreference,
      conversationHistory: session.history
    });

    // Update session history
    session.addMessage({ role: 'user', content: message });
    session.addMessage({ role: 'assistant', content: response.content });

    res.json({
      sessionId: session.id,
      message: response.content,
      agent: response.agent,
      tokens: response.tokens
    });
  } catch (error) {
    console.error('Agent routing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /agent/stream
 * Stream responses from agent in real-time
 */
app.post('/agent/stream', async (req, res) => {
  const { message, sessionId, agentPreference } = req.body;

  if (!message) {
    res.status(400).json({ error: 'message is required' });
    return;
  }

  try {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const session = sessionManager.getOrCreateSession(sessionId);
    session.addMessage({ role: 'user', content: message });

    const stream = await router.routeStream({
      message,
      sessionId: session.id,
      agentPreference,
      conversationHistory: session.history
    });

    let fullContent = '';
    for await (const chunk of stream) {
      fullContent += chunk;
      res.write(`data: ${JSON.stringify({ token: chunk })}\n\n`);
    }

    session.addMessage({ role: 'assistant', content: fullContent });
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Stream error:', error);
    res.status(500).json({ error: 'Streaming failed' });
  }
});

/**
 * GET /session/:id
 * Get session details
 */
app.get('/session/:id', (req, res) => {
  const session = sessionManager.getSession(req.params.id);

  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }

  res.json({
    id: session.id,
    createdAt: session.createdAt,
    messageCount: session.history.length
  });
});

/**
 * DELETE /session/:id
 * Close and clear session
 */
app.delete('/session/:id', (req, res) => {
  sessionManager.deleteSession(req.params.id);
  res.json({ success: true });
});

/**
 * GET /health
 * Health check
 */
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'elara-orchestrator' });
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`🤖 Elara Orchestrator listening on port ${port}`);
  });
}

export default app;
