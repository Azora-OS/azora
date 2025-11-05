#!/bin/bash
# AZORA OS - Deployment to Njinjicom Servers in Teraco
# Date: October 28, 2025

set -e

echo "🚀 AZORA OS - Deployment to Njinjicom Servers in Teraco"
echo "======================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Build Docker images
print_status "Building Docker images..."

# Ensure we're in the project root
cd "$(dirname "$0")"

# Build main app
cd synapse/main-app
docker build -t azora-main-app:latest .
cd ../..

# Build backend services
docker build -f Dockerfile.backend -t azora-backend:latest .

print_status "Docker images built successfully"

# Tag images for registry
REGISTRY="your-registry.com/azora"
docker tag azora-main-app:latest $REGISTRY/main-app:latest
docker tag azora-backend:latest $REGISTRY/backend:latest

print_status "Images tagged for registry: $REGISTRY"

# Push to registry
print_status "Pushing images to registry..."
docker push $REGISTRY/main-app:latest
docker push $REGISTRY/backend:latest

print_status "Images pushed successfully"

# Deploy to servers
print_status "Deploying to Njinjicom servers in Teraco..."

# This would typically involve SSH to servers and running docker-compose or kubectl
# For now, just print the commands

echo "
Deployment Commands for Servers:
===============================

# On each server, run:
docker pull $REGISTRY/main-app:latest
docker pull $REGISTRY/backend:latest

# Then run docker-compose up with production config
docker-compose -f vessels/docker-compose.production.yml up -d

"

print_status "Deployment preparation complete!"
print_warning "Please manually execute the deployment commands on the Teraco servers"
print_warning "Ensure environment variables are set in .env.production on servers"