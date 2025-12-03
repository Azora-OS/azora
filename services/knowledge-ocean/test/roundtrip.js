/* eslint-disable no-console */
const axios = require('axios');

async function run() {
  const baseUrl = process.env.KNOWLEDGE_OCEAN_URL || 'http://localhost:4003';
  const apiKey = process.env.INDEX_API_KEY || 'ci-index-key';
  try {
    const sample = [{ id: 'rt-1', path: 'rt.txt', type: 'file', content: 'hello world from roundtrip test', title: 'RT Test', metadata: { category: 'test', tags: ['ci'] } }];
    const r1 = await axios.post(`${baseUrl}/index`, sample, { headers: { 'x-api-key': apiKey } });
    console.log('Index response', r1.status, r1.data);
    const r2 = await axios.get(`${baseUrl}/search?q=hello`);
    console.log('Search response', r2.status, r2.data);
    if (Array.isArray(r2.data) && r2.data.length >= 1) {
      console.log('Roundtrip OK');
      process.exit(0);
    } else {
      console.error('Roundtrip failed - no results');
      process.exit(2);
    }
  } catch (err) {
    console.error('Roundtrip error', err.message || err);
    process.exit(3);
  }
}

run();
