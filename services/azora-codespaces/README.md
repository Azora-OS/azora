# 🚀 Azora Codespaces

**Cloud-based development environments with VS Code in browser**

*Ubuntu Philosophy: "I code because we create"*

## Features

- ☁️ **Cloud Development**: VS Code in browser via code-server
- 🐳 **Docker Orchestration**: Isolated containerized workspaces
- 🤖 **Elara AI Integration**: AI-powered coding assistance
- 👥 **Real-time Collaboration**: Live coding with peers
- 📡 **Offline Sync**: Zero-rated data optimization
- 🛡️ **Constitutional Compliance**: Automated governance monitoring
- 🔌 **20+ Open Source Integrations**: Full development ecosystem

## Quick Start

```bash
# Install dependencies
npm install

# Start service
npm start

# Development mode
npm run dev
```

## API Endpoints

### Create Workspace
```bash
POST /api/workspaces
Authorization: Bearer <token>
{
  "name": "My Project",
  "template": "codercom/code-server:latest",
  "resources": {
    "memory": 2147483648,
    "cpu": 1024
  }
}
```

### List Workspaces
```bash
GET /api/workspaces
Authorization: Bearer <token>
```

### Get Workspace
```bash
GET /api/workspaces/:id
Authorization: Bearer <token>
```

### Delete Workspace
```bash
DELETE /api/workspaces/:id
Authorization: Bearer <token>
```

### Sync Files (Offline)
```bash
POST /api/workspaces/:id/sync
Authorization: Bearer <token>
{
  "files": [...]
}
```

### Elara AI Assistance
```bash
POST /api/workspaces/:id/elara
Authorization: Bearer <token>
{
  "query": "How do I implement authentication?",
  "context": { "files": [...] }
}
```

### Start Collaboration
```bash
POST /api/collaborate/:workspaceId
Authorization: Bearer <token>
{
  "userId": "user-id-to-invite"
}
```

## WebSocket Events

Connect to `ws://localhost:4200?workspace=<workspace-id>`

### Edit Event
```json
{
  "type": "edit",
  "file": "index.js",
  "changes": [...]
}
```

### Cursor Event
```json
{
  "type": "cursor",
  "position": { "line": 10, "column": 5 }
}
```

## Docker Deployment

```bash
# Build image
docker build -t azora-codespaces .

# Run container
docker run -p 4200:4200 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  azora-codespaces

# Or use docker-compose
docker-compose up -d
```

## Environment Variables

- `PORT`: Service port (default: 4200)
- `REDIS_URL`: Redis connection URL
- `JWT_SECRET`: JWT signing secret
- `ELARA_API`: Elara AI service URL
- `NODE_ENV`: Environment (development/production)

## Ubuntu Integration

Azora Codespaces embodies Ubuntu principles:
- **Collective Learning**: Share code and knowledge
- **Collaborative Creation**: Real-time pair programming
- **Resource Sharing**: Efficient workspace allocation
- **Constitutional Compliance**: Automated governance checks

## Health Check

```bash
curl http://localhost:4200/api/health
```

## 🔌 Open Source Integrations

See [INTEGRATIONS.md](./INTEGRATIONS.md) for complete list:

- 🐳 Portainer (Docker UI)
- 📊 Grafana (Monitoring)
- 🔍 SonarQube (Code Quality)
- 📝 Jupyter (Notebooks)
- 🗄️ PostgreSQL/MySQL (Databases)
- 🔐 Vault (Secrets)
- 📡 MinIO (S3 Storage)
- 📚 Gitea (Git)
- 🧪 Selenium (Testing)
- 📊 Metabase (Analytics)
- 🔧 n8n (Automation)
- And 9 more...

```bash
# Start all integrations
docker-compose -f docker-compose.integrations.yml up -d
```

## License

AZORA PROPRIETARY LICENSE - Azora ES (Pty) Ltd
