const express = require('express');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const OpenAI = require('openai');

const prisma = new PrismaClient();
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'nexus-service' });
});

// Get available agents
app.get('/agents', async (req, res) => {
  try {
    const agents = await prisma.agent.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        capabilities: true
      }
    });

    res.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    res.status(500).json({ error: 'Failed to get agents' });
  }
});

// Create agent
app.post('/agents', async (req, res) => {
  try {
    const { name, description, type, model, capabilities } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required' });
    }

    const agent = await prisma.agent.create({
      data: {
        name,
        description,
        type,
        model: model || 'gpt-4',
        capabilities: capabilities ? JSON.parse(capabilities) : null
      }
    });

    res.json({ success: true, agent });
  } catch (error) {
    console.error('Create agent error:', error);
    res.status(500).json({ error: 'Failed to create agent' });
  }
});

// Create conversation
app.post('/conversations', async (req, res) => {
  try {
    const { userId, agentId, title } = req.body;

    if (!userId || !agentId) {
      return res.status(400).json({ error: 'userId and agentId are required' });
    }

    const conversation = await prisma.conversation.create({
      data: {
        userId,
        agentId,
        title
      }
    });

    res.json({ success: true, conversation });
  } catch (error) {
    console.error('Create conversation error:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Get user conversations
app.get('/users/:userId/conversations', async (req, res) => {
  try {
    const { userId } = req.params;

    const conversations = await prisma.conversation.findMany({
      where: { userId, status: 'active' },
      include: {
        agent: {
          select: { name: true, type: true }
        },
        _count: {
          select: { messages: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    res.json({ conversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ error: 'Failed to get conversations' });
  }
});

// Get conversation messages
app.get('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ messages });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// Send message to agent
app.post('/conversations/:conversationId/messages', async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content, userId } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Get conversation with agent info
    const conversation = await prisma.conversation.findUnique({
      where: { conversationId },
      include: { agent: true }
    });

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Save user message
    const userMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content
      }
    });

    // Get conversation history for context
    const recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const messages = recentMessages.reverse().map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Generate AI response
    const completion = await openai.chat.completions.create({
      model: conversation.agent.model,
      messages: [
        {
          role: 'system',
          content: `You are ${conversation.agent.name}, a ${conversation.agent.type} AI agent. ${conversation.agent.description || ''}`
        },
        ...messages
      ],
      max_tokens: 1000,
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;

    // Save AI message
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: aiResponse,
        metadata: {
          model: conversation.agent.model,
          tokens: completion.usage.total_tokens
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { conversationId },
      data: { updatedAt: new Date() }
    });

    res.json({
      success: true,
      userMessage,
      aiMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Create workflow
app.post('/workflows', async (req, res) => {
  try {
    const { name, description, steps, userId } = req.body;

    if (!name || !steps || !userId) {
      return res.status(400).json({ error: 'Name, steps, and userId are required' });
    }

    const workflow = await prisma.workflow.create({
      data: {
        name,
        description,
        steps: JSON.parse(steps),
        userId
      }
    });

    res.json({ success: true, workflow });
  } catch (error) {
    console.error('Create workflow error:', error);
    res.status(500).json({ error: 'Failed to create workflow' });
  }
});

// Execute workflow
app.post('/workflows/:workflowId/execute', async (req, res) => {
  try {
    const { workflowId } = req.params;

    const workflow = await prisma.workflow.findUnique({
      where: { workflowId }
    });

    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId,
        status: 'running'
      }
    });

    // Execute workflow asynchronously
    executeWorkflow(workflow, execution.id);

    res.json({ success: true, executionId: execution.id });
  } catch (error) {
    console.error('Execute workflow error:', error);
    res.status(500).json({ error: 'Failed to execute workflow' });
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
    console.log(`Client ${socket.id} joined conversation ${conversationId}`);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
    console.log(`Client ${socket.id} left conversation ${conversationId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Helper function to execute workflow
async function executeWorkflow(workflow, executionId) {
  try {
    const steps = workflow.steps;
    const results = {};

    for (const step of steps) {
      // Execute each step (simplified - would need more complex logic)
      const result = await executeWorkflowStep(step);
      results[step.id] = result;
    }

    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'completed',
        results,
        completedAt: new Date()
      }
    });
  } catch (error) {
    await prisma.workflowExecution.update({
      where: { id: executionId },
      data: {
        status: 'failed',
        results: { error: error.message },
        completedAt: new Date()
      }
    });
  }
}

// Simplified workflow step execution
async function executeWorkflowStep(step) {
  // This would contain logic to execute different types of steps
  // For now, just return a mock result
  return { status: 'completed', output: 'Step executed successfully' };
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  server.close();
  process.exit(0);
});

const PORT = process.env.PORT || 3005;
server.listen(PORT, async () => {
  console.log(`🕸️  Azora Nexus Service running on port ${PORT}`);
  console.log(`🤖 Agents: GET http://localhost:${PORT}/agents`);
  console.log(`💬 Conversations: GET/POST http://localhost:${PORT}/conversations`);
  console.log(`📨 Messages: POST http://localhost:${PORT}/conversations/:id/messages`);
  console.log(`🔄 Workflows: GET/POST http://localhost:${PORT}/workflows`);

  try {
    await prisma.$connect();
    console.log('🗄️  Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
  }
});