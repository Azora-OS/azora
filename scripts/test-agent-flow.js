const axios = require('axios');
const base = process.env.AGENT_BASE_URL || 'http://localhost:4002';

async function run() {
  console.log('Sending task');
  const response = await axios.post(`${base}/execute`, { payload: { llm: { model: 'gpt-4', messages: [{ role: 'user', content: 'Hello' }] } } });
  console.log('Result', response.data);
  console.log('Done');
}

run().catch(e => { console.error(e.message); process.exit(1); });
