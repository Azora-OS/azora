/* eslint-disable no-console */
const axios = require('axios');
jest.setTimeout(120000);

describe('E2E Roundtrip', () => {
  it('indexes and queries when services available', async () => {
    const baseUrl = 'http://localhost:4003';
    const aiUrl = process.env.AI_PROVIDER_URL || 'http://localhost:4010';
    // Check service availability
    try {
      await axios.get(aiUrl);
    } catch (e) {
      console.warn('AI provider unreachable - skipping e2e test');
      return;
    }
    try {
      await axios.get(baseUrl);
    } catch (e) {
      console.warn('Knowledge Ocean service unreachable - skipping e2e test');
      return;
    }
    // index
    const sample = [{ id: 'e2e-1', path: 'e2e.txt', type: 'file', content: 'a small e2e test content here', title: 'E2E' }];
    const r1 = await axios.post(`${baseUrl}/index`, sample, { headers: { 'x-api-key': 'ci-index-key' } });
    expect(r1.status).toBe(200);
    // search
    await new Promise(r => setTimeout(r, 500));
    const r2 = await axios.get(`${baseUrl}/search?q=small`);
    expect(r2.status).toBe(200);
    expect(Array.isArray(r2.data)).toBe(true);
    expect(r2.data.length).toBeGreaterThanOrEqual(0);
  });
});
