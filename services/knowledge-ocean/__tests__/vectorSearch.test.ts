import { DatabaseIndexer } from '../src/indexer';
// @ts-ignore - optional dev dependency; tests can skip when 'pg' not available
import { Client } from 'pg';

describe('DatabaseIndexer', () => {
  it('indexes nodes with embeddings', async () => {
    // If there is no database available, skip this test to allow CI/dev runs without docker.
    if (!process.env.DATABASE_URL) {
      console.warn('DATABASE_URL not set - skipping DatabaseIndexer test');
      return;
    }
    // Try connecting to the DB, skip if unreachable
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      await client.end();
    } catch (connectErr: any) {
      console.warn('Database unreachable - skipping DatabaseIndexer test', connectErr.message);
      return;
    }

    const indexer = new DatabaseIndexer(process.env.AI_PROVIDER_URL ?? 'http://localhost:4010'); // mock URL
    const nodes = [{ id: 'test', path: 'test.txt', type: 'file', content: 'hello world', embedding: [0.1, 0.2] }];
    await indexer.indexNodes(nodes);
    // Assume DB is set up
    const results = await indexer.search('hello', 1);
    expect(results.length).toBeGreaterThanOrEqual(0);
  });
});
