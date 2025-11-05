#!/bin/bash
# Azora OS Multi-Platform Deployment System
# Deploys Azora OS across all supported platforms

set -e

# Configuration
DEPLOYMENT_ROOT="/workspaces/azora-os"
WEBSITE_DIR="$DEPLOYMENT_ROOT/web"
ANDROID_DIR="$DEPLOYMENT_ROOT/android"
IOS_DIR="$DEPLOYMENT_ROOT/ios"
WINDOWS_DIR="$DEPLOYMENT_ROOT/windows"
LINUX_DIR="$DEPLOYMENT_ROOT/linux"
BUILD_DIR="$DEPLOYMENT_ROOT/build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check dependencies
check_dependencies() {
    log_info "Checking deployment dependencies..."

    # Check Node.js
    if ! command -v node >/dev/null 2>&1; then
        log_error "Node.js is required but not installed"
        exit 1
    fi

    # Check npm
    if ! command -v npm >/dev/null 2>&1; then
        log_error "npm is required but not installed"
        exit 1
    fi

    # Check Java (for Android)
    if ! command -v java >/dev/null 2>&1; then
        log_warning "Java not found - Android builds will be skipped"
    fi

    # Check Python (for various tools)
    if ! command -v python3 >/dev/null 2>&1; then
        log_warning "Python3 not found - some tools may not work"
    fi

    log_success "Dependencies check completed"
}

# Function to deploy website
deploy_website() {
    log_info "Deploying Azora OS Website..."

    cd "$WEBSITE_DIR"

    # Install dependencies
    if [ -f "package.json" ]; then
        npm install
    fi

    # Build website
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        npm run build
    fi

    # Deploy to Vercel (if configured)
    if command -v vercel >/dev/null 2>&1; then
        log_info "Deploying to Vercel..."
        vercel --prod --yes
        log_success "Website deployed to Vercel"
    else
        log_warning "Vercel CLI not found - manual deployment required"
    fi

    cd "$DEPLOYMENT_ROOT"
}

# Function to build Android app
build_android() {
    log_info "Building Azora OS Android App..."

    if [ ! -d "$ANDROID_DIR" ]; then
        log_warning "Android directory not found - skipping Android build"
        return
    fi

    cd "$ANDROID_DIR"

    # Check for Gradle
    if [ -f "gradlew" ]; then
        # Build APK
        ./gradlew assembleRelease

        # Copy APK to build directory
        mkdir -p "$BUILD_DIR/android"
        cp app/build/outputs/apk/release/app-release.apk "$BUILD_DIR/android/azora-os-android.apk"

        log_success "Android APK built: $BUILD_DIR/android/azora-os-android.apk"
    else
        log_warning "Gradle wrapper not found - Android build skipped"
    fi

    cd "$DEPLOYMENT_ROOT"
}

# Function to build iOS app
build_ios() {
    log_info "Building Azora OS iOS App..."

    if [ ! -d "$IOS_DIR" ]; then
        log_warning "iOS directory not found - skipping iOS build"
        return
    fi

    cd "$IOS_DIR"

    # Check for Xcode project
    if [ -f "AzoraOS.xcodeproj" ] || [ -f "AzoraOS.xcworkspace" ]; then
        # Build for iOS
        if command -v xcodebuild >/dev/null 2>&1; then
            xcodebuild -scheme AzoraOS -configuration Release -sdk iphoneos -archivePath "$BUILD_DIR/ios/AzoraOS.xcarchive" archive

            # Export IPA
            xcodebuild -exportArchive -archivePath "$BUILD_DIR/ios/AzoraOS.xcarchive" -exportOptionsPlist exportOptions.plist -exportPath "$BUILD_DIR/ios"

            log_success "iOS IPA built: $BUILD_DIR/ios/AzoraOS.ipa"
        else
            log_warning "Xcode not found - iOS build skipped"
        fi
    else
        log_warning "iOS project not found - iOS build skipped"
    fi

    cd "$DEPLOYMENT_ROOT"
}

# Function to build Windows app
build_windows() {
    log_info "Building Azora OS Windows App..."

    if [ ! -d "$WINDOWS_DIR" ]; then
        log_warning "Windows directory not found - skipping Windows build"
        return
    fi

    cd "$WINDOWS_DIR"

    # Create Windows installer/package
    mkdir -p "$BUILD_DIR/windows"

    # Copy PowerShell modules and scripts
    cp -r *.ps* "$BUILD_DIR/windows/"
    cp -r *.bat "$BUILD_DIR/windows/"

    # Create basic installer script
    cat > "$BUILD_DIR/windows/install.ps1" << 'EOF'
# Azora OS Windows Installer
param(
    [switch]$Install,
    [switch]$Uninstall
)

if ($Install) {
    Write-Host "Installing Azora OS for Windows..."

    # Create installation directory
    $installDir = "$env:ProgramFiles\AzoraOS"
    New-Item -ItemType Directory -Force -Path $installDir

    # Copy files
    Copy-Item -Path ".\*" -Destination $installDir -Recurse -Force

    # Register scheduled task for unity service
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-File '$installDir\ElazarUnityService.ps1'"
    $trigger = New-ScheduledTaskTrigger -AtStartup
    Register-ScheduledTask -TaskName "AzoraOS Unity Service" -Action $action -Trigger $trigger -RunLevel Highest -User "SYSTEM"

    Write-Host "Azora OS installed successfully!"
}

if ($Uninstall) {
    Write-Host "Uninstalling Azora OS..."

    # Stop and remove scheduled task
    Unregister-ScheduledTask -TaskName "AzoraOS Unity Service" -Confirm:$false

    # Remove installation directory
    $installDir = "$env:ProgramFiles\AzoraOS"
    Remove-Item -Path $installDir -Recurse -Force

    Write-Host "Azora OS uninstalled successfully!"
}
EOF

    log_success "Windows package built: $BUILD_DIR/windows/"
    cd "$DEPLOYMENT_ROOT"
}

# Function to build Linux app
build_linux() {
    log_info "Building Azora OS Linux App..."

    if [ ! -d "$LINUX_DIR" ]; then
        log_warning "Linux directory not found - skipping Linux build"
        return
    fi

    cd "$LINUX_DIR"

    # Create Linux package
    mkdir -p "$BUILD_DIR/linux"

    # Copy scripts and services
    cp -r *.sh "$BUILD_DIR/linux/"

    # Create systemd service file
    cat > "$BUILD_DIR/linux/elazar-unity.service" << 'EOF'
[Unit]
Description=Elazar Unity Service for Azora OS
After=network.target

[Service]
Type=simple
User=azora
ExecStart=/usr/local/bin/elazar-unity-service.sh
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    # Create installation script
    cat > "$BUILD_DIR/linux/install.sh" << 'EOF'
#!/bin/bash
# Azora OS Linux Installer

echo "Installing Azora OS for Linux..."

# Create azora user if it doesn't exist
if ! id -u azora >/dev/null 2>&1; then
    useradd -r -s /bin/false azora
fi

# Create installation directory
install_dir="/usr/local/azora-os"
mkdir -p "$install_dir"

# Copy files
cp -r ./* "$install_dir/"

# Install systemd service
cp elazar-unity.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable elazar-unity
systemctl start elazar-unity

echo "Azora OS installed successfully!"
EOF

    chmod +x "$BUILD_DIR/linux/install.sh"

    log_success "Linux package built: $BUILD_DIR/linux/"
    cd "$DEPLOYMENT_ROOT"
}

# Function to create deployment manifest
create_manifest() {
    log_info "Creating deployment manifest..."

    local manifest_file="$BUILD_DIR/deployment_manifest.json"

    cat > "$manifest_file" << EOF
{
    "deployment": {
        "name": "Azora OS Multi-Platform Deployment",
        "version": "$(date +%Y%m%d_%H%M%S)",
        "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
        "platforms": {
            "website": {
                "status": "deployed",
                "location": "Vercel",
                "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
            },
            "android": {
                "status": "$( [ -f "$BUILD_DIR/android/azora-os-android.apk" ] && echo "built" || echo "skipped" )",
                "package": "azora-os-android.apk",
                "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
            },
            "ios": {
                "status": "$( [ -f "$BUILD_DIR/ios/AzoraOS.ipa" ] && echo "built" || echo "skipped" )",
                "package": "AzoraOS.ipa",
                "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
            },
            "windows": {
                "status": "$( [ -d "$BUILD_DIR/windows" ] && echo "built" || echo "skipped" )",
                "package": "windows/",
                "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
            },
            "linux": {
                "status": "$( [ -d "$BUILD_DIR/linux" ] && echo "built" || echo "skipped" )",
                "package": "linux/",
                "build_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
            }
        },
        "build_info": {
            "node_version": "$(node --version)",
            "npm_version": "$(npm --version)",
            "build_host": "$(hostname)",
            "build_user": "$(whoami)"
        }
    }
}
EOF

    log_success "Deployment manifest created: $manifest_file"
}

# Function to deploy all platforms
deploy_all() {
    log_info "Starting multi-platform deployment of Azora OS..."

    # Create build directory
    mkdir -p "$BUILD_DIR"

    # Check dependencies
    check_dependencies

    # Deploy each platform
    deploy_website
    build_android
    build_ios
    build_windows
    build_linux

    # Create manifest
    create_manifest

    log_success "Multi-platform deployment completed!"
    log_info "Build artifacts available in: $BUILD_DIR"
}

# Function to show usage
show_usage() {
    echo "Azora OS Multi-Platform Deployment System"
    echo ""
    echo "Usage: $0 [platform]"
    echo ""
    echo "Platforms:"
    echo "  all       - Deploy to all platforms (default)"
    echo "  website   - Deploy website only"
    echo "  android   - Build Android app only"
    echo "  ios       - Build iOS app only"
    echo "  windows   - Build Windows app only"
    echo "  linux     - Build Linux app only"
    echo ""
    echo "Examples:"
    echo "  $0 all"
    echo "  $0 website"
    echo "  $0 android"
}

# Main execution
main() {
    local platform="${1:-all}"

    case "$platform" in
        "all")
            deploy_all
            ;;
        "website")
            check_dependencies
            mkdir -p "$BUILD_DIR"
            deploy_website
            ;;
        "android")
            check_dependencies
            mkdir -p "$BUILD_DIR"
            build_android
            ;;
        "ios")
            check_dependencies
            mkdir -p "$BUILD_DIR"
            build_ios
            ;;
        "windows")
            check_dependencies
            mkdir -p "$BUILD_DIR"
            build_windows
            ;;
        "linux")
            check_dependencies
            mkdir -p "$BUILD_DIR"
            build_linux
            ;;
        *)
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"