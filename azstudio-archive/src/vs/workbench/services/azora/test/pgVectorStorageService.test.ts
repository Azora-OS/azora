jest.mock('pg', () => require('pg-mem')); // use pg-mem to emulate Postgres
import { newDb } from 'pg-mem';
import PgVectorStorageService from '../pgVectorStorageService';

describe('PgVectorStorageService in-memory', () => {
  test('index and query behave correctly (fallback JSON embeddings)', async () => {
    // Create a pg-mem DB
    const db = newDb();
    const client = await db.adapters.createPg().connect();
    // patch `pg` client constructor to return our connection
    const Pg = require('pg');
    Pg.Client = function () { return client; } as any;

    const svc = new PgVectorStorageService('postgresql://test');
    await svc.indexDocs([{ id: 'p1', title: 'Sorting', content: 'quicksort mergesort heapsort' }, { id: 'p2', title: 'Math', content: 'linear algebra matrices vectors' }]);
    const results = await svc.query('quicksort', 2);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toMatch(/Sorting/i);
  });
});
