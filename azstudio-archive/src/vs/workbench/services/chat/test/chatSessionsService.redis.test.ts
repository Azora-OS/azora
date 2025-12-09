jest.mock('ioredis', () => require('ioredis-mock'));
import os from 'os';
import path from 'path';
import { default as ChatSessionsService } from '../chatSessionsService';

describe('ChatSessionsService Redis persistence', () => {
  test('when backend is redis the sessions persist in-memory mock', async () => {
    process.env.AZORA_STORAGE_BACKEND = 'redis';
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    const s = new ChatSessionsService();
    const session = s.createSession('azora.kofi');
    await s.sendMessage(session.id, 'hello');
    // new instance should load from redis-mock
    const s2 = new ChatSessionsService();
    const reloaded = s2.getSession(session.id);
    expect(reloaded).toBeDefined();
    expect(reloaded!.messages.length).toBeGreaterThan(0);
    // cleanup env
    delete process.env.AZORA_STORAGE_BACKEND;
    delete process.env.REDIS_URL;
  });
});
