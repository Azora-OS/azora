# Copilot Integration Service

Authentication and integration layer for AI coding assistants in Azora ecosystem.

## Features

### ✅ Implemented
- **Auth Flow**: Token-based authentication with expiration
- **Consent Management**: User consent tracking for AI services
- **Scope Validation**: Fine-grained permission control
- **Token Management**: Secure token generation and validation
- **Chat Integration**: Proxy for AI chat interactions

## API Endpoints

### Authentication
- `POST /auth/consent` - Grant consent for AI service access
- `POST /auth/token` - Generate authentication token
- `POST /auth/validate` - Validate existing token

### Chat
- `POST /chat` - Send chat message to AI assistant
- `GET /health` - Health check

## Usage

```typescript
// Grant consent
await fetch('http://localhost:4004/auth/consent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    service: 'copilot',
    scopes: ['chat', 'code-completion', 'code-review']
  })
});

// Get token
const tokenRes = await fetch('http://localhost:4004/auth/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user-123',
    scopes: ['chat', 'code-completion']
  })
});
const { token } = await tokenRes.json();

// Use chat with token
const chatRes = await fetch('http://localhost:4004/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'How do I implement authentication?',
    token
  })
});
```

## Consent Management

### Scopes
- `chat` - AI chat interactions
- `code-completion` - Code completion suggestions
- `code-review` - Code review and analysis
- `refactoring` - Code refactoring suggestions
- `documentation` - Documentation generation

### Consent Flow
1. User requests AI service access
2. System checks existing consent
3. If no consent, request user approval
4. Grant consent with specific scopes
5. Generate token for authenticated access

## Token Security

- Tokens expire after 1 hour
- Format: `azr_{timestamp}_{random}`
- Validated on each request
- Automatic cleanup of expired tokens

## Constitutional Compliance

Per Azora Constitution Article V & VII:
- **User Consent**: Required for all AI interactions
- **Transparency**: Clear disclosure of AI usage
- **Privacy**: No data collection without consent
- **Control**: Users can revoke consent anytime
- **Scope Limitation**: Minimal necessary permissions

## Environment Variables

```bash
PORT=4004
TOKEN_EXPIRY_MS=3600000
LOG_LEVEL=info
```

## VS Code Extension Integration

To integrate with VS Code:

```typescript
// In VS Code extension
import * as vscode from 'vscode';

async function requestCopilotAccess() {
  const userId = vscode.env.machineId;
  
  // Request consent
  await fetch('http://localhost:4004/auth/consent', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      service: 'vscode-copilot',
      scopes: ['chat', 'code-completion']
    })
  });
  
  // Get token
  const res = await fetch('http://localhost:4004/auth/token', {
    method: 'POST',
    body: JSON.stringify({ userId, scopes: ['chat'] })
  });
  
  const { token } = await res.json();
  return token;
}
```

## Development

```bash
npm install
npm run dev
npm test
```

## Architecture

```
CopilotIntegration
├── AuthFlow (consent & token management)
├── Token Validation (security)
├── Scope Management (permissions)
└── Chat Proxy (AI interaction)
```

## Next Steps

- [ ] VS Code extension implementation
- [ ] Real Copilot API integration
- [ ] Multi-provider support (GitHub Copilot, Amazon Q, etc.)
- [ ] Usage analytics and rate limiting
- [ ] Advanced consent UI

---

**Built with Ubuntu Philosophy**: Technology serves humanity, never enslaves
