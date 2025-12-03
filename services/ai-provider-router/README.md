# AI Provider Router

This service acts as a router/proxy to one or more AI providers. For now it proxies to OpenAI via `OPENAI_API_KEY` environment variable.

Endpoints:
- POST /v1/chat/completions -> Proxy to OpenAI chat completion
- POST /embed -> Proxy to OpenAI embeddings endpoint

Run (dev):
```
cd services/ai-provider-router
npm install
npm run dev
```
