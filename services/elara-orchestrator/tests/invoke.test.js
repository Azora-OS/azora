const request = require('supertest');

// Mock Express app for testing
function createTestApp() {
  const express = require('express');
  const bodyParser = require('body-parser');

  const app = express();
  app.use(bodyParser.json());

  app.get('/', (req, res) => {
    res.json({ name: 'elara-orchestrator', status: 'ok' });
  });

  app.post('/invoke', async (req, res) => {
    const { agent, action, context, code, language } = req.body || {};

    if (!action) {
      return res.status(400).json({ error: 'missing action' });
    }

    const output = {
      agent: agent || 'Elara',
      action,
      result: `Orchestrator handled action=${action} for agent=${agent || 'Elara'}`,
      suggestions: ['Add tests', 'Review results', 'Persist outputs'],
      executionId: null,
    };

    return res.json(output);
  });

  return app;
}

describe('Elara Orchestrator', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  test('GET / returns status', async () => {
    const res = await request(app)
      .get('/')
      .expect(200);

    expect(res.body).toHaveProperty('name', 'elara-orchestrator');
    expect(res.body).toHaveProperty('status', 'ok');
  });

  test('POST /invoke with valid action', async () => {
    const res = await request(app)
      .post('/invoke')
      .send({
        agent: 'Sankofa',
        action: 'code-review',
        context: 'test context',
        code: 'function test() {}',
      })
      .expect(200);

    expect(res.body).toHaveProperty('agent', 'Sankofa');
    expect(res.body).toHaveProperty('action', 'code-review');
    expect(res.body).toHaveProperty('result');
    expect(res.body).toHaveProperty('suggestions');
  });

  test('POST /invoke without action returns 400', async () => {
    const res = await request(app)
      .post('/invoke')
      .send({ context: 'missing action' })
      .expect(400);

    expect(res.body).toHaveProperty('error', 'missing action');
  });

  test('POST /invoke with default agent when not specified', async () => {
    const res = await request(app)
      .post('/invoke')
      .send({ action: 'test' })
      .expect(200);

    expect(res.body).toHaveProperty('agent', 'Elara');
  });
});
