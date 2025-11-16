#!/bin/bash

# Test Database Setup Script
# Creates test databases for all services

set -e

echo "🗄️  Setting up test databases..."

# Database configuration
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# Test database names
DATABASES=(
  "azora_auth_test"
  "azora_education_test"
  "azora_mint_test"
  "azora_forge_test"
  "azora_sapiens_test"
  "azora_family_test"
)

# Drop existing test databases
echo "🗑️  Dropping existing test databases..."
for db in "${DATABASES[@]}"; do
  psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "DROP DATABASE IF EXISTS $db;" 2>/dev/null || true
done

# Create test databases
echo "📦 Creating test databases..."
for db in "${DATABASES[@]}"; do
  psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $db;"
  echo "  ✅ Created $db"
done

# Run migrations for each service
echo "🔄 Running migrations..."

services=(
  "auth-service:azora_auth_test"
  "azora-education:azora_education_test"
  "azora-mint:azora_mint_test"
  "azora-forge:azora_forge_test"
  "azora-sapiens:azora_sapiens_test"
  "ai-family-service:azora_family_test"
)

for service_db in "${services[@]}"; do
  IFS=':' read -r service db <<< "$service_db"
  
  if [ -d "services/$service/prisma" ]; then
    echo "  📝 Migrating $service..."
    cd "services/$service"
    DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$db" npx prisma migrate deploy
    cd ../..
    echo "  ✅ Migrated $service"
  fi
done

# Seed test data
echo "🌱 Seeding test data..."
npm run test:seed

echo "✅ Test databases setup complete!"
echo ""
echo "Test databases created:"
for db in "${DATABASES[@]}"; do
  echo "  - $db"
done
