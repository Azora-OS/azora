import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Chat Sessions persistence', () => {
  test('sessions persisted and loaded across instances', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'azora-'));
    process.env.AZORA_DATA_DIR = tmp;
    const { getChatSessionsService } = require('../chatSessionsService');
    // Clear global instance by creating a new one (module-level global), so instantiate directly
    const ChatSessionsService = require('../chatSessionsService').default;
    const s1 = new ChatSessionsService();
    // Reset session storage for clean test
    s1.createSession('system.cleaner');
    // Remove the above created session manually
    s1.sendMessage = s1.sendMessage.bind(s1); // keep type
    // Register a minimal chat agent to satisfy invocation
    const chatSvc = require('../chatAgentService').getChatAgentService();
    chatSvc.registerAgent({ id: 'azora.kofi', name: 'kofi', fullName: 'Kofi' }, { invoke: async (msg: string) => ({ content: `echo:${msg}` }) });
    // Also register in the Azora registry for streaming
    const registry = require('../../azora/agentRegistryService').getAzoraAgentRegistry();
    registry.registerAgent({ id: 'azora.kofi', name: 'kofi', fullName: 'Kofi', systemPrompt: 'Kofi persona' }, { invoke: async (m: string) => ({ content: `echo:${m}`, agentId: 'azora.kofi' }), invokeStreaming: async function* (m: string) { yield { chunk: 'part1' }; yield { chunk: 'part2' }; } } as any);
    const session = s1.createSession('azora.kofi');
    await s1.sendMessage(session.id, 'Hello');
    // Create new instance to simulate restart
    const s2 = new ChatSessionsService();
    const persisted = s2.getSession(session.id);
    expect(persisted).toBeDefined();
    expect(persisted!.messages.length).toBeGreaterThan(0);
    // Test streaming persistence
    const session2 = s2.createSession('azora.kofi');
    await s2.sendMessageWithProgress(session2.id, 'stream me', async (chunk) => { /* noop */ });
    const s3 = new ChatSessionsService();
    const persisted2 = s3.getSession(session2.id);
    expect(persisted2).toBeDefined();
    expect(persisted2!.messages.some(m => m.content.includes('part'))).toBeTruthy();
  });
});
