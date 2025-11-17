import axios from 'axios';

interface ServiceTest {
  name: string;
  passed: boolean;
  latency: number;
  error?: string;
}

const tests: ServiceTest[] = [];

async function testService(name: string, testFn: () => Promise<void>): Promise<void> {
  const start = Date.now();
  try {
    await testFn();
    tests.push({ name, passed: true, latency: Date.now() - start });
    console.log(`✓ ${name} (${Date.now() - start}ms)`);
  } catch (error) {
    tests.push({
      name,
      passed: false,
      latency: Date.now() - start,
      error: error instanceof Error ? error.message : String(error)
    });
    console.log(`✗ ${name}: ${error}`);
  }
}

async function testExternalServices(): Promise<void> {
  console.log('🌐 Testing External Service Connectivity\n');

  // Stripe
  await testService('Stripe API', async () => {
    const apiKey = process.env.STRIPE_API_KEY;
    if (!apiKey) throw new Error('STRIPE_API_KEY not set');

    const res = await axios.get('https://api.stripe.com/v1/account', {
      auth: { username: apiKey, password: '' }
    });

    if (res.status !== 200) throw new Error('Stripe API returned non-200 status');
  });

  // Pinecone
  await testService('Pinecone Vector DB', async () => {
    const apiKey = process.env.PINECONE_API_KEY;
    const environment = process.env.PINECONE_ENVIRONMENT;

    if (!apiKey || !environment) throw new Error('Pinecone credentials not set');

    const res = await axios.get(
      `https://controller.${environment}.pinecone.io/actions/whoami`,
      { headers: { 'Api-Key': apiKey } }
    );

    if (res.status !== 200) throw new Error('Pinecone API returned non-200 status');
  });

  // OpenAI
  await testService('OpenAI API', async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OPENAI_API_KEY not set');

    const res = await axios.get('https://api.openai.com/v1/models', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (res.status !== 200) throw new Error('OpenAI API returned non-200 status');
  });

  // SendGrid (Email)
  await testService('SendGrid Email Service', async () => {
    const apiKey = process.env.SENDGRID_API_KEY;
    if (!apiKey) throw new Error('SENDGRID_API_KEY not set');

    const res = await axios.get('https://api.sendgrid.com/v3/mail/send', {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (res.status !== 404 && res.status !== 200) {
      throw new Error(`SendGrid API returned ${res.status}`);
    }
  });

  // AWS S3
  await testService('AWS S3', async () => {
    const accessKey = process.env.AWS_ACCESS_KEY_ID;
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY;
    const region = process.env.AWS_REGION || 'us-east-1';

    if (!accessKey || !secretKey) throw new Error('AWS credentials not set');

    const res = await axios.get(`https://s3.${region}.amazonaws.com/`, {
      auth: { username: accessKey, password: secretKey }
    });

    if (res.status !== 200 && res.status !== 403) {
      throw new Error(`S3 returned ${res.status}`);
    }
  });

  // Google Cloud
  await testService('Google Cloud', async () => {
    const projectId = process.env.GCP_PROJECT_ID;
    if (!projectId) throw new Error('GCP_PROJECT_ID not set');

    const res = await axios.get(
      `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`,
      { headers: { 'Authorization': `Bearer ${process.env.GCP_ACCESS_TOKEN}` } }
    );

    if (res.status !== 200) throw new Error(`GCP returned ${res.status}`);
  });

  // GitHub
  await testService('GitHub API', async () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error('GITHUB_TOKEN not set');

    const res = await axios.get('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (res.status !== 200) throw new Error('GitHub API returned non-200 status');
  });

  // DNS Resolution
  await testService('DNS Resolution', async () => {
    const dns = require('dns').promises;
    const addresses = await dns.resolve4('api.azora.io');
    if (!addresses || addresses.length === 0) throw new Error('DNS resolution failed');
  });

  // Report
  console.log('\n📊 External Service Test Results\n');
  const passed = tests.filter(t => t.passed).length;
  const total = tests.length;
  const avgLatency = tests.reduce((sum, t) => sum + t.latency, 0) / total;

  console.log(`Passed: ${passed}/${total}`);
  console.log(`Average Latency: ${avgLatency.toFixed(2)}ms`);

  if (passed < total) {
    console.log('\n❌ Failed Tests:');
    tests.filter(t => !t.passed).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All external services are reachable!');
    process.exit(0);
  }
}

testExternalServices().catch(error => {
  console.error('External service tests failed:', error);
  process.exit(1);
});
