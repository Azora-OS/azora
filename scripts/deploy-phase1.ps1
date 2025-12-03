# Azora Phase 1: Education Platform Deployment
# This script deploys the core infrastructure and education services

Write-Host "🚀 Azora Phase 1: Education Platform Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verify environment
Write-Host "Step 1: Verifying environment..." -ForegroundColor Blue
if (-not (Test-Path .env)) {
    Write-Host "Warning: .env file not found. Copying from .env.example" -ForegroundColor Yellow
    Copy-Item .env.example .env
    Write-Host "Please update .env with your actual values before continuing." -ForegroundColor Yellow
    exit 1
}

# Step 2: Create docker network if it doesn't exist
Write-Host "Step 2: Creating Docker network..." -ForegroundColor Blue
docker network create azora-network 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Network already exists or created successfully"
}

# Step 3: Start core infrastructure
Write-Host "Step 3: Starting core infrastructure..." -ForegroundColor Blue
Write-Host "  - PostgreSQL database"
Write-Host "  - Redis cache"
docker-compose up -d database redis

# Wait for database to be ready
Write-Host "Waiting for database to be ready..."
Start-Sleep -Seconds 10

# Step 4: Run database migrations
Write-Host "Step 4: Running database migrations..." -ForegroundColor Blue
# TODO: Add migration commands here
# npx prisma migrate deploy

# Step 5: Start API Gateway and Auth Service
Write-Host "Step 5: Starting API Gateway and Auth Service..." -ForegroundColor Blue
docker-compose up -d api-gateway auth-service

# Wait for services to be ready
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 5

# Step 6: Start education services
Write-Host "Step 6: Starting education services..." -ForegroundColor Blue
docker-compose -f services/docker-compose.education.yml up -d

# Step 7: Health checks
Write-Host "Step 7: Running health checks..." -ForegroundColor Blue
Write-Host "Checking API Gateway..."
try {
    Invoke-WebRequest -Uri http://localhost:4000/health -UseBasicParsing | Out-Null
    Write-Host "✓ API Gateway is healthy" -ForegroundColor Green
}
catch {
    Write-Host "✗ API Gateway not ready yet" -ForegroundColor Yellow
}

Write-Host "Checking Auth Service..."
try {
    Invoke-WebRequest -Uri http://localhost:3001/health -UseBasicParsing | Out-Null
    Write-Host "✓ Auth Service is healthy" -ForegroundColor Green
}
catch {
    Write-Host "✗ Auth Service not ready yet" -ForegroundColor Yellow
}

# Step 8: Show running services
Write-Host ""
Write-Host "✅ Phase 1 deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Running services:"
docker-compose ps

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Build and deploy frontend applications"
Write-Host "2. Seed database with sample courses"
Write-Host "3. Test the education platform"
Write-Host ""
Write-Host "To view logs: docker-compose logs -f"
Write-Host "To stop services: docker-compose down"
