#!/usr/bin/env pwsh
# Azora Database Setup Script for Windows
# This script sets up the PostgreSQL database using Docker

Write-Host "🚀 Azora Database Setup" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host ""

# Check if Docker is running
Write-Host "📦 Checking Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "❌ Docker is not running. Please start Docker Desktop and try again." -ForegroundColor Red
    exit 1
}

# Stop and remove existing containers if they exist
Write-Host ""
Write-Host "🧹 Cleaning up existing containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.db.yml down -v 2>$null

# Start database containers
Write-Host ""
Write-Host "🐘 Starting PostgreSQL and Redis..." -ForegroundColor Yellow
docker-compose -f docker-compose.db.yml up -d

# Wait for PostgreSQL to be ready
Write-Host ""
Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$ready = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    try {
        $healthCheck = docker exec azora-postgres pg_isready -U azora 2>$null
        if ($healthCheck -match "accepting connections") {
            $ready = $true
        }
    }
    catch {
        # Ignore errors, just keep trying
    }
    
    if (-not $ready) {
        Write-Host "." -NoNewline
        Start-Sleep -Seconds 1
    }
}

Write-Host ""
if ($ready) {
    Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
}
else {
    Write-Host "❌ PostgreSQL failed to start within 30 seconds" -ForegroundColor Red
    Write-Host "Check logs with: docker-compose -f docker-compose.db.yml logs postgres" -ForegroundColor Yellow
    exit 1
}

# Create .env file if it doesn't exist
Write-Host ""
Write-Host "📝 Configuring environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    $envContent = @"
# Database Configuration
DATABASE_URL="postgresql://azora:azora_dev_2025@localhost:5432/azora?schema=public"

# Redis Configuration
REDIS_URL="redis://localhost:6379"

# JWT Secret (change in production!)
JWT_SECRET="azora_dev_secret_change_in_production"

# Node Environment
NODE_ENV="development"
"@
    $envContent | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Created .env file" -ForegroundColor Green
}
else {
    Write-Host "ℹ️  .env file already exists, skipping..." -ForegroundColor Cyan
}

# Generate Prisma Client
Write-Host ""
Write-Host "🔧 Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Prisma Client generated successfully" -ForegroundColor Green
}
else {
    Write-Host "❌ Prisma Client generation failed" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host ""
Write-Host "🗄️  Running database migrations..." -ForegroundColor Yellow
npx prisma migrate dev --name init

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Migration may have failed, but continuing..." -ForegroundColor Yellow
}

# Display success message
Write-Host ""
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host "✨ Database Setup Complete!" -ForegroundColor Green
Write-Host "════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Database Info:" -ForegroundColor Cyan
Write-Host "  Host: localhost:5432" -ForegroundColor White
Write-Host "  Database: azora" -ForegroundColor White
Write-Host "  User: azora" -ForegroundColor White
Write-Host "  Password: azora_dev_2025" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Useful Commands:" -ForegroundColor Cyan
Write-Host "  View database: npx prisma studio" -ForegroundColor White
Write-Host "  Stop database: docker-compose -f docker-compose.db.yml down" -ForegroundColor White
Write-Host "  View logs: docker-compose -f docker-compose.db.yml logs -f" -ForegroundColor White
Write-Host "  Reset database: docker-compose -f docker-compose.db.yml down -v" -ForegroundColor White
Write-Host ""
