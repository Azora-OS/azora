#!/bin/bash
# Azora OS - Database Setup Script
# Agent 4: Service Implementation Specialist

set -e

echo "🚀 Azora OS - Database Setup"
echo "================================"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Start PostgreSQL and Redis
echo "📦 Starting PostgreSQL and Redis..."
docker-compose -f docker-compose.dev.yml up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check PostgreSQL health
until docker exec azora-postgres-dev pg_isready -U azora > /dev/null 2>&1; do
    echo "   Waiting for PostgreSQL..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Create databases
echo "📊 Creating databases..."
docker exec azora-postgres-dev psql -U azora -d azora_os -c "
CREATE DATABASE azora_auth;
CREATE DATABASE azora_mint;
CREATE DATABASE azora_forge;
CREATE DATABASE azora_lms;
CREATE DATABASE azora_education;
CREATE DATABASE azora_ai_family;
CREATE DATABASE azora_notification;
CREATE DATABASE azora_analytics;
" 2>/dev/null || echo "   Databases may already exist"

echo "✅ Databases created!"

# Run migrations for each service
echo "🔄 Running Prisma migrations..."

services=("auth-service" "azora-mint" "azora-forge" "azora-lms" "ai-family-service" "notification-service" "analytics-service")

for service in "${services[@]}"; do
    if [ -d "services/$service/prisma" ]; then
        echo "   Migrating $service..."
        cd "services/$service"
        
        # Set DATABASE_URL based on service
        case $service in
            "auth-service")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_auth"
                ;;
            "azora-mint")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_mint"
                ;;
            "azora-forge")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_forge"
                ;;
            "azora-lms")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_lms"
                ;;
            "ai-family-service")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_ai_family"
                ;;
            "notification-service")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_notification"
                ;;
            "analytics-service")
                export DATABASE_URL="postgresql://azora:azora@localhost:5432/azora_analytics"
                ;;
        esac
        
        # Install dependencies if needed
        if [ ! -d "node_modules" ]; then
            npm install --silent
        fi
        
        # Generate Prisma client
        npx prisma generate
        
        # Run migrations
        npx prisma migrate deploy || npx prisma db push
        
        cd ../..
        echo "   ✅ $service migrated"
    fi
done

echo ""
echo "✅ Database setup complete!"
echo ""
echo "📊 Database Information:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   User: azora"
echo "   Password: azora"
echo ""
echo "🔗 pgAdmin: http://localhost:5050"
echo "   Email: admin@azora.world"
echo "   Password: azora"
echo ""
echo "🎯 Next steps:"
echo "   1. Start services: npm run dev"
echo "   2. Check health: curl http://localhost:4000/api/health"
echo ""
