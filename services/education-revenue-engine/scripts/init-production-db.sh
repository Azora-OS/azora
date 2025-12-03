#!/bin/bash

# Production Database Initialization Script
# This script initializes the production PostgreSQL database with proper configuration,
# runs migrations, and sets up read replicas.

set -e

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-azora_admin}"
POSTGRES_DB="${POSTGRES_DB:-azora_production}"
REPLICA_HOST="${REPLICA_HOST:-postgres-replica}"
REPLICA_PORT="${REPLICA_PORT:-5432}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
  log_info "Checking prerequisites..."
  
  if ! command -v psql &> /dev/null; then
    log_error "psql not found. Please install PostgreSQL client tools."
    exit 1
  fi
  
  if ! command -v pg_dump &> /dev/null; then
    log_error "pg_dump not found. Please install PostgreSQL client tools."
    exit 1
  fi
  
  log_info "Prerequisites check passed."
}

# Test database connection
test_connection() {
  log_info "Testing connection to primary database..."
  
  if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "postgres" -c "SELECT 1" > /dev/null 2>&1; then
    log_info "Connection to primary database successful."
  else
    log_error "Failed to connect to primary database at $POSTGRES_HOST:$POSTGRES_PORT"
    exit 1
  fi
}

# Create production database
create_database() {
  log_info "Creating production database..."
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "postgres" << EOF
SELECT 'CREATE DATABASE $POSTGRES_DB' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$POSTGRES_DB')\gexec
EOF
  
  log_info "Database created or already exists."
}

# Create replication user
create_replication_user() {
  log_info "Creating replication user..."
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'replication_user') THEN
    CREATE USER replication_user WITH REPLICATION ENCRYPTED PASSWORD 'replication_password';
  END IF;
END
\$\$;
EOF
  
  log_info "Replication user created or already exists."
}

# Enable WAL archiving
enable_wal_archiving() {
  log_info "Enabling WAL archiving..."
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 10;
ALTER SYSTEM SET max_replication_slots = 10;
ALTER SYSTEM SET hot_standby = on;
SELECT pg_reload_conf();
EOF
  
  log_info "WAL archiving enabled."
}

# Run Prisma migrations
run_migrations() {
  log_info "Running Prisma migrations..."
  
  if [ -f "package.json" ]; then
    npm run migrate || {
      log_error "Migration failed"
      exit 1
    }
    log_info "Migrations completed successfully."
  else
    log_warn "package.json not found. Skipping Prisma migrations."
  fi
}

# Create backup directory
create_backup_directory() {
  log_info "Creating backup directory..."
  
  BACKUP_DIR="/var/lib/postgresql/backup"
  mkdir -p "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"
  
  log_info "Backup directory created at $BACKUP_DIR"
}

# Create initial backup
create_initial_backup() {
  log_info "Creating initial backup..."
  
  BACKUP_DIR="/var/lib/postgresql/backup"
  BACKUP_FILE="$BACKUP_DIR/initial-backup-$(date +%Y%m%d-%H%M%S).sql.gz"
  
  PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "$BACKUP_FILE"
  
  log_info "Initial backup created at $BACKUP_FILE"
}

# Setup read replica
setup_read_replica() {
  log_info "Setting up read replica..."
  
  # Create base backup
  log_info "Creating base backup for replica..."
  
  PGPASSWORD="$POSTGRES_PASSWORD" pg_basebackup \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U replication_user \
    -D /var/lib/postgresql/replica_data \
    -Fp \
    -Xs \
    -P \
    -R || {
    log_warn "Base backup creation failed. Replica setup may need manual configuration."
  }
  
  log_info "Read replica setup completed."
}

# Create indexes for performance
create_indexes() {
  log_info "Creating indexes for performance..."
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
-- User indexes
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_tier ON "User"(tier);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON "User"("createdAt");

-- Course indexes
CREATE INDEX IF NOT EXISTS idx_course_instructor_id ON "Course"("instructorId");
CREATE INDEX IF NOT EXISTS idx_course_tier ON "Course"(tier);
CREATE INDEX IF NOT EXISTS idx_course_language ON "Course"(language);

-- Enrollment indexes
CREATE INDEX IF NOT EXISTS idx_enrollment_student_id ON "Enrollment"("studentId");
CREATE INDEX IF NOT EXISTS idx_enrollment_course_id ON "Enrollment"("courseId");
CREATE INDEX IF NOT EXISTS idx_enrollment_status ON "Enrollment"(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_start_date ON "Enrollment"("startDate");

-- LearningOutcome indexes
CREATE INDEX IF NOT EXISTS idx_learning_outcome_enrollment_id ON "LearningOutcome"("enrollmentId");
CREATE INDEX IF NOT EXISTS idx_learning_outcome_course_id ON "LearningOutcome"("courseId");
CREATE INDEX IF NOT EXISTS idx_learning_outcome_completed_at ON "LearningOutcome"("completedAt");

-- Payment indexes
CREATE INDEX IF NOT EXISTS idx_payment_student_id ON "Payment"("studentId");
CREATE INDEX IF NOT EXISTS idx_payment_course_id ON "Payment"("courseId");
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"(status);
CREATE INDEX IF NOT EXISTS idx_payment_created_at ON "Payment"("createdAt");

-- ConversionEvent indexes
CREATE INDEX IF NOT EXISTS idx_conversion_event_student_id ON "ConversionEvent"("studentId");
CREATE INDEX IF NOT EXISTS idx_conversion_event_type ON "ConversionEvent"("eventType");
CREATE INDEX IF NOT EXISTS idx_conversion_event_timestamp ON "ConversionEvent"("timestamp");

-- ConversionOffer indexes
CREATE INDEX IF NOT EXISTS idx_conversion_offer_student_id ON "ConversionOffer"("studentId");
CREATE INDEX IF NOT EXISTS idx_conversion_offer_expires_at ON "ConversionOffer"("expiresAt");
EOF
  
  log_info "Indexes created successfully."
}

# Enable pg_stat_statements extension
enable_extensions() {
  log_info "Enabling PostgreSQL extensions..."
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" << EOF
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS uuid-ossp;
EOF
  
  log_info "Extensions enabled."
}

# Verify database setup
verify_setup() {
  log_info "Verifying database setup..."
  
  TABLE_COUNT=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';")
  
  if [ "$TABLE_COUNT" -gt 0 ]; then
    log_info "Database verification successful. Found $TABLE_COUNT tables."
  else
    log_warn "No tables found in database. Migrations may not have run."
  fi
}

# Main execution
main() {
  log_info "Starting production database initialization..."
  
  check_prerequisites
  test_connection
  create_database
  create_replication_user
  enable_wal_archiving
  enable_extensions
  create_indexes
  create_backup_directory
  create_initial_backup
  run_migrations
  verify_setup
  
  log_info "Production database initialization completed successfully!"
  log_info "Next steps:"
  log_info "1. Configure read replicas in your infrastructure"
  log_info "2. Set up automated backups"
  log_info "3. Configure monitoring and alerting"
  log_info "4. Run smoke tests"
}

main "$@"
