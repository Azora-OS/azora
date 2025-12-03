# Dockerfiles for Azora Cloud Services

Copy the `Dockerfile.nodejs` template to each premium service directory:

```bash
# For PrPEng Engine
cp infrastructure/dockerfiles/Dockerfile.nodejs services/azora-cloud/prpeng-engine/Dockerfile

# For AI Routing
cp infrastructure/dockerfiles/Dockerfile.nodejs services/azora-cloud/ai-routing/Dockerfile

# For Azora Mint
cp infrastructure/dockerfiles/Dockerfile.nodejs services/azora-cloud/azora-mint/Dockerfile

# For Constitutional AI
cp infrastructure/dockerfiles/Dockerfile.nodejs services/azora-cloud/constitutional-ai/Dockerfile
```

## Dockerfile Template

The `Dockerfile.nodejs` uses multi-stage builds for optimal image size:

1. **Builder stage**: Installs dependencies and compiles TypeScript
2. **Production stage**: Copies only necessary files, runs as non-root user
3. **Health check**: Ensures service is responding
4. **Port 3000**: Default port for all services

## Building Images

```bash
# Build locally
docker build -t azora/prpeng-engine:latest services/azora-cloud/prpeng-engine

# Build for AWS ECR
docker build --platform linux/amd64 -t ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/azora-cloud/prpeng-engine:latest services/azora-cloud/prpeng-engine
```

## Environment Variables

Each service requires:
- `NODE_ENV=production`
- `PORT=3000`
- `REDIS_URL` (from Terraform output)
- Service-specific variables (see each service's README)
