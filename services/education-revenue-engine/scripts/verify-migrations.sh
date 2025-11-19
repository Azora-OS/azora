#!/bin/bash

# Database Migration Verification Script
# Verifies that all Prisma migrations have been applied correctly

set -e

# Configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-azora_admin}"
POSTGRES_DB="${POSTGRES_DB:-azora_production}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

log_debug() {
  echo -e "${BLUE}[DEBUG]${NC} $1"
}

# Check if table exists
table_exists() {
  local table_name="$1"
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name='$table_name');" | grep -q "t"
}

# Check if column exists
column_exists() {
  local table_name="$1"
  local column_name="$2"
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='$table_name' AND column_name='$column_name');" | grep -q "t"
}

# Check if index exists
index_exists() {
  local index_name="$1"
  
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT EXISTS(SELECT 1 FROM pg_indexes WHERE indexname='$index_name');" | grep -q "t"
}

# Verify core tables
verify_core_tables() {
  log_info "Verifying core tables..."
  
  local tables=("User" "Course" "Enrollment" "Module" "Assessment" "LearningOutcome" "Certificate" "ConversionEvent" "ConversionOffer" "Payment" "PricingTier" "CountryPricing")
  local missing_tables=()
  
  for table in "${tables[@]}"; do
    if table_exists "$table"; then
      log_info "✓ Table '$table' exists"
    else
      log_error "✗ Table '$table' missing"
      missing_tables+=("$table")
    fi
  done
  
  if [ ${#missing_tables[@]} -gt 0 ]; then
    log_error "Missing tables: ${missing_tables[*]}"
    return 1
  fi
  
  return 0
}

# Verify table columns
verify_table_columns() {
  log_info "Verifying table columns..."
  
  local errors=0
  
  # User table columns
  local user_columns=("id" "email" "firstName" "lastName" "userType" "tier" "language" "createdAt" "updatedAt")
  for col in "${user_columns[@]}"; do
    if column_exists "User" "$col"; then
      log_debug "✓ User.$col exists"
    else
      log_error "✗ User.$col missing"
      ((errors++))
    fi
  done
  
  # Course table columns
  local course_columns=("id" "title" "description" "instructorId" "tier" "language" "createdAt" "updatedAt")
  for col in "${course_columns[@]}"; do
    if column_exists "Course" "$col"; then
      log_debug "✓ Course.$col exists"
    else
      log_error "✗ Course.$col missing"
      ((errors++))
    fi
  done
  
  # Enrollment table columns
  local enrollment_columns=("id" "studentId" "courseId" "tier" "status" "progress" "startDate" "completionDate")
  for col in "${enrollment_columns[@]}"; do
    if column_exists "Enrollment" "$col"; then
      log_debug "✓ Enrollment.$col exists"
    else
      log_error "✗ Enrollment.$col missing"
      ((errors++))
    fi
  done
  
  # Payment table columns
  local payment_columns=("id" "studentId" "courseId" "amount" "tier" "period" "status" "createdAt")
  for col in "${payment_columns[@]}"; do
    if column_exists "Payment" "$col"; then
      log_debug "✓ Payment.$col exists"
    else
      log_error "✗ Payment.$col missing"
      ((errors++))
    fi
  done
  
  if [ $errors -gt 0 ]; then
    log_error "Found $errors missing columns"
    return 1
  fi
  
  return 0
}

# Verify indexes
verify_indexes() {
  log_info "Verifying indexes..."
  
  local indexes=(
    "idx_user_email"
    "idx_user_tier"
    "idx_course_instructor_id"
    "idx_enrollment_student_id"
    "idx_enrollment_course_id"
    "idx_enrollment_status"
    "idx_payment_student_id"
    "idx_payment_course_id"
    "idx_payment_status"
    "idx_conversion_event_student_id"
  )
  
  local missing_indexes=()
  
  for index in "${indexes[@]}"; do
    if index_exists "$index"; then
      log_debug "✓ Index '$index' exists"
    else
      log_warn "⚠ Index '$index' missing"
      missing_indexes+=("$index")
    fi
  done
  
  if [ ${#missing_indexes[@]} -gt 0 ]; then
    log_warn "Missing indexes: ${missing_indexes[*]}"
    log_warn "Run init-production-db.sh to create missing indexes"
  fi
}

# Verify extensions
verify_extensions() {
  log_info "Verifying PostgreSQL extensions..."
  
  local extensions=("pg_stat_statements" "pg_trgm" "uuid-ossp")
  local missing_extensions=()
  
  for ext in "${extensions[@]}"; do
    if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
      "SELECT EXISTS(SELECT 1 FROM pg_extension WHERE extname='$ext');" | grep -q "t"; then
      log_debug "✓ Extension '$ext' installed"
    else
      log_warn "⚠ Extension '$ext' not installed"
      missing_extensions+=("$ext")
    fi
  done
  
  if [ ${#missing_extensions[@]} -gt 0 ]; then
    log_warn "Missing extensions: ${missing_extensions[*]}"
  fi
}

# Verify data integrity
verify_data_integrity() {
  log_info "Verifying data integrity..."
  
  local errors=0
  
  # Check for orphaned enrollments
  local orphaned_enrollments=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT COUNT(*) FROM \"Enrollment\" e WHERE NOT EXISTS(SELECT 1 FROM \"User\" u WHERE u.id = e.\"studentId\");")
  
  if [ "$orphaned_enrollments" -gt 0 ]; then
    log_error "Found $orphaned_enrollments orphaned enrollments"
    ((errors++))
  else
    log_info "✓ No orphaned enrollments"
  fi
  
  # Check for orphaned payments
  local orphaned_payments=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT COUNT(*) FROM \"Payment\" p WHERE NOT EXISTS(SELECT 1 FROM \"User\" u WHERE u.id = p.\"studentId\");")
  
  if [ "$orphaned_payments" -gt 0 ]; then
    log_error "Found $orphaned_payments orphaned payments"
    ((errors++))
  else
    log_info "✓ No orphaned payments"
  fi
  
  # Check for orphaned learning outcomes
  local orphaned_outcomes=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
    "SELECT COUNT(*) FROM \"LearningOutcome\" lo WHERE NOT EXISTS(SELECT 1 FROM \"Enrollment\" e WHERE e.id = lo.\"enrollmentId\");")
  
  if [ "$orphaned_outcomes" -gt 0 ]; then
    log_error "Found $orphaned_outcomes orphaned learning outcomes"
    ((errors++))
  else
    log_info "✓ No orphaned learning outcomes"
  fi
  
  if [ $errors -gt 0 ]; then
    return 1
  fi
  
  return 0
}

# Get migration status
get_migration_status() {
  log_info "Checking Prisma migration status..."
  
  if [ -f "package.json" ]; then
    npm run migrate:status || {
      log_warn "Could not get migration status"
    }
  else
    log_warn "package.json not found"
  fi
}

# Generate verification report
generate_report() {
  log_info "Generating verification report..."
  
  local report_file="migration-verification-$(date +%Y%m%d-%H%M%S).txt"
  
  {
    echo "Database Migration Verification Report"
    echo "========================================"
    echo "Generated: $(date)"
    echo ""
    echo "Database Information:"
    echo "  Host: $POSTGRES_HOST"
    echo "  Port: $POSTGRES_PORT"
    echo "  Database: $POSTGRES_DB"
    echo ""
    echo "Table Count:"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';" | sed 's/^/  /'
    echo ""
    echo "Database Size:"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
      "SELECT pg_size_pretty(pg_database_size('$POSTGRES_DB'));" | sed 's/^/  /'
    echo ""
    echo "Index Count:"
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" \
      -U "$POSTGRES_USER" -d "$POSTGRES_DB" -t -c \
      "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='public';" | sed 's/^/  /'
  } > "$report_file"
  
  log_info "Report saved to $report_file"
}

# Main execution
main() {
  log_info "Starting database migration verification..."
  
  local all_passed=true
  
  verify_core_tables || all_passed=false
  verify_table_columns || all_passed=false
  verify_indexes
  verify_extensions
  verify_data_integrity || all_passed=false
  get_migration_status
  generate_report
  
  echo ""
  if [ "$all_passed" = true ]; then
    log_info "All critical verifications passed!"
    exit 0
  else
    log_error "Some verifications failed. Please review the errors above."
    exit 1
  fi
}

main "$@"
