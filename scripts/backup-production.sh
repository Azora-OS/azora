#!/bin/bash

echo "💾 AZORA PRODUCTION BACKUP"
echo "========================="
echo "⚡ Ubuntu: I backup because we preserve together!"
echo ""

# Create backup directory
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# Database backup
echo "🗄️ Backing up database..."
docker exec azora_postgres_1 pg_dump -U azora_admin azora_production > "$BACKUP_DIR/database.sql"

# Redis backup
echo "🔴 Backing up Redis..."
docker exec azora_redis_1 redis-cli BGSAVE
docker cp azora_redis_1:/data/dump.rdb "$BACKUP_DIR/redis.rdb"

# Configuration backup
echo "⚙️ Backing up configuration..."
cp .env.production "$BACKUP_DIR/"
cp docker-compose.prod.yml "$BACKUP_DIR/"

# Logs backup
echo "📋 Backing up logs..."
docker logs azora_api-gateway_1 > "$BACKUP_DIR/api-gateway.log" 2>&1
docker logs azora_auth-service_1 > "$BACKUP_DIR/auth-service.log" 2>&1

# Compress backup
echo "🗜️ Compressing backup..."
tar -czf "$BACKUP_DIR.tar.gz" -C "./backups" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "✅ Backup complete: $BACKUP_DIR.tar.gz"
echo "🌍 Ubuntu: We backup because we protect together!"