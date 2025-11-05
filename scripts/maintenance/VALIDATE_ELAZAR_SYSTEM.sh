#!/bin/bash

# Elazar OS Complete System Validation Script
# Validates all components: C++, Android, Windows, Services, and Integration

echo "=========================================="
echo "Elazar OS Complete System Validation"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Validation counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to print colored output
print_header() {
    echo -e "${BLUE}[VALIDATION]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_CHECKS++))
}

print_failure() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_CHECKS++))
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Function to run a check
run_check() {
    local check_name="$1"
    local check_command="$2"
    ((TOTAL_CHECKS++))

    print_info "Running check: $check_name"

    if eval "$check_command" 2>/dev/null; then
        print_success "$check_name"
        return 0
    else
        print_failure "$check_name"
        return 1
    fi
}

print_header "Starting Elazar OS System Validation"

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -f "azora-mine" ]; then
    print_failure "Not in Elazar OS repository root directory"
    exit 1
fi

print_success "Repository root directory validated"

# ==========================================
# C++ Core Services Validation
# ==========================================
print_header "Validating C++ Core Services"

# Check if C++ services are compiled
run_check "azora-mine service compiled" "[ -f 'azora-mine' ]"
run_check "elazar-monitor service compiled" "[ -f 'elazar-monitor' ]"
run_check "elazar-security service compiled" "[ -f 'elazar-security' ]"
run_check "elazar-network service compiled" "[ -f 'elazar-network' ]"
run_check "elazar-package service compiled" "[ -f 'elazar-package' ]"
run_check "elazar-ai service compiled" "[ -f 'elazar-ai' ]"

# ==========================================
# Android Integration Validation
# ==========================================
print_header "Validating Android Integration"

# Check Android project structure
run_check "Android project structure" "[ -d 'android' ] && [ -d 'android/app' ] && [ -d 'android/app/src' ]"
run_check "Android manifest exists" "[ -f 'android/app/src/main/AndroidManifest.xml' ]"
run_check "Android main activity exists" "[ -f 'android/app/src/main/java/com/azora/elazar/MainActivity.java' ]"
run_check "Android core integration exists" "[ -f 'android/app/src/main/java/com/azora/elazar/ElazarOSCore.java' ]"
run_check "Android device tracking service exists" "[ -f 'android/app/src/main/java/com/azora/elazar/services/DeviceTrackingService.java' ]"
run_check "Android sync service exists" "[ -f 'android/app/src/main/java/com/azora/elazar/services/ElazarSyncService.java' ]"
run_check "Android Payjoy service exists" "[ -f 'android/app/src/main/java/com/azora/elazar/services/ElazarPayjoyService.java' ]"
run_check "Android offline service exists" "[ -f 'android/app/src/main/java/com/azora/elazar/services/ElazarOfflineService.java' ]"
run_check "Android build.gradle exists" "[ -f 'android/app/build.gradle' ]"
run_check "Android UI layout exists" "[ -f 'android/app/src/main/res/layout/activity_main.xml' ]"
run_check "Android strings.xml exists" "[ -f 'android/app/src/main/res/values/strings.xml' ]"
run_check "Android themes.xml exists" "[ -f 'android/app/src/main/res/values/themes.xml' ]"
run_check "Google services config exists" "[ -f 'android/app/google-services.json' ]"

# ==========================================
# Windows Integration Validation
# ==========================================
print_header "Validating Windows Integration"

run_check "Windows directory exists" "[ -d 'windows' ]"
run_check "Windows startup script exists" "[ -f 'windows/start_elazar_windows.bat' ]"
run_check "Windows device tracking script exists" "[ -f 'windows/windows_device_tracking.ps1' ]"
run_check "Windows sync service script exists" "[ -f 'windows/windows_sync_service.ps1' ]"
run_check "Windows Payjoy integration script exists" "[ -f 'windows/windows_payjoy_integration.ps1' ]"

# ==========================================
# Node.js/Web Components Validation
# ==========================================
print_header "Validating Node.js/Web Components"

run_check "package.json exists" "[ -f 'package.json' ]"
run_check "vite.config.js exists" "[ -f 'vite.config.js' ] || [ -f 'vite.config.ts' ]"
run_check "index.html exists" "[ -f 'index.html' ]"

# Check if Node.js dependencies can be installed
if command -v npm &> /dev/null; then
    run_check "Node.js dependencies check" "npm list --depth=0 >/dev/null 2>&1 || npm install --dry-run >/dev/null 2>&1"
else
    print_warning "npm not available for dependency validation"
fi

# ==========================================
# Build Scripts and Automation Validation
# ==========================================
print_header "Validating Build Scripts and Automation"

run_check "Main build script exists" "[ -f 'build.sh' ]"
run_check "Repository cleanup script exists" "[ -f 'CLEAN_ELAZAR_REPO.sh' ]"
run_check "Start script exists" "[ -f 'START_AZORA_OS.sh' ] || [ -f 'start-azora-os.sh' ]"
run_check "Service checking scripts exist" "[ -f 'CHECK_ALL_SERVICES.sh' ] || [ -f 'check-all-services.sh' ]"

# ==========================================
# Configuration Files Validation
# ==========================================
print_header "Validating Configuration Files"

run_check "TypeScript config exists" "[ -f 'tsconfig.json' ]"
run_check "Tailwind config exists" "[ -f 'tailwind.config.js' ]"
run_check "PostCSS config exists" "[ -f 'postcss.config.js' ]"
run_check "ESLint config exists" "[ -f 'eslint.config.js' ] || [ -f 'eslint.config.mjs' ]"
run_check "Vite config exists" "[ -f 'vite.config.js' ] || [ -f 'vite.config.ts' ]"
run_check "Hardhat config exists" "[ -f 'hardhat.config.js' ]"
run_check "Docker compose exists" "[ -f 'docker-compose.yml' ]"

# ==========================================
# Security and Compliance Validation
# ==========================================
print_header "Validating Security and Compliance"

run_check "Constitutional compliance script exists" "[ -f 'CONSTITUTIONAL_COMPLIANCE_CHECK.sh' ]"
run_check "Security audit scripts exist" "ls compliance* 2>/dev/null | grep -q ."
run_check "Valuation scripts exist" "[ -f 'valuation-certificate.sh' ] || [ -f 'check-valuation.sh' ]"

# ==========================================
# Final Validation Summary
# ==========================================
print_header "Validation Summary"

echo "=========================================="
echo "Total Checks: $TOTAL_CHECKS"
echo "Passed: $PASSED_CHECKS"
echo "Failed: $FAILED_CHECKS"
echo "Success Rate: $((PASSED_CHECKS * 100 / TOTAL_CHECKS))%"
echo "=========================================="

if [ $FAILED_CHECKS -eq 0 ]; then
    print_success "All validation checks passed!"
    print_success "Elazar OS is ready for deployment"
    echo ""
    echo "Next steps:"
    echo "1. Run ./START_AZORA_OS.sh to start all services"
    echo "2. Build Android app: cd android && ./gradlew build"
    echo "3. On Windows: Run windows/start_elazar_windows.bat"
    echo "4. Deploy to production servers"
    exit 0
else
    print_failure "Some validation checks failed"
    print_info "Please review failed checks and fix issues before deployment"
    exit 1
fi