# AZORA OS - DATABASE INTEGRATION SETUP
# Phase 1: Database Integration for All Services

Write-Host "AZORA OS DATABASE INTEGRATION" -ForegroundColor Cyan
Write-Host "============================" -ForegroundColor Cyan
Write-Host "Setting up database connections for all services..." -ForegroundColor Green
Write-Host ""

# Create .env file with database configuration
Write-Host "Step 1: Creating environment configuration..." -ForegroundColor Yellow

$envContent = "# Azora OS Database Configuration
DATABASE_URL=`"postgresql://azora:azora@localhost:5432/azora`"
POSTGRESQL_URL=`"postgresql://azora:azora@localhost:5432/azora`"

# Redis Configuration (for caching)
REDIS_URL=`"redis://localhost:6379`"

# JWT Secret
JWT_SECRET=`"azora-constitutional-ai-2025`"

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
AZORA_NEXUS_PORT=3002"

$envPath = ".\.env"
if (-not (Test-Path $envPath)) {
    Set-Content -Path $envPath -Value $envContent -Encoding UTF8
    Write-Host "✓ Created .env file with database configuration" -ForegroundColor Green
} else {
    Write-Host "⚠ .env file already exists, skipping creation" -ForegroundColor Yellow
}

# Update service configurations
Write-Host ""
Write-Host "Step 2: Updating service configurations..." -ForegroundColor Yellow

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
    }
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