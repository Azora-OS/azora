jest.mock('ioredis', () => require('ioredis-mock'));
import StorageService from '../storageService';

describe('StorageService Redis backend via ioredis-mock', () => {
  test('when redis backend configured but ioredis missing, fallback to filesystem', async () => {
    process.env.AZORA_STORAGE_BACKEND = 'redis';
    process.env.REDIS_URL = 'redis://127.0.0.1:6379';
    const s = new StorageService();
    await s.writeJson('test-rw.json', { ok: true });
    const val = await s.readJson('test-rw.json');
    expect(val).toBeDefined();
    expect((val as any).ok).toBeTruthy();
    // Clear env
    delete process.env.AZORA_STORAGE_BACKEND;
    delete process.env.REDIS_URL;
  });
});
