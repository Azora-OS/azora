# OpenAI Service

A comprehensive OpenAI API integration service for Azora OS with advanced rate limiting, model management, cost tracking, and error handling.

## Features

- **Multi-Model Support**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, DALL-E 3, Text Embeddings
- **Advanced Rate Limiting**: Global and endpoint-specific rate limits with Redis backing
- **Cost Tracking**: Automatic cost calculation and usage monitoring
- **Security**: Helmet.js security headers, input validation, CORS
- **Monitoring**: Winston logging, health checks, structured error responses
- **Performance**: Compression, connection pooling, efficient caching

## API Endpoints

### Health Check
```
GET /health
```

### Models
```
GET /models
```
Returns available models and their configurations.

### Chat Completions
```
POST /chat/completions
```
Supports GPT-4, GPT-4 Turbo, and GPT-3.5 Turbo models.

### Image Generation
```
POST /images/generations
```
Supports DALL-E 3 image generation.

### Embeddings
```
POST /embeddings
```
Supports text-embedding-ada-002 for semantic search.

### Rate Limit Status
```
GET /rate-limit/status
```
Check current rate limit status for the user.

## Rate Limits

- **Global**: 1000 requests/hour per IP
- **Chat**: 100 requests/minute per user
- **Images**: 50 requests/hour per user
- **Embeddings**: 500 requests/hour per user

## Environment Variables

```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3006
NODE_ENV=production
```

## Usage Examples

### Chat Completion
```javascript
const response = await fetch('http://localhost:3006/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user123'
  },
  body: JSON.stringify({
    model: 'gpt-4',
    messages: [
      { role: 'user', content: 'Hello, how are you?' }
    ],
    max_tokens: 100,
    temperature: 0.7
  })
});
```

### Image Generation
```javascript
const response = await fetch('http://localhost:3006/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': 'user123'
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over the ocean',
    size: '1024x1024',
    quality: 'hd'
  })
});
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## Docker

```bash
# Build image
docker build -t azora/openai-service .

# Run container
docker run -p 3006:3006 -e OPENAI_API_KEY=your_key azora/openai-service
```

## Monitoring

The service includes comprehensive logging and health checks. Monitor the following:

- `/health` endpoint for service status
- `/rate-limit/status` for rate limit monitoring
- Winston logs for detailed request/response tracking
- Cost metadata in API responses

## Security

- All endpoints validate input using Joi schemas
- Rate limiting prevents abuse
- Helmet.js provides security headers
- CORS configured for cross-origin requests
- Sensitive data never logged

## Error Handling

The service provides structured error responses:

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "message": "Too many requests. Try again in 60 seconds."
}
```

OpenAI API errors are properly mapped and returned with appropriate HTTP status codes.