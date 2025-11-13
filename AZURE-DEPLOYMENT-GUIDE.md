# 🚀 Azure Deployment Guide - Azora OS

## Complete Enterprise Deployment

Deploy your entire RAG system to Azure in 3 ways:

### 🎯 Option 1: One-Click Script (Recommended)

```bash
cd azure-deploy
chmod +x deploy.sh
./deploy.sh
```

**What it does:**
- Creates resource group
- Sets up Container Registry
- Builds and pushes all images
- Deploys Knowledge Ocean
- Deploys Ollama (with GPU)
- Deploys Azllama Orchestrator
- Configures networking

**Time:** ~15 minutes

### 🏗️ Option 2: Terraform (Infrastructure as Code)

```bash
cd azure-deploy/terraform
terraform init
terraform plan
terraform apply
```

**Benefits:**
- Version controlled infrastructure
- Repeatable deployments
- Easy rollbacks

### 🐳 Option 3: Docker Compose (Local Testing)

```bash
cd azure-deploy
docker-compose -f docker-compose.azure.yml up
```

**Use for:**
- Local testing before Azure
- Development environment
- CI/CD pipeline testing

## 📋 Prerequisites

### Install Azure CLI
```bash
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
az login
```

### Install Terraform (Optional)
```bash
wget -O- https://apt.releases.hashicorp.com/gpg | sudo gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | sudo tee /etc/apt/sources.list.d/hashicorp.list
sudo apt update && sudo apt install terraform
```

## 🎯 Deployment Architecture

```
Azure Cloud
├── Resource Group: azora-rg
├── Container Registry: azoraregistry
├── Container App Environment: azora-env
│
├── Knowledge Ocean (Port 4040)
│   ├── CPU: 1 core
│   ├── Memory: 2GB
│   └── Ingress: External
│
├── Ollama LLM (Port 11434)
│   ├── CPU: 4 cores
│   ├── Memory: 8GB
│   ├── GPU: Optional
│   └── Ingress: Internal
│
└── Azllama Orchestrator (Port 8080)
    ├── CPU: 2 cores
    ├── Memory: 4GB
    └── Ingress: External (Public URL)
```

## 💰 Cost Estimate

### Basic Tier (Development)
- Container Apps: ~$50/month
- Container Registry: ~$5/month
- **Total: ~$55/month**

### Production Tier
- Container Apps (scaled): ~$200/month
- Container Registry (Standard): ~$20/month
- GPU for Ollama: ~$300/month
- **Total: ~$520/month**

## 🚀 Quick Deploy Commands

### Deploy Everything
```bash
cd azure-deploy
./deploy.sh
```

### Deploy Individual Services
```bash
# Knowledge Ocean only
az acr build --registry azoraregistry --image knowledge-ocean:latest ../services/knowledge-ocean
az containerapp create --name knowledge-ocean --image azoraregistry.azurecr.io/knowledge-ocean:latest

# Orchestrator only
az acr build --registry azoraregistry --image azllama:latest ../services/azllama-orchestrator
az containerapp create --name azllama --image azoraregistry.azurecr.io/azllama:latest
```

## 🔧 Configuration

### Environment Variables
```bash
# Set in Azure Portal or CLI
az containerapp update \
  --name azllama-orchestrator \
  --set-env-vars \
    KNOWLEDGE_OCEAN=https://knowledge-ocean.azurecontainerapps.io \
    OLLAMA_LLM=http://ollama:11434
```

### Scaling
```bash
# Auto-scale orchestrator
az containerapp update \
  --name azllama-orchestrator \
  --min-replicas 1 \
  --max-replicas 10 \
  --scale-rule-name http-rule \
  --scale-rule-type http \
  --scale-rule-http-concurrency 50
```

## 🔐 Security

### Enable Authentication
```bash
az containerapp auth update \
  --name azllama-orchestrator \
  --enabled true \
  --action AllowAnonymous
```

### Custom Domain
```bash
az containerapp hostname add \
  --name azllama-orchestrator \
  --hostname azllama.azora.world
```

## 📊 Monitoring

### View Logs
```bash
az containerapp logs show \
  --name azllama-orchestrator \
  --follow
```

### Metrics
```bash
az monitor metrics list \
  --resource azllama-orchestrator \
  --metric-names Requests
```

## 🧪 Testing Deployment

```bash
# Get URL
ORCHESTRATOR_URL=$(az containerapp show --name azllama-orchestrator --query properties.configuration.ingress.fqdn -o tsv)

# Test health
curl https://$ORCHESTRATOR_URL/health

# Test chat
curl -X POST https://$ORCHESTRATOR_URL/chat \
  -H "Content-Type: application/json" \
  -d '{"query": "What is Ubuntu philosophy?"}'

# Open UI
open https://$ORCHESTRATOR_URL
```

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Azure
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - run: cd azure-deploy && ./deploy.sh
```

## 🛠️ Troubleshooting

### Service Not Starting
```bash
# Check logs
az containerapp logs show --name azllama-orchestrator --tail 100

# Restart
az containerapp revision restart --name azllama-orchestrator
```

### Out of Memory
```bash
# Increase memory
az containerapp update \
  --name azllama-orchestrator \
  --memory 8Gi
```

### Slow Response
```bash
# Add more replicas
az containerapp update \
  --name azllama-orchestrator \
  --min-replicas 3
```

## 🌟 Production Checklist

- [ ] Enable authentication
- [ ] Configure custom domain
- [ ] Set up monitoring alerts
- [ ] Enable auto-scaling
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline
- [ ] Enable HTTPS only
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Document API endpoints

## 🎉 Success Indicators

✅ All services show "Healthy" status
✅ Web UI loads at public URL
✅ Chat responses work end-to-end
✅ Knowledge Ocean returns facts
✅ Ollama generates responses
✅ Session memory persists
✅ Tools execute correctly

## 📞 Support

- Azure Docs: https://docs.microsoft.com/azure
- Container Apps: https://aka.ms/containerapps
- Terraform: https://registry.terraform.io/providers/hashicorp/azurerm

---

**Your enterprise RAG system is Azure-ready! 🚀**

**Deploy with: `cd azure-deploy && ./deploy.sh`**
