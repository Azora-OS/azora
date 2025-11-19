#!/bin/bash

# E2E Test Runner Script
# Provides convenient commands for running E2E tests locally

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}========================================${NC}"
}

print_success() {
  echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
  echo -e "${RED}✗ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if Node.js is installed
check_node() {
  if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
  fi
  print_success "Node.js $(node --version) found"
}

# Check if npm dependencies are installed
check_dependencies() {
  if [ ! -d "node_modules" ]; then
    print_warning "Dependencies not installed, running npm ci..."
    npm ci
  fi
  print_success "Dependencies installed"
}

# Check if Playwright browsers are installed
check_browsers() {
  if [ ! -d "$HOME/.cache/ms-playwright" ]; then
    print_warning "Playwright browsers not installed, installing..."
    npx playwright install --with-deps
  fi
  print_success "Playwright browsers installed"
}

# Check if test environment is ready
check_test_env() {
  print_header "Checking Test Environment"
  
  # Check Node.js
  check_node
  
  # Check dependencies
  check_dependencies
  
  # Check browsers
  check_browsers
  
  print_success "Test environment ready"
}

# Run all E2E tests
run_all_tests() {
  print_header "Running All E2E Tests"
  npx playwright test
}

# Run tests for specific browser
run_browser_tests() {
  local browser=$1
  print_header "Running E2E Tests for $browser"
  npx playwright test --project=$browser
}

# Run tests in headed mode
run_headed_tests() {
  print_header "Running E2E Tests in Headed Mode"
  npx playwright test --headed
}

# Run tests in debug mode
run_debug_tests() {
  print_header "Running E2E Tests in Debug Mode"
  npx playwright test --debug
}

# Run specific test file
run_specific_test() {
  local test_file=$1
  print_header "Running Test: $test_file"
  npx playwright test "$test_file"
}

# Run tests matching pattern
run_pattern_tests() {
  local pattern=$1
  print_header "Running Tests Matching: $pattern"
  npx playwright test -g "$pattern"
}

# Show test report
show_report() {
  print_header "Showing Test Report"
  npx playwright show-report
}

# Show trace
show_trace() {
  local trace_file=$1
  print_header "Showing Trace: $trace_file"
  npx playwright show-trace "$trace_file"
}

# Print usage
print_usage() {
  echo "E2E Test Runner"
  echo ""
  echo "Usage: $0 [command] [options]"
  echo ""
  echo "Commands:"
  echo "  check              Check test environment"
  echo "  all                Run all E2E tests"
  echo "  chromium           Run tests for Chromium"
  echo "  firefox            Run tests for Firefox"
  echo "  webkit             Run tests for WebKit"
  echo "  headed             Run tests in headed mode"
  echo "  debug              Run tests in debug mode"
  echo "  test <file>        Run specific test file"
  echo "  pattern <pattern>  Run tests matching pattern"
  echo "  report             Show test report"
  echo "  trace <file>       Show trace file"
  echo "  help               Show this help message"
  echo ""
  echo "Examples:"
  echo "  $0 check"
  echo "  $0 all"
  echo "  $0 chromium"
  echo "  $0 headed"
  echo "  $0 test tests/e2e/subscription-flow.spec.ts"
  echo "  $0 pattern subscription"
  echo "  $0 report"
}

# Main
main() {
  local command=${1:-help}
  
  case $command in
    check)
      check_test_env
      ;;
    all)
      check_test_env
      run_all_tests
      ;;
    chromium|firefox|webkit)
      check_test_env
      run_browser_tests "$command"
      ;;
    headed)
      check_test_env
      run_headed_tests
      ;;
    debug)
      check_test_env
      run_debug_tests
      ;;
    test)
      if [ -z "$2" ]; then
        print_error "Test file not specified"
        print_usage
        exit 1
      fi
      check_test_env
      run_specific_test "$2"
      ;;
    pattern)
      if [ -z "$2" ]; then
        print_error "Pattern not specified"
        print_usage
        exit 1
      fi
      check_test_env
      run_pattern_tests "$2"
      ;;
    report)
      show_report
      ;;
    trace)
      if [ -z "$2" ]; then
        print_error "Trace file not specified"
        print_usage
        exit 1
      fi
      show_trace "$2"
      ;;
    help|--help|-h)
      print_usage
      ;;
    *)
      print_error "Unknown command: $command"
      print_usage
      exit 1
      ;;
  esac
}

main "$@"
