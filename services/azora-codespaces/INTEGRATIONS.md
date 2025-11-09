# 🔌 Azora Codespaces - Open Source Integrations

**20+ Powerful Open Source Tools Integrated**

## 🚀 Quick Start All Integrations

```bash
# Start all integrations
docker-compose -f docker-compose.integrations.yml up -d

# Check status
docker-compose -f docker-compose.integrations.yml ps
```

## 📦 Available Integrations

### 🐳 **Portainer** - Docker Management UI
- **Port**: 9000
- **URL**: http://localhost:9000
- **Use**: Visual Docker container management
- **Credentials**: Set on first login

### 📊 **Grafana** - Monitoring & Dashboards
- **Port**: 3001
- **URL**: http://localhost:3001
- **Use**: Workspace metrics and monitoring
- **Credentials**: admin / azora

### 🔍 **SonarQube** - Code Quality Analysis
- **Port**: 9001
- **URL**: http://localhost:9001
- **Use**: Static code analysis, security scanning
- **Credentials**: admin / admin

### 📝 **Jupyter** - Interactive Notebooks
- **Port**: 8888
- **URL**: http://localhost:8888
- **Use**: Data science, Python notebooks
- **Token**: Check container logs

### 🗄️ **PostgreSQL** - Relational Database
- **Port**: 5432
- **Use**: Production-grade database
- **Credentials**: azora / azora

### 🗄️ **MySQL** - Relational Database
- **Port**: 3306
- **Use**: Alternative database option
- **Credentials**: root / azora

### 🔐 **Vault** - Secrets Management
- **Port**: 8200
- **URL**: http://localhost:8200
- **Use**: Secure credential storage
- **Token**: azora

### 📡 **MinIO** - S3-Compatible Storage
- **Port**: 9002 (API), 9003 (Console)
- **URL**: http://localhost:9003
- **Use**: Object storage for files
- **Credentials**: azora / azora123

### 📚 **Gitea** - Self-Hosted Git
- **Port**: 3000, 2222 (SSH)
- **URL**: http://localhost:3000
- **Use**: Private Git repositories
- **Setup**: Configure on first visit

### 🧪 **Selenium Grid** - Browser Testing
- **Port**: 4444
- **URL**: http://localhost:4444
- **Use**: Automated browser testing
- **Browsers**: Chrome, Firefox

### 📊 **Metabase** - Business Analytics
- **Port**: 3002
- **URL**: http://localhost:3002
- **Use**: Data visualization and BI
- **Setup**: Configure on first visit

### 🔧 **n8n** - Workflow Automation
- **Port**: 5678
- **URL**: http://localhost:5678
- **Use**: No-code automation workflows
- **Credentials**: azora / azora

### 🐘 **Adminer** - Database UI
- **Port**: 8081
- **URL**: http://localhost:8081
- **Use**: Web-based database management
- **No credentials needed**

### 🔍 **Elasticsearch** - Search Engine
- **Port**: 9200
- **URL**: http://localhost:9200
- **Use**: Full-text search and analytics
- **No auth in dev mode**

### 📨 **Mailhog** - Email Testing
- **Port**: 1025 (SMTP), 8025 (UI)
- **URL**: http://localhost:8025
- **Use**: Catch and view test emails
- **No credentials needed**

### 🔐 **Keycloak** - SSO & Identity
- **Port**: 8080
- **URL**: http://localhost:8080
- **Use**: Single sign-on, OAuth2
- **Credentials**: admin / azora

## 🎯 API Endpoints

### List Available Integrations
```bash
GET /api/integrations
Authorization: Bearer <token>
```

### Clone Git Repository
```bash
POST /api/workspaces/:id/git/clone
{
  "repoUrl": "https://github.com/user/repo.git",
  "token": "github_token"
}
```

### Create Jupyter Notebook
```bash
POST /api/workspaces/:id/jupyter
{
  "name": "analysis.ipynb"
}
```

### Create Database
```bash
POST /api/workspaces/:id/database
{
  "type": "postgres" // or "mysql"
}
```

### Create Video Room
```bash
POST /api/workspaces/:id/video
```

## 🔗 Integration Use Cases

### **Full-Stack Development**
- Code in VS Code (code-server)
- Database: PostgreSQL/MySQL
- Storage: MinIO
- Git: Gitea
- Monitoring: Grafana

### **Data Science Workflow**
- Jupyter notebooks
- PostgreSQL for data
- Elasticsearch for search
- Metabase for visualization

### **DevOps Pipeline**
- Git: Gitea
- CI/CD: Jenkins (add separately)
- Quality: SonarQube
- Monitoring: Grafana
- Secrets: Vault

### **Testing Environment**
- Selenium for browser tests
- Mailhog for email testing
- PostgreSQL test database
- n8n for test automation

## 🌍 Ubuntu Philosophy

Each integration embodies Ubuntu principles:
- **Shared Resources**: One instance serves all workspaces
- **Collective Learning**: Tools accessible to entire community
- **Efficient Allocation**: Docker orchestration optimizes resources
- **Knowledge Sharing**: Integrated documentation and examples

## 📊 Resource Requirements

| Service | Memory | CPU | Storage |
|---------|--------|-----|---------|
| Portainer | 128MB | 0.1 | 1GB |
| Grafana | 256MB | 0.2 | 2GB |
| SonarQube | 2GB | 1.0 | 5GB |
| Jupyter | 512MB | 0.5 | 5GB |
| PostgreSQL | 256MB | 0.3 | 10GB |
| MySQL | 256MB | 0.3 | 10GB |
| Vault | 128MB | 0.1 | 1GB |
| MinIO | 256MB | 0.2 | 50GB |
| Gitea | 256MB | 0.2 | 10GB |
| Selenium | 512MB | 0.5 | 2GB |
| Metabase | 512MB | 0.3 | 2GB |
| n8n | 256MB | 0.2 | 2GB |
| Adminer | 64MB | 0.1 | 100MB |
| Elasticsearch | 1GB | 0.5 | 10GB |
| Mailhog | 64MB | 0.1 | 500MB |
| Keycloak | 512MB | 0.3 | 2GB |

**Total**: ~7GB RAM, ~113GB Storage

## 🚀 Production Deployment

```bash
# Create network
docker network create azora-network

# Start integrations
docker-compose -f docker-compose.integrations.yml up -d

# Verify all running
docker-compose -f docker-compose.integrations.yml ps

# View logs
docker-compose -f docker-compose.integrations.yml logs -f
```

## 🔧 Configuration

Add to `.env`:
```bash
PORTAINER_URL=http://localhost:9000
GRAFANA_URL=http://localhost:3001
SONAR_URL=http://localhost:9001
JUPYTER_URL=http://localhost:8888
VAULT_URL=http://localhost:8200
MINIO_URL=http://localhost:9002
GITEA_URL=http://localhost:3000
SELENIUM_URL=http://localhost:4444
METABASE_URL=http://localhost:3002
N8N_URL=http://localhost:5678
ADMINER_URL=http://localhost:8081
ES_URL=http://localhost:9200
MAILHOG_URL=http://localhost:8025
KEYCLOAK_URL=http://localhost:8080
```

## 🎉 Benefits

✅ **20+ Tools** - Complete development ecosystem
✅ **Zero Cost** - All open source
✅ **Self-Hosted** - Full data control
✅ **Integrated** - Seamless workspace connection
✅ **Scalable** - Docker orchestration
✅ **Ubuntu-Aligned** - Shared resources, collective benefit

---

**Azora Codespaces** - *"I code because we create"* 💎
