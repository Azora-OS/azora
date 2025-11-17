#!/bin/bash

# Load Testing Runner Script
# This script runs the load tests and generates reports
# Requirements: 4.2

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="${BASE_URL:-http://localhost:5175}"
API_BASE_URL="${API_BASE_URL:-http://localhost:4000}"
TEST_TYPE="${1:-concurrent1000}"
OUTPUT_DIR="load-test-results"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Azora OS Load Testing${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if k6 is installed
if ! command -v k6 &> /dev/null; then
    echo -e "${RED}Error: k6 is not installed${NC}"
    echo "Please install k6 from https://k6.io/docs/getting-started/installation/"
    exit 1
fi

echo -e "${GREEN}✓ k6 is installed${NC}"
echo "k6 version: $(k6 version)"
echo ""

# Verify API is running
echo -e "${YELLOW}Checking API connectivity...${NC}"
if ! curl -s "$API_BASE_URL/api/health" > /dev/null 2>&1; then
    echo -e "${RED}Warning: API at $API_BASE_URL is not responding${NC}"
    echo "Make sure the API server is running"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo -e "${GREEN}✓ API is responding${NC}"
fi
echo ""

# Select test type
case $TEST_TYPE in
    concurrent1000)
        TEST_FILE="load-test-1000-concurrent.js"
        TEST_NAME="1000 Concurrent Users Test"
        ;;
    realistic)
        TEST_FILE="load-test-realistic-traffic.js"
        TEST_NAME="Realistic Traffic Patterns Test"
        ;;
    *)
        echo -e "${RED}Unknown test type: $TEST_TYPE${NC}"
        echo "Available options: concurrent1000, realistic"
        exit 1
        ;;
esac

echo -e "${BLUE}Running: $TEST_NAME${NC}"
echo "Test file: $TEST_FILE"
echo "Base URL: $BASE_URL"
echo "API Base URL: $API_BASE_URL"
echo ""

# Run the load test
RESULTS_FILE="$OUTPUT_DIR/results_${TEST_TYPE}_${TIMESTAMP}.json"
SUMMARY_FILE="$OUTPUT_DIR/summary_${TEST_TYPE}_${TIMESTAMP}.txt"

echo -e "${YELLOW}Starting load test...${NC}"
echo ""

# Run k6 with environment variables
k6 run \
    -e BASE_URL="$BASE_URL" \
    -e API_BASE_URL="$API_BASE_URL" \
    --out json="$RESULTS_FILE" \
    "$TEST_FILE" 2>&1 | tee "$SUMMARY_FILE"

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}Load Test Completed Successfully${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Results saved to:"
    echo "  - JSON: $RESULTS_FILE"
    echo "  - Summary: $SUMMARY_FILE"
    echo ""
    
    # Extract key metrics from results
    echo -e "${BLUE}Key Metrics:${NC}"
    if command -v jq &> /dev/null; then
        echo "Analyzing results with jq..."
        # This would require jq to be installed
    else
        echo "Install jq to analyze JSON results: https://stedolan.github.io/jq/"
    fi
else
    echo ""
    echo -e "${RED}========================================${NC}"
    echo -e "${RED}Load Test Failed${NC}"
    echo -e "${RED}========================================${NC}"
    exit 1
fi
