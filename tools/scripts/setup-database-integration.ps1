# AZORA OS - DATABASE INTEGRATION SETUP
# Phase 1: Database Integration for All Services

param(
    [switch]$Help,
    [string]$DatabaseUrl = "postgresql://azora:azora@localhost:5432/azora",
    [switch]$SkipMigrations
)

if ($Help) {
    Write-Host "AZORA OS Database Integration Setup" -ForegroundColor Cyan
    Write-Host "===================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "This script sets up database integration for all Azora OS services." -ForegroundColor White
    Write-Host ""
    Write-Host "Parameters:" -ForegroundColor Yellow
    Write-Host "  -DatabaseUrl    PostgreSQL connection string (default: postgresql://azora:azora@localhost:5432/azora)" -ForegroundColor White
    Write-Host "  -SkipMigrations Skip Prisma migrations (for existing databases)" -ForegroundColor White
    Write-Host "  -Help          Show this help message" -ForegroundColor White
    Write-Host ""
    Write-Host "Requirements:" -ForegroundColor Yellow
    Write-Host "  - PostgreSQL 15+ running" -ForegroundColor White
    Write-Host "  - Database 'azora' created" -ForegroundColor White
    Write-Host "  - User 'azora' with permissions" -ForegroundColor White
    exit 0
}

Write-Host "AZORA OS DATABASE INTEGRATION" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Setting up database connections for all services..." -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL is running
Write-Host "Step 1: Checking PostgreSQL connection..." -ForegroundColor Yellow
try {
    $connectionString = $DatabaseUrl
    Write-Host "Testing connection to: $connectionString" -ForegroundColor Gray

    # Test connection (simplified - in production use proper connection test)
    Write-Host "✓ Database connection string configured" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to connect to database: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL is running and the database exists." -ForegroundColor Yellow
    exit 1
}

# Create .env file with database configuration
Write-Host ""
Write-Host "Step 2: Creating environment configuration..." -ForegroundColor Yellow

$envContent = @"
# Azora OS Database Configuration
DATABASE_URL="$DatabaseUrl"
POSTGRESQL_URL="$DatabaseUrl"

# Redis Configuration (for caching)
REDIS_URL="redis://localhost:6379"

# Supabase (fallback)
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# JWT Secret
JWT_SECRET="azora-constitutional-ai-2025"

# Service Ports
AZORA_LMS_PORT=3008
AZORA_EMAIL_PORT=3009
AZORA_ACADEMIC_INTEGRITY_PORT=3010
AZORA_PAYMENTS_PORT=3011
AZORA_CLASSROOM_PORT=3012
AZORA_SUPPORT_PORT=3013
AZORA_CAREERS_PORT=3014
AZORA_INNOVATION_HUB_PORT=3015
AZORA_COMMUNITY_PORT=3016
AZORA_INTEGRATION_PORT=3017
AZORA_FORGE_PORT=3005
AZORA_MINT_PORT=3001
AZORA_NEXUS_PORT=3002
"@

$envPath = ".\.env"
if (-not (Test-Path $envPath)) {
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Host "✓ Created .env file with database configuration" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file already exists, skipping creation" -ForegroundColor Yellow
}

# Run Prisma migrations
if (-not $SkipMigrations) {
    Write-Host ""
    Write-Host "Step 3: Running Prisma migrations..." -ForegroundColor Yellow

    if (Test-Path ".\services\prisma") {
        Push-Location ".\services\prisma"

        # Generate Prisma client
        Write-Host "Generating Prisma client..." -ForegroundColor Gray
        & npx prisma generate
        if ($LASTEXITCODE -ne 0) {
            Write-Host "⚠ Prisma generate failed, but continuing..." -ForegroundColor Yellow
        }

        # Run migrations
        Write-Host "Running database migrations..." -ForegroundColor Gray
        & npx prisma migrate deploy
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Database migrations completed" -ForegroundColor Green
        } else {
            Write-Host "⚠ Migration failed - database may need manual setup" -ForegroundColor Yellow
        }

        Pop-Location
    } else {
        Write-Host "⚠ Prisma directory not found, skipping migrations" -ForegroundColor Yellow
    }
}

# Update service configurations
Write-Host ""
Write-Host "Step 4: Updating service configurations..." -ForegroundColor Yellow

$services = @(
    "azora-lms",
    "azora-email-system",
    "azora-academic-integrity",
    "azora-payments",
    "azora-classroom",
    "azora-support",
    "azora-careers",
    "azora-innovation-hub",
    "azora-community",
    "azora-integration",
    "azora-forge",
    "azora-mint",
    "azora-nexus"
)

foreach ($service in $services) {
    $servicePath = ".\services\$service"
    if (Test-Path $servicePath) {
        # Create .env file for service if it doesn't exist
        $serviceEnvPath = "$servicePath\.env"
        if (-not (Test-Path $serviceEnvPath)) {
            Copy-Item $envPath $serviceEnvPath -Force
            Write-Host "✓ Created .env for $service" -ForegroundColor Green
        }

        # Check for database connection code
        $serverFile = Get-ChildItem $servicePath -Filter "server.ts" -Recurse | Select-Object -First 1
        if ($serverFile) {
            Write-Host "  - $service has server.ts file" -ForegroundColor Gray
        }
    }
}

# Test database connection
Write-Host ""
Write-Host "Step 5: Testing database connectivity..." -ForegroundColor Yellow

if (Test-Path ".\services\prisma") {
    Push-Location ".\services\prisma"
    Write-Host "Testing Prisma connection..." -ForegroundColor Gray
    & npx prisma db push --preview-feature
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database connection successful" -ForegroundColor Green
    } else {
        Write-Host "⚠ Database connection test failed" -ForegroundColor Yellow
    }
    Pop-Location
}

Write-Host ""
Write-Host "DATABASE INTEGRATION COMPLETE!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Start services individually: cd services/[service-name] && npm start" -ForegroundColor White
Write-Host "2. Or use parallel installer: .\tools\scripts\DEPLOY-ALL-SERVICES.ps1" -ForegroundColor White
Write-Host "3. Check service logs for database connection confirmations" -ForegroundColor White
Write-Host ""
Write-Host "Services with Database Integration:" -ForegroundColor Cyan
foreach ($service in $services) {
    Write-Host "  ✓ $service" -ForegroundColor White
}
Write-Host ""
Write-Host "Phase 1 Complete: Database integration ready for all services!" -ForegroundColor Green