## Prisma Migrations for Agent/Knowledge Models

We added the following models:
- Task
- Agent
- AgentExecution
- KnowledgeNode

To run migrations locally:
```
cp .env.example .env
# set DATABASE_URL
npx prisma migrate dev --name add_agent_task_models
npx prisma generate
```

If you are running in CI or a docker environment, run `npx prisma migrate deploy` during startup.

Notes:
- The `KnowledgeNode.embedding` column is currently saved as `Json` for portability.
- For production vector search, migrate to `pgvector` and update the Prisma schema accordingly.

Developer steps to apply pgvector migration (local):
1. Start local Postgres (docker-compose.db.yml) or use a test DB:

```powershell
docker-compose -f docker-compose.db.yml up -d
```

2. Set DATABASE_URL to your local DB in `.env`.
3. Run Prisma db push using Prisma 5 CLI to avoid schema URL incompatibilities with Prisma 7:

```powershell
npx prisma@5.7.0 db push --schema prisma/schema.prisma --accept-data-loss --force-reset
```

4. Confirm the `pgvector` extension is created and the `embedding_json` column exists (the migration scripts include these steps automatically). If using GitHub Actions, the `knowledge-ocean-ci.yml` handles this.

If you prefer to use Prisma 7+ CLI, migrate configuration following the Prisma 7 docs and create `prisma.config.ts` in project root as required. This repo includes a default `prisma.config.ts` to support Prisma 7 for the root schema and a `services/…/prisma.config.ts` per service for optional per-service usage.

Adding `pgvector` migration example:
```
-- enable the pgvector extension in Postgres
CREATE EXTENSION IF NOT EXISTS vector;

-- Create table with vector column
CREATE TABLE knowledge_nodes (
	id text PRIMARY KEY,
	path text,
	type text,
	title text,
	content text,
	embedding vector(1536),
	metadata jsonb,
	created_at timestamp,
	updated_at timestamp
);

-- kNN index
CREATE INDEX knowledge_nodes_embedding_idx ON knowledge_nodes USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```
