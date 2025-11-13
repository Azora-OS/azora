#!/bin/bash
set -e

echo "🚀 Azora OS Azure Deployment"
echo "=============================="

# Configuration
RESOURCE_GROUP="azora-rg"
LOCATION="eastus"
ACR_NAME="azoraregistry"
APP_ENV="azora-env"

# Create resource group
echo "📦 Creating resource group..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Container Registry
echo "🐳 Creating container registry..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Get ACR credentials
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)

# Build and push Knowledge Ocean
echo "📚 Building Knowledge Ocean..."
cd ../services/knowledge-ocean
az acr build --registry $ACR_NAME --image knowledge-ocean:latest .

# Build and push Azllama Orchestrator
echo "🧠 Building Azllama Orchestrator..."
cd ../azllama-orchestrator
az acr build --registry $ACR_NAME --image azllama-orchestrator:latest .

# Create Container App Environment
echo "🌍 Creating Container App environment..."
az containerapp env create \
  --name $APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Deploy Knowledge Ocean
echo "📚 Deploying Knowledge Ocean..."
az containerapp create \
  --name knowledge-ocean \
  --resource-group $RESOURCE_GROUP \
  --environment $APP_ENV \
  --image $ACR_LOGIN_SERVER/knowledge-ocean:latest \
  --target-port 4040 \
  --ingress external \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --cpu 1 --memory 2Gi

# Deploy Ollama
echo "🦙 Deploying Ollama..."
az containerapp create \
  --name ollama \
  --resource-group $RESOURCE_GROUP \
  --environment $APP_ENV \
  --image ollama/ollama:latest \
  --target-port 11434 \
  --ingress internal \
  --cpu 4 --memory 8Gi

# Get service URLs
KNOWLEDGE_URL=$(az containerapp show --name knowledge-ocean --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)
OLLAMA_URL="http://ollama.internal.$APP_ENV.azurecontainerapps.io:11434"

# Deploy Azllama Orchestrator
echo "🧠 Deploying Azllama Orchestrator..."
az containerapp create \
  --name azllama-orchestrator \
  --resource-group $RESOURCE_GROUP \
  --environment $APP_ENV \
  --image $ACR_LOGIN_SERVER/azllama-orchestrator:latest \
  --target-port 8080 \
  --ingress external \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --env-vars \
    KNOWLEDGE_OCEAN=https://$KNOWLEDGE_URL \
    OLLAMA_LLM=$OLLAMA_URL \
  --cpu 2 --memory 4Gi

# Get final URL
ORCHESTRATOR_URL=$(az containerapp show --name azllama-orchestrator --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)

echo ""
echo "✅ Deployment Complete!"
echo "=============================="
echo "🌐 Azllama UI: https://$ORCHESTRATOR_URL"
echo "📚 Knowledge Ocean: https://$KNOWLEDGE_URL"
echo ""
echo "Test it:"
echo "curl https://$ORCHESTRATOR_URL/health"
