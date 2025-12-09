import { AzoraInlineChatController, ChatParticipant, InlineChatOptions } from '../../../src/vs/workbench/contrib/inlineChat/azoraInlineChatController';
import { getChatSessionsService } from '../../../src/vs/workbench/services/chat/chatSessionsService';

describe('AzoraInlineChatController E2E', () => {
  let controller: AzoraInlineChatController;

  beforeEach(() => {
    // Create controller with mock registry that supports streaming
    const mockRegistry = {
      registerAgent: jest.fn(),
      listAgents: jest.fn().mockReturnValue([
        { id: 'azora.elara', name: 'Elara', fullName: 'ELARA — Master Orchestrator' },
        { id: 'azora.planner', name: 'Planner', fullName: 'Planner Agent' },
      ]),
      invokeAgent: jest.fn().mockResolvedValue({ content: 'Agent response', agentId: 'azora.elara', metadata: {} }),
      invokeAgentStreaming: jest.fn(async (id: string, prompt: string, onChunk: any) => {
        // Simulate streaming: yield chunks
        const chunks = ['Hello ', 'from ', 'streaming ', 'agent'];
        for (const chunk of chunks) {
          await onChunk(chunk, { partial: true });
        }
        return { content: 'Hello from streaming agent', metadata: { type: 'stream' } };
      }),
      onDidRegisterAgent: jest.fn(),
      getFollowups: jest.fn().mockResolvedValue([]),
    };
    controller = new AzoraInlineChatController(mockRegistry);
  });

  it('should list participants from registry', () => {
    const participants = controller.getParticipants();
    expect(participants.length).toBeGreaterThanOrEqual(2);
    expect(participants.some(p => p.id === 'azora.elara')).toBe(true);
  });

  it('should create a session and send a message', async () => {
    const prompt = 'Generate a lesson on physics';
    const response = await controller.ask(prompt);
    expect(response.content).toBeDefined();
    expect(response.agentId).toBe('azora.elara');
    expect(response.sessionId).toBeDefined();
  });

  it('should support streaming with progress callbacks', async () => {
    const chunks: string[] = [];
    const statuses: string[] = [];

    const options: InlineChatOptions = {
      agentId: 'azora.elara',
      onProgress: (status: any) => {
        statuses.push(status.type);
        if (status.chunk) {
          chunks.push(status.chunk);
        }
      },
    };

    const response = await controller.sendMessage('Stream this content', options);
    
    expect(statuses).toContain('starting');
    expect(statuses).toContain('streaming');
    expect(statuses).toContain('complete');
    expect(chunks.length).toBeGreaterThan(0);
    expect(response.content).toContain('streaming');
  });

  it('should switch between agents in a session', async () => {
    const session = await controller.startSession('azora.elara');
    expect(session.agentId).toBe('azora.elara');

    await controller.switchAgent('azora.planner');
    const updated = controller.getCurrentSession();
    expect(updated?.agentId).toBe('azora.planner');
  });

  it('should persist and retrieve session history', async () => {
    await controller.startSession('azora.elara', { user: 'test-user' });
    await controller.sendMessage('First message');
    await controller.sendMessage('Second message');

    const current = controller.getCurrentSession();
    if (current) {
      const retrieved = await controller.getSessionHistory(current.id);
      expect(retrieved).toBeDefined();
      expect(retrieved?.messages.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('should list all sessions', async () => {
    const sessions1 = await controller.listAllSessions();
    const initialCount = sessions1.length;

    await controller.startSession('azora.elara');
    const sessions2 = await controller.listAllSessions();
    expect(sessions2.length).toBeGreaterThan(initialCount);
  });

  it('should track user context in sessions', async () => {
    const userContext = { userId: 'user-123', role: 'student' };
    const session = await controller.startSession('azora.elara', userContext);
    expect(session.userContext).toEqual(userContext);

    const sessions = getChatSessionsService();
    const retrieved = sessions.getSession(session.id);
    expect(retrieved?.userContext).toEqual(userContext);
  });

  it('should add custom participants', () => {
    const customParticipant: ChatParticipant = {
      id: 'custom.agent',
      name: 'Custom Agent',
      role: 'agent',
    };
    controller.addParticipant(customParticipant);
    const participants = controller.getParticipants();
    expect(participants.some(p => p.id === 'custom.agent')).toBe(true);
  });

  it('should handle errors and call error handler', async () => {
    const mockRegistry = {
      registerAgent: jest.fn(),
      listAgents: jest.fn().mockReturnValue([{ id: 'azora.elara', name: 'Elara' }]),
      invokeAgent: jest.fn().mockRejectedValue(new Error('Agent failed')),
      invokeAgentStreaming: jest.fn().mockRejectedValue(new Error('Streaming failed')),
      onDidRegisterAgent: jest.fn(),
    };
    controller = new AzoraInlineChatController(mockRegistry);

    const errorHandler = jest.fn();
    const options: InlineChatOptions = { onError: errorHandler };
    
    try {
      await controller.sendMessage('Test', options);
    } catch (err) {
      // Expected
    }
    expect(errorHandler).toHaveBeenCalled();
  });
});
