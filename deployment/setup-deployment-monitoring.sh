#!/bin/bash

# Deployment Monitoring Setup Script
# 
# This script sets up comprehensive deployment monitoring including:
# - Prometheus rules for error rate, latency, and resource monitoring
# - Alertmanager configuration for alert routing
# - Grafana dashboards for visualization
# - Alert testing utilities

set -e

echo "=========================================="
echo "Deployment Monitoring Setup"
echo "=========================================="
echo ""

# Configuration
PROMETHEUS_URL="${PROMETHEUS_URL:-http://localhost:9090}"
ALERTMANAGER_URL="${ALERTMANAGER_URL:-http://localhost:9093}"
GRAFANA_URL="${GRAFANA_URL:-http://localhost:3000}"
PROMETHEUS_CONFIG_DIR="${PROMETHEUS_CONFIG_DIR:-./observability}"

echo "Configuration:"
echo "  Prometheus URL: $PROMETHEUS_URL"
echo "  Alertmanager URL: $ALERTMANAGER_URL"
echo "  Grafana URL: $GRAFANA_URL"
echo "  Config Directory: $PROMETHEUS_CONFIG_DIR"
echo ""

# Step 1: Verify Prometheus is running
echo "Step 1: Verifying Prometheus..."
if curl -s "$PROMETHEUS_URL/-/healthy" > /dev/null; then
  echo "✓ Prometheus is running"
else
  echo "✗ Prometheus is not accessible at $PROMETHEUS_URL"
  echo "  Please start Prometheus and try again"
  exit 1
fi
echo ""

# Step 2: Verify Alertmanager is running
echo "Step 2: Verifying Alertmanager..."
if curl -s "$ALERTMANAGER_URL/api/v1/status" > /dev/null; then
  echo "✓ Alertmanager is running"
else
  echo "✗ Alertmanager is not accessible at $ALERTMANAGER_URL"
  echo "  Please start Alertmanager and try again"
  exit 1
fi
echo ""

# Step 3: Verify Grafana is running
echo "Step 3: Verifying Grafana..."
if curl -s "$GRAFANA_URL/api/health" > /dev/null; then
  echo "✓ Grafana is running"
else
  echo "✗ Grafana is not accessible at $GRAFANA_URL"
  echo "  Please start Grafana and try again"
  exit 1
fi
echo ""

# Step 4: Load Prometheus rules
echo "Step 4: Loading Prometheus rules..."
if [ -f "$PROMETHEUS_CONFIG_DIR/deployment-monitoring.yml" ]; then
  echo "✓ Deployment monitoring rules file found"
  
  # Reload Prometheus
  if curl -s -X POST "$PROMETHEUS_URL/-/reload" > /dev/null; then
    echo "✓ Prometheus rules reloaded"
  else
    echo "⚠ Could not reload Prometheus (may require manual restart)"
  fi
else
  echo "✗ Deployment monitoring rules file not found at $PROMETHEUS_CONFIG_DIR/deployment-monitoring.yml"
  exit 1
fi
echo ""

# Step 5: Verify rules are loaded
echo "Step 5: Verifying rules are loaded..."
RULES_RESPONSE=$(curl -s "$PROMETHEUS_URL/api/v1/rules")
if echo "$RULES_RESPONSE" | grep -q "deployment_monitoring"; then
  RULE_COUNT=$(echo "$RULES_RESPONSE" | grep -o '"alert"' | wc -l)
  echo "✓ Deployment monitoring rules loaded ($RULE_COUNT rules)"
else
  echo "⚠ Deployment monitoring rules not yet visible (may take a moment)"
fi
echo ""

# Step 6: Verify Alertmanager configuration
echo "Step 6: Verifying Alertmanager configuration..."
ALERTMANAGER_CONFIG=$(curl -s "$ALERTMANAGER_URL/api/v1/status" | grep -o '"receivers"' || true)
if [ -n "$ALERTMANAGER_CONFIG" ]; then
  echo "✓ Alertmanager is configured"
else
  echo "⚠ Could not verify Alertmanager configuration"
fi
echo ""

# Step 7: Check for Grafana datasource
echo "Step 7: Checking Grafana datasource..."
DATASOURCES=$(curl -s -H "Authorization: Bearer admin" "$GRAFANA_URL/api/datasources" 2>/dev/null || echo "[]")
if echo "$DATASOURCES" | grep -q "Prometheus"; then
  echo "✓ Prometheus datasource configured in Grafana"
else
  echo "⚠ Prometheus datasource not found in Grafana"
  echo "  You may need to add it manually at $GRAFANA_URL/datasources"
fi
echo ""

# Step 8: Import Grafana dashboard
echo "Step 8: Importing Grafana dashboard..."
if [ -f "$PROMETHEUS_CONFIG_DIR/grafana/provisioning/dashboards/deployment-monitoring-dashboard.json" ]; then
  echo "✓ Deployment monitoring dashboard file found"
  echo "  Dashboard will be automatically provisioned on Grafana startup"
else
  echo "⚠ Deployment monitoring dashboard file not found"
fi
echo ""

# Step 9: Test alert rules
echo "Step 9: Testing alert rules..."
echo "  Testing error rate alert..."
ERROR_RATE_QUERY="(sum(rate(http_requests_total{status=~\"5..\"}[5m])) by (job) / sum(rate(http_requests_total[5m])) by (job))"
ERROR_RATE=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$ERROR_RATE_QUERY" | grep -o '"value"' | head -1 || echo "")
if [ -n "$ERROR_RATE" ]; then
  echo "  ✓ Error rate metric available"
else
  echo "  ⚠ Error rate metric not yet available (normal on startup)"
fi

echo "  Testing latency alert..."
LATENCY_QUERY="histogram_quantile(0.95, sum(rate(http_request_duration_ms_bucket[5m])) by (job, le))"
LATENCY=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$LATENCY_QUERY" | grep -o '"value"' | head -1 || echo "")
if [ -n "$LATENCY" ]; then
  echo "  ✓ Latency metric available"
else
  echo "  ⚠ Latency metric not yet available (normal on startup)"
fi

echo "  Testing database metric..."
DB_QUERY="histogram_quantile(0.95, sum(rate(db_query_duration_ms_bucket[5m])) by (le))"
DB_TIME=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$DB_QUERY" | grep -o '"value"' | head -1 || echo "")
if [ -n "$DB_TIME" ]; then
  echo "  ✓ Database metric available"
else
  echo "  ⚠ Database metric not yet available (normal on startup)"
fi

echo "  Testing resource metric..."
MEMORY_QUERY="container_memory_usage_bytes"
MEMORY=$(curl -s "$PROMETHEUS_URL/api/v1/query?query=$MEMORY_QUERY" | grep -o '"value"' | head -1 || echo "")
if [ -n "$MEMORY" ]; then
  echo "  ✓ Resource metric available"
else
  echo "  ⚠ Resource metric not yet available (normal on startup)"
fi
echo ""

# Step 10: Display access information
echo "=========================================="
echo "Setup Complete!"
echo "=========================================="
echo ""
echo "Access your monitoring tools:"
echo "  Prometheus:   $PROMETHEUS_URL"
echo "  Alertmanager: $ALERTMANAGER_URL"
echo "  Grafana:      $GRAFANA_URL"
echo ""
echo "Next steps:"
echo "  1. Open Grafana at $GRAFANA_URL"
echo "  2. Navigate to Dashboards > Deployment Monitoring"
echo "  3. Monitor error rates, latency, and resource usage"
echo "  4. Configure alert notifications in Alertmanager"
echo ""
echo "Documentation:"
echo "  - Deployment Monitoring: docs/DEPLOYMENT-MONITORING-SETUP.md"
echo "  - Alert Rules: observability/deployment-monitoring.yml"
echo "  - Grafana Dashboard: observability/grafana/provisioning/dashboards/deployment-monitoring-dashboard.json"
echo ""
