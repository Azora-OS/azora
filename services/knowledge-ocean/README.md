# Knowledge Ocean Service

The Knowledge Ocean is a service that provides embeddings (via an AI provider) and semantic search across knowledge nodes.

API:
- GET /search?q={query}
  - Returns a list of knowledge nodes matched by semantic similarity.

- POST /index
  - Accepts an array of nodes to index.
  - Each node must contain `id` and `content`. Optional fields: `title`, `path`, `metadata`.
  - Protect the endpoint using x-api-key or Bearer token if `INDEX_API_KEY` env var is set.

Developer Notes:
1. To run locally with Postgres and pgvector, start the DB and create the extension:
```powershell
# start db
docker-compose -f docker-compose.db.yml up -d
# in CI or runner, you might need to run:
PGPASSWORD=azora psql -h localhost -U azora -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

2. Apply schema changes (use Prisma v5 for consistent behavior across services in this repo):
```powershell
npx prisma@5.7.0 db push --schema prisma/schema.prisma --accept-data-loss --force-reset
```

3. Seed and run service:
```powershell
cd services/knowledge-ocean
npm ci
npm run dev
```

4. Configure `INDEX_API_KEY` in `.env` to secure indexing.

Authentication & RBAC
---------------------
This service supports two methods to authenticate calls to `/index`:

1. `x-api-key` header (raw key or `Bearer <key>` format). If `INDEX_API_KEY` is set, it will be used.
2. JWT Bearer token: If `JWT_SECRET` is set, the service will validate `Authorization: Bearer <token>` and accept tokens whose payload has `role` set to one of `admin`, `indexer`, `azstudio-service`.

Example to create a JWT locally using `node`:

```bash
node -e "console.log(require('jsonwebtoken').sign({sub:'client1', role:'indexer'}, 'shh'))"
```

Then call:
```bash
curl -H "Authorization: Bearer <token>" -X POST http://localhost:4003/index -d '[{"id":"test","content":"hi"}]'
```

Rate limiting
-------------
The service implements a simple per-key rate limiter. You can configure limits using environment variables:
 - `RATE_LIMIT_WINDOW_MS`: window size in milliseconds (default 60000)
 - `RATE_LIMIT_MAX_REQUESTS`: max requests per window (default 60)

These are simple in-memory limits. For production, configure a Redis-based rate limiter for horizontal scaling.

5. The service supports both `embedding` vector (pgvector) and `embedding_json` fallback JSONB storage. If a vector column isn't present, the service falls back to L2 distance on JSON embeddings for search.

CI: Use the `knowledge-ocean-ci.yml` workflow which starts a Postgres instance, enables `pgvector`, runs Prisma db push, seeds the DB, and runs tests that validate indexing and search.
