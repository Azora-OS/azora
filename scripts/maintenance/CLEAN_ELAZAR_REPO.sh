#!/bin/bash

# Elazar OS Repository Cleanup and Optimization Script
# Removes unnecessary files, optimizes structure, and prepares for distribution

echo "Starting Elazar OS repository cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "azora-mine" ]; then
    print_error "Not in Elazar OS repository root directory"
    exit 1
fi

print_status "Repository cleanup started"

# Remove temporary and build artifacts
print_status "Removing build artifacts and temporary files..."

# Remove node_modules if it exists (will be reinstalled)
if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_status "Removed node_modules"
fi

# Remove various build directories
find . -type d \( -name "build" -o -name "dist" -o -name ".next" -o -name "out" -o -name "target" \) -exec rm -rf {} + 2>/dev/null || true
print_status "Removed build directories"

# Remove cache directories
find . -type d \( -name ".cache" -o -name "cache" -o -name ".parcel-cache" -o -name ".nuxt" \) -exec rm -rf {} + 2>/dev/null || true
print_status "Removed cache directories"

# Remove log files
find . -name "*.log" -type f -delete
find . -name "npm-debug.log*" -type f -delete
find . -name "yarn-error.log*" -type f -delete
print_status "Removed log files"

# Remove OS-specific files
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete
find . -name "desktop.ini" -type f -delete
print_status "Removed OS-specific files"

# Remove IDE-specific files and directories
find . -name ".vscode" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name ".idea" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.swp" -type f -delete
find . -name "*.swo" -type f -delete
find . -name "*~" -type f -delete
print_status "Removed IDE-specific files"

# Remove Android build artifacts
if [ -d "android" ]; then
    rm -rf android/app/build
    rm -rf android/build
    rm -rf android/.gradle
    print_status "Removed Android build artifacts"
fi

# Remove Windows build artifacts
if [ -d "windows" ]; then
    find windows -name "*.exe" -type f -delete
    find windows -name "*.dll" -type f -delete
    find windows -name "*.pdb" -type f -delete
    print_status "Removed Windows build artifacts"
fi

# Clean up C++ build artifacts
find . -name "*.o" -type f -delete
find . -name "*.a" -type f -delete
find . -name "*.so" -type f -delete
find . -name "*.dylib" -type f -delete
find . -name "CMakeCache.txt" -type f -delete
find . -name "CMakeFiles" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "cmake_install.cmake" -type f -delete
find . -name "Makefile" -type f -delete 2>/dev/null || true
print_status "Removed C++ build artifacts"

# Remove Python cache
find . -name "__pycache__" -type d -exec rm -rf {} + 2>/dev/null || true
find . -name "*.pyc" -type f -delete
find . -name "*.pyo" -type f -delete
find . -name ".pytest_cache" -type d -exec rm -rf {} + 2>/dev/null || true
print_status "Removed Python cache files"

# Remove secrets and sensitive data
if [ -d "secrets" ]; then
    print_warning "Removing secrets directory - ensure backups exist"
    rm -rf secrets
fi

# Clean up old backup files
find . -name "*.bak" -type f -delete
find . -name "*.backup" -type f -delete
find . -name "*.orig" -type f -delete
print_status "Removed backup files"

# Remove empty directories
find . -type d -empty -delete 2>/dev/null || true
print_status "Removed empty directories"

# Optimize repository structure
print_status "Optimizing repository structure..."

# Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
__pycache__/
*.pyc
*.pyo

# Build outputs
build/
dist/
out/
target/
*.o
*.a
*.so
*.dylib

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS files
.DS_Store
Thumbs.db
desktop.ini

# Logs
*.log
npm-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.production

# Secrets
secrets/
*.key
*.pem

# Temporary files
*.tmp
*.temp
.cache/
EOF
    print_status "Created .gitignore file"
fi

# Create .gitattributes for better handling of different file types
if [ ! -f ".gitattributes" ]; then
    cat > .gitattributes << 'EOF'
# Auto-detect text files and perform LF normalization
* text=auto

# Declare files that will always have CRLF line endings on checkout
*.sln text eol=crlf

# Denote all files that are truly binary and should not be modified
*.png binary
*.jpg binary
*.jpeg binary
*.gif binary
*.ico binary
*.mov binary
*.mp4 binary
*.mp3 binary
*.flv binary
*.fla binary
*.swf binary
*.gz binary
*.zip binary
*.7z binary
*.ttf binary
*.eot binary
*.woff binary
*.pyc binary
*.pdf binary
EOF
    print_status "Created .gitattributes file"
fi

# Compress large files if any exist
print_status "Checking for large files..."
find . -type f -size +50M -not -path "./.git/*" | while read -r file; do
    print_warning "Large file found: $file"
    # Could implement compression here if needed
done

# Final repository statistics
print_status "Repository cleanup completed"
echo "Final repository statistics:"
echo "Total files: $(find . -type f -not -path "./.git/*" | wc -l)"
echo "Total directories: $(find . -type d -not -path "./.git/*" | wc -l)"
echo "Repository size: $(du -sh . | cut -f1)"

print_status "Elazar OS repository cleanup completed successfully"
print_status "Ready for distribution and deployment"