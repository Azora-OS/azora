import { apiKeyOrJwtAuth, resetRateMap, getRateCount } from '../src/middleware/auth';
import jwt from 'jsonwebtoken';

describe('Auth middleware', () => {
  const handler = apiKeyOrJwtAuth(true);

  function makeReq(headers: Record<string, string> = {}) {
    return {
      headers,
      ip: '127.0.0.1',
      body: {}
    } as any;
  }

  function makeRes() {
    const res: any = {};
    res.status = (s: number) => { res._status = s; return res; };
    res.json = (obj: any) => { res._body = obj; return res; };
    return res;
  }

  it('denies without auth when required', async () => {
    // set configured API key to force auth checks
    process.env.INDEX_API_KEY = 'abc';
    const req = makeReq();
    const res = makeRes();
    let nextCalled = false;
    await handler(req, res, () => { nextCalled = true; return; });
    expect(nextCalled).toBe(false);
    expect(res._status).toBe(401);
    delete process.env.INDEX_API_KEY;
  });

  it('allows with correct API key', async () => {
    process.env.INDEX_API_KEY = 'test-key';
    const req = makeReq({ 'x-api-key': 'test-key' });
    const res = makeRes();
    let nextCalled = false;
    await handler(req, res, () => { nextCalled = true; return; });
    expect(nextCalled).toBe(true);
    delete process.env.INDEX_API_KEY;
  });

  it('allows with valid JWT role', async () => {
    process.env.JWT_SECRET = 'shh';
    const token = jwt.sign({ sub: 'client1', role: 'indexer' }, process.env.JWT_SECRET as string);
    const req = makeReq({ 'authorization': `Bearer ${token}` });
    const res = makeRes();
    let nextCalled = false;
    await handler(req, res, () => { nextCalled = true; return; });
    expect(nextCalled).toBe(true);
    delete process.env.JWT_SECRET;
  });

  it('rate limits after many requests', async () => {
    process.env.INDEX_API_KEY = 'rl-key';
    process.env.RATE_LIMIT_WINDOW_MS = '1000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '3';
    resetRateMap('rl-key');
    process.env.RATE_LIMIT_WINDOW_MS = '1000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '3';
    const handler = apiKeyOrJwtAuth(true);
    const req = { headers: { 'x-api-key': 'rl-key' } } as any;
    const makeRes = () => {
      const r: any = {};
      r.status = (s: number) => { r._status = s; return r; };
      r.json = (obj: any) => { r._body = obj; return r; };
      return r;
    };
    // Call 3 times allowed
    await handler(req, makeRes(), () => { return; });
    await handler(req, makeRes(), () => { return; });
    await handler(req, makeRes(), () => { return; });
    const res4 = makeRes();
    let called = false;
    await handler(req, res4, () => { called = true; return; });
    // Last call should be rate limited (so next shouldn't be called)
    expect(called).toBe(false);
    delete process.env.INDEX_API_KEY;
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
    resetRateMap('rl-key');
    delete process.env.RATE_LIMIT_WINDOW_MS;
    delete process.env.RATE_LIMIT_MAX_REQUESTS;
  });
});
