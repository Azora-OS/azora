import fs from 'fs';
import os from 'os';
import path from 'path';

describe('Agent Registry persistence', () => {
  test('registry persists metadata to disk and loads on new instance', async () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'azora-'));
    process.env.AZORA_DATA_DIR = tmp;
    // Delayed require after env var set
    const { AzoraAgentRegistryService } = require('../agentRegistryService');
    const registry1 = new AzoraAgentRegistryService();
    registry1.clear();
    registry1.clear();
    registry1.registerAgent({ id: 'azora.testp', name: 'testp', fullName: 'Test Persisted' }, { invoke: async () => ({ content: 'ok', agentId: 'azora.testp' }) } as any);
    // create new instance to simulate restart
    const registry2 = new AzoraAgentRegistryService();
    const list = registry2.listAgents();
    expect(list.some((m:any) => m.id === 'azora.testp')).toBeTruthy();
  });
});
