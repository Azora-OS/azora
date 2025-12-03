describe('End-to-End Copilot Integration', () => {
  const baseUrl = 'http://localhost:4004';
  const userId = 'test-user';

  it('should complete auth flow', async () => {
    const consentRes = await fetch(`${baseUrl}/auth/consent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        service: 'copilot',
        scopes: ['chat', 'code-completion']
      })
    });

    expect(consentRes.ok).toBe(true);

    const tokenRes = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, scopes: ['chat'] })
    });

    const { token } = await tokenRes.json();
    expect(token).toBeDefined();

    const validateRes = await fetch(`${baseUrl}/auth/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    });

    expect(validateRes.ok).toBe(true);
  });

  it('should handle chat with valid token', async () => {
    const tokenRes = await fetch(`${baseUrl}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, scopes: ['chat'] })
    });

    const { token } = await tokenRes.json();

    const chatRes = await fetch(`${baseUrl}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Test prompt', token })
    });

    expect(chatRes.ok).toBe(true);
    const result = await chatRes.json();
    expect(result).toHaveProperty('reply');
  });
});
