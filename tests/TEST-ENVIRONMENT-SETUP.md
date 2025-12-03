# Test Environment Setup Guide

## Overview

This guide explains how to set up and configure the test environment for Azora OS.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Redis 6+ installed and running
- npm or yarn package manager

## Quick Start

1. **Create Test Database**

```bash
# Connect to PostgreSQL
psql -U postgres

# Create test database
CREATE DATABASE azora_test;

# Create test user (optional)
CREATE USER test_user WITH PASSWORD 'test';
GRANT ALL PRIVILEGES ON DATABASE azora_test TO test_user;
```

2. **Configure Environment**

Copy the `.env.test` file to your project root (it should already exist):

```bash
# The file is already created with default test values
# Modify if your local setup differs
```

3. **Install Dependencies**

```bash
npm install
```

4. **Run Migrations**

```bash
# Set DATABASE_URL to test database
export DATABASE_URL=postgresql://postgres:test@localhost:5432/azora_test

# Run migrations
npx prisma migrate deploy
```

5. **Run Tests**

```bash
# Run all tests
npm test

# Run specific test file
npm test -- tests/integration/auth.test.ts

# Run with coverage
npm test -- --coverage
```

## Environment Variables

### Required Variables

- `DATABASE_URL`: PostgreSQL connection string for test database
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT token generation

### Optional Variables

- `DEBUG_TESTS`: Set to `true` to enable verbose logging
- `TEST_TIMEOUT`: Test timeout in milliseconds (default: 30000)
- `STRIPE_SECRET_KEY`: Stripe test API key (uses mock by default)
- `OPENAI_API_KEY`: OpenAI API key (uses mock by default)

## Test Database Management

### Automatic Cleanup

The test infrastructure automatically:
- Cleans up test data after each test
- Resets database state between tests
- Manages database connections

### Manual Cleanup

If you need to manually reset the test database:

```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS azora_test;"
psql -U postgres -c "CREATE DATABASE azora_test;"

# Run migrations
npx prisma migrate deploy
```

## Redis Configuration

### Test Key Prefixing

All test keys are automatically prefixed with `test:` to avoid conflicts with development data.

### Manual Cleanup

To manually clear test keys:

```bash
redis-cli KEYS "test:*" | xargs redis-cli DEL
```

## Troubleshooting

### Database Connection Errors

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
1. Ensure PostgreSQL is running: `pg_ctl status`
2. Check connection string in `.env.test`
3. Verify database exists: `psql -U postgres -l`

### Redis Connection Errors

**Problem**: `Error: Redis connection refused`

**Solution**:
1. Ensure Redis is running: `redis-cli ping`
2. Check Redis URL in `.env.test`
3. Start Redis: `redis-server`

### Migration Errors

**Problem**: `Migration failed to apply`

**Solution**:
1. Reset database (see Manual Cleanup above)
2. Ensure Prisma schema is up to date
3. Run migrations again

### Test Timeout Errors

**Problem**: Tests timing out

**Solution**:
1. Increase `TEST_TIMEOUT` in `.env.test`
2. Check for hanging database connections
3. Ensure Redis is responding

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in `afterEach` hooks
3. **Mocking**: Use mocks for external services (Stripe, OpenAI, etc.)
4. **Factories**: Use test data factories for consistent test data
5. **Transactions**: Use database transactions for faster test execution

## Running Tests in CI/CD

The test environment is automatically configured in CI/CD pipelines. See `.github/workflows/test.yml` for configuration.

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Prisma Testing Guide](https://www.prisma.io/docs/guides/testing)
- [Redis Testing Best Practices](https://redis.io/topics/testing)
