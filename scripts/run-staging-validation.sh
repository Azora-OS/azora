#!/bin/bash
# Tasks 21-25: Staging validation automation script

set -e

echo "==================================="
echo "Azora Staging Validation Pipeline"
echo "==================================="

# Task 21.1: Load Tests
echo ""
echo "Task 21.1: Running load tests..."
k6 run --out json=load-test-results.json tests/performance/load-tests-staging.ts

# Task 21.2: Monitoring Validation
echo ""
echo "Task 21.2: Validating monitoring..."
ts-node tests/performance/monitoring-validation.ts

# Task 21.3: Autoscaling Test
echo ""
echo "Task 21.3: Testing autoscaling..."
ts-node tests/performance/autoscaling-test.ts

# Task 21.4: Disaster Recovery
echo ""
echo "Task 21.4: Testing disaster recovery..."
ts-node tests/performance/disaster-recovery-test.ts

# Task 22: Pre-deployment checks (from next phase)
echo ""
echo "Running pre-deployment validation..."
npm test -- --coverage
npm run lint
npm run typecheck

echo ""
echo "==================================="
echo "✅ All staging validations passed!"
echo "==================================="
