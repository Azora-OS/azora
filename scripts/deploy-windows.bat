@echo off
REM 🚀 AZORA OS - WINDOWS DEPLOYMENT SCRIPT
REM This script sets up the complete Azora OS ecosystem on Windows

echo 🚀 Starting Azora OS Deployment...

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed. Please install Docker first.
    exit /b 1
)

docker-compose --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker Compose is not installed. Please install Docker Compose first.
    exit /b 1
)

echo [SUCCESS] Docker and Docker Compose are installed

REM Check if .env file exists
if not exist ".env" (
    echo [WARNING] .env file not found. Creating template...
    (
        echo # Azora OS Environment Configuration
        echo.
        echo # Database
        echo DATABASE_URL=postgresql://azora:azora@localhost:5432/azora_os
        echo.
        echo # JWT Secret
        echo JWT_SECRET=azora-super-secret-jwt-key-2025
        echo.
        echo # OpenAI API Key (required for AI features)
        echo OPENAI_API_KEY=your-openai-api-key-here
        echo.
        echo # Stripe Keys (required for payments)
        echo STRIPE_SECRET_KEY=your-stripe-secret-key-here
        echo STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret-here
        echo.
        echo # Service URLs (for local development)
        echo AUTH_URL=http://localhost:3001
        echo MINT_URL=http://localhost:3002
        echo LMS_URL=http://localhost:3003
        echo FORGE_URL=http://localhost:3004
        echo NEXUS_URL=http://localhost:3005
        echo EDUCATION_URL=http://localhost:3007
        echo PAYMENTS_URL=http://localhost:3008
        echo.
        echo # Frontend Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:4000
    ) > .env
    echo [WARNING] Please edit the .env file with your actual API keys before running this script again.
    exit /b 1
)

echo [SUCCESS] Environment file found

REM Setup databases
echo [INFO] Setting up databases...
if not exist "database" mkdir database

(
    echo -- Azora OS Database Initialization
    echo.
    echo -- Create databases for each service
    echo CREATE DATABASE azora_auth;
    echo CREATE DATABASE azora_mint;
    echo CREATE DATABASE azora_lms;
    echo CREATE DATABASE azora_forge;
    echo CREATE DATABASE azora_nexus;
    echo CREATE DATABASE azora_education;
    echo CREATE DATABASE azora_payments;
    echo.
    echo -- Grant permissions
    echo GRANT ALL PRIVILEGES ON DATABASE azora_auth TO azora;
    echo GRANT ALL PRIVILEGES ON DATABASE azora_mint TO azora;
    echo GRANT ALL PRIVILEGES ON DATABASE azora_lms TO azora;
    echo GRANT ALL PRIVILEGES ON DATABASE azora_forge TO azora;
    echo GRANT ALL PRIVILEGES ON DATABASE azora_nexus TO azora;
    echo GRANT ALL PRIVILEGES ON DATABASE azora_education TO azora;
    echo GRANT ALL PRIVILEGES ON DATABASE azora_payments TO azora;
) > database\init.sql

echo [SUCCESS] Database setup complete

REM Build and start services
echo [INFO] Building and starting services...
docker-compose build

if errorlevel 1 (
    echo [ERROR] Failed to build services
    exit /b 1
)

docker-compose up -d

if errorlevel 1 (
    echo [ERROR] Failed to start services
    exit /b 1
)

echo [SUCCESS] Services started successfully

REM Wait for services to be ready
echo [INFO] Waiting for services to be ready...
timeout /t 30 /nobreak >nul

REM Run database migrations
echo [INFO] Running database migrations...

set SERVICES=auth-service mint-service lms-service forge-service nexus-service education-service payments-service

for %%s in (%SERVICES%) do (
    echo [INFO] Running migrations for %%s...
    docker-compose exec -T %%s npm run db:migrate
    docker-compose exec -T %%s npm run db:generate
)

echo [SUCCESS] Database migrations complete

REM Health check
echo [INFO] Running health checks...

set SERVICES=api-gateway:4000 auth-service:3001 mint-service:3002 lms-service:3003 forge-service:3004 nexus-service:3005 education-service:3007 payments-service:3008 frontend:3000

for %%s in (%SERVICES%) do (
    for /f "tokens=1,2 delims=:" %%a in ("%%s") do (
        set SERVICE_NAME=%%a
        set SERVICE_PORT=%%b

        powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:!SERVICE_PORT!/health' -TimeoutSec 10; if ($response.StatusCode -eq 200) { Write-Host '[SUCCESS] !SERVICE_NAME! is healthy' } else { Write-Host '[ERROR] !SERVICE_NAME! health check failed' } } catch { Write-Host '[ERROR] !SERVICE_NAME! health check failed' }"
    )
)

echo.
echo [SUCCESS] 🎉 Azora OS deployment complete!
echo.
echo 🌐 Frontend: http://localhost:3000
echo 🚪 API Gateway: http://localhost:4000
echo 📊 Services:
echo   • Auth Service: http://localhost:3001
echo   • Mint Service: http://localhost:3002
echo   • LMS Service: http://localhost:3003
echo   • Forge Service: http://localhost:3004
echo   • Nexus Service: http://localhost:3005
echo   • Education Service: http://localhost:3007
echo   • Payments Service: http://localhost:3008
echo.
echo 📝 Don't forget to:
echo   • Update your .env file with real API keys
echo   • Configure SSL certificates for production
echo   • Set up monitoring and logging
echo   • Configure backup strategies

pause