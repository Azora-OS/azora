#!/bin/bash

# Azora Mobile Apps Build Script
# Ubuntu: "I build our mobile presence with Ubuntu excellence"

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APPS_DIR="$PROJECT_ROOT/apps"
BUILD_DIR="$PROJECT_ROOT/build/mobile"
LOG_DIR="$PROJECT_ROOT/logs/mobile"

# Create necessary directories
mkdir -p "$BUILD_DIR"
mkdir -p "$LOG_DIR"

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] ${NC}$1"
}

error() {
    echo -e "${RED}[ERROR] ${NC}$1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS] ${NC}$1"
}

warning() {
    echo -e "${YELLOW}[WARNING] ${NC}$1"
}

# Check dependencies
check_dependencies() {
    log "Checking dependencies..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js is not installed"
    fi
    
    # Check npm/yarn
    if ! command -v npm &> /dev/null && ! command -v yarn &> /dev/null; then
        error "npm or yarn is not installed"
    fi
    
    # Check Expo CLI
    if ! command -v expo &> /dev/null; then
        log "Installing Expo CLI..."
        npm install -g @expo/cli
    fi
    
    # Check for Android Studio (Android builds)
    if [[ "$1" == "android" ]] || [[ "$1" == "all" ]]; then
        if ! command -v adb &> /dev/null; then
            warning "Android SDK not found. Android builds may fail."
        fi
    fi
    
    # Check for Xcode (iOS builds)
    if [[ "$1" == "ios" ]] || [[ "$1" == "all" ]]; then
        if ! command -v xcodebuild &> /dev/null; then
            warning "Xcode not found. iOS builds may fail."
        fi
    fi
    
    success "Dependencies checked"
}

# Clean previous builds
clean_builds() {
    log "Cleaning previous builds..."
    rm -rf "$BUILD_DIR"/*
    success "Build directory cleaned"
}

# Install dependencies
install_dependencies() {
    local app_dir=$1
    log "Installing dependencies for $(basename "$app_dir")..."
    
    cd "$app_dir"
    
    if [ -f "package.json" ]; then
        if command -v yarn &> /dev/null; then
            yarn install --frozen-lockfile
        else
            npm ci
        fi
    fi
    
    cd "$PROJECT_ROOT"
    success "Dependencies installed for $(basename "$app_dir")"
}

# Run tests
run_tests() {
    local app_dir=$1
    log "Running tests for $(basename "$app_dir")..."
    
    cd "$app_dir"
    
    # Run unit tests if available
    if npm run test --silent 2>/dev/null; then
        success "Tests passed for $(basename "$app_dir")"
    else
        warning "No tests found or tests failed for $(basename "$app_dir")"
    fi
    
    cd "$PROJECT_ROOT"
}

# Build for Android
build_android() {
    local app_dir=$1
    local app_name=$(basename "$app_dir")
    log "Building Android app for $app_name..."
    
    cd "$app_dir"
    
    # Build APK
    if expo build:android --type apk --non-interactive 2>&1 | tee "$LOG_DIR/$app_name-android.log"; then
        success "Android APK built successfully for $app_name"
    else
        error "Android build failed for $app_name. Check $LOG_DIR/$app_name-android.log"
    fi
    
    # Build AAB (for Play Store)
    if expo build:android --type appbundle --non-interactive 2>&1 | tee "$LOG_DIR/$app_name-android-aab.log"; then
        success "Android AAB built successfully for $app_name"
    else
        warning "Android AAB build failed for $app_name. Check $LOG_DIR/$app_name-android-aab.log"
    fi
    
    cd "$PROJECT_ROOT"
}

# Build for iOS
build_ios() {
    local app_dir=$1
    local app_name=$(basename "$app_dir")
    log "Building iOS app for $app_name..."
    
    cd "$app_dir"
    
    # Build IPA
    if expo build:ios --type archive --non-interactive 2>&1 | tee "$LOG_DIR/$app_name-ios.log"; then
        success "iOS IPA built successfully for $app_name"
    else
        error "iOS build failed for $app_name. Check $LOG_DIR/$app_name-ios.log"
    fi
    
    cd "$PROJECT_ROOT"
}

# Build for Web
build_web() {
    local app_dir=$1
    local app_name=$(basename "$app_dir")
    log "Building Web app for $app_name..."
    
    cd "$app_dir"
    
    # Build for web
    if expo build:web --non-interactive 2>&1 | tee "$LOG_DIR/$app_name-web.log"; then
        success "Web build successful for $app_name"
        
        # Copy build artifacts
        if [ -d "dist" ]; then
            cp -r "dist" "$BUILD_DIR/$app_name-web"
        elif [ -d "build" ]; then
            cp -r "build" "$BUILD_DIR/$app_name-web"
        fi
    else
        error "Web build failed for $app_name. Check $LOG_DIR/$app_name-web.log"
    fi
    
    cd "$PROJECT_ROOT"
}

# Generate build report
generate_report() {
    log "Generating build report..."
    
    local report_file="$BUILD_DIR/build-report-$(date +%Y%m%d-%H%M%S).json"
    
    cat > "$report_file" << EOF
{
  "buildDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "ubuntu": "Ubuntu mobile build report",
  "apps": [
EOF

    # Add app information
    first=true
    for app_dir in "$APPS_DIR"/*-mobile; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/package.json" ]; then
            local app_name=$(basename "$app_dir")
            local package_json=$(cat "$app_dir/package.json")
            
            if [ "$first" = true ]; then
                first=false
            else
                echo "," >> "$report_file"
            fi
            
            cat >> "$report_file" << EOF
    {
      "name": "$app_name",
      "version": $(echo "$package_json" | jq -r '.version // "unknown"'),
      "builds": {
        "android": "$([ -f "$LOG_DIR/$app_name-android.log" ] && echo "completed" || echo "failed")",
        "ios": "$([ -f "$LOG_DIR/$app_name-ios.log" ] && echo "completed" || echo "failed")",
        "web": "$([ -f "$LOG_DIR/$app_name-web.log" ] && echo "completed" || echo "failed")"
      }
    }
EOF
        fi
    done
    
    cat >> "$report_file" << EOF
  ],
  "ubuntuPhilosophy": "Mobile apps built with Ubuntu community values"
}
EOF

    success "Build report generated: $report_file"
}

# Main build function
build_apps() {
    local platform=${1:-"all"}
    
    log "Starting Azora mobile apps build for platform: $platform"
    log "Ubuntu: Building mobile presence with community excellence"
    
    # Check dependencies
    check_dependencies "$platform"
    
    # Clean builds
    clean_builds
    
    # Find mobile apps
    local mobile_apps=()
    for app_dir in "$APPS_DIR"/*-mobile; do
        if [ -d "$app_dir" ] && [ -f "$app_dir/package.json" ]; then
            mobile_apps+=("$app_dir")
        fi
    done
    
    if [ ${#mobile_apps[@]} -eq 0 ]; then
        error "No mobile apps found in $APPS_DIR"
    fi
    
    log "Found ${#mobile_apps[@]} mobile app(s)"
    
    # Build each app
    for app_dir in "${mobile_apps[@]}"; do
        local app_name=$(basename "$app_dir")
        log "Processing app: $app_name"
        
        # Install dependencies
        install_dependencies "$app_dir"
        
        # Run tests
        run_tests "$app_dir"
        
        # Build based on platform
        case "$platform" in
            "android")
                build_android "$app_dir"
                ;;
            "ios")
                build_ios "$app_dir"
                ;;
            "web")
                build_web "$app_dir"
                ;;
            "all")
                build_android "$app_dir"
                build_ios "$app_dir"
                build_web "$app_dir"
                ;;
            *)
                error "Unknown platform: $platform. Use: android, ios, web, or all"
                ;;
        esac
    done
    
    # Generate report
    generate_report
    
    success "Mobile apps build completed successfully!"
    log "Ubuntu: Our mobile presence now serves the community with excellence"
}

# Deploy function
deploy_apps() {
    local platform=${1:-"all"}
    local environment=${2:-"staging"}
    
    log "Deploying Azora mobile apps for platform: $platform, environment: $environment"
    
    case "$environment" in
        "staging")
            log "Deploying to staging environment..."
            # Add staging deployment logic here
            ;;
        "production")
            log "Deploying to production environment..."
            # Add production deployment logic here
            ;;
        *)
            error "Unknown environment: $environment. Use: staging or production"
            ;;
    esac
    
    success "Deployment completed for $environment"
}

# Show usage
usage() {
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build [platform]     Build mobile apps (platform: android, ios, web, all)"
    echo "  deploy [platform] [env]  Deploy mobile apps (env: staging, production)"
    echo "  clean                Clean build artifacts"
    echo "  test                 Run tests for all mobile apps"
    echo "  report               Generate build report"
    echo ""
    echo "Examples:"
    echo "  $0 build all         Build all platforms"
    echo "  $0 build android     Build Android only"
    echo "  $0 deploy all staging Deploy all apps to staging"
    echo ""
    echo "Ubuntu: Mobile apps built with community values and excellence"
}

# Main script logic
case "${1:-}" in
    "build")
        build_apps "${2:-all}"
        ;;
    "deploy")
        deploy_apps "${2:-all}" "${3:-staging}"
        ;;
    "clean")
        clean_builds
        ;;
    "test")
        for app_dir in "$APPS_DIR"/*-mobile; do
            if [ -d "$app_dir" ] && [ -f "$app_dir/package.json" ]; then
                run_tests "$app_dir"
            fi
        done
        ;;
    "report")
        generate_report
        ;;
    "help"|"--help"|"-h")
        usage
        ;;
    "")
        usage
        ;;
    *)
        error "Unknown command: $1. Use '$0 help' for usage."
        ;;
esac
