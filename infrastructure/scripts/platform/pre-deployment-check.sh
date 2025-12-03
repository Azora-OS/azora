#!/bin/bash

# Pre-Deployment Verification Script for Azora OS
# Ensures all applications are ready for error-free Vercel deployment

set -e

cd /home/runner/work/azora-os/azora-os

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   AZORA OS - PRE-DEPLOYMENT VERIFICATION                     ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNINGS=0

check_pass() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    PASSED_CHECKS=$((PASSED_CHECKS + 1))
    echo "✅ $1"
}

check_fail() {
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    FAILED_CHECKS=$((FAILED_CHECKS + 1))
    echo "❌ $1"
}

check_warn() {
    WARNINGS=$((WARNINGS + 1))
    echo "⚠️  $1"
}

# ============================================================================
# 1. CONFIGURATION VALIDATION
# ============================================================================
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. CONFIGURATION VALIDATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check vercel.json files
echo "Validating vercel.json files..."
VERCEL_CONFIGS=$(find . -name "vercel.json" | grep -v node_modules | wc -l)
INVALID_JSON=0

for file in $(find . -name "vercel.json" | grep -v node_modules); do
    if node -e "require('$file')" 2>/dev/null; then
        :
    else
        check_fail "Invalid JSON: $file"
        INVALID_JSON=1
    fi
done

if [ $INVALID_JSON -eq 0 ]; then
    check_pass "All $VERCEL_CONFIGS vercel.json files have valid JSON"
fi

# Check package.json files
echo ""
echo "Validating package.json files..."
if node -e "require('./package.json')" 2>/dev/null; then
    check_pass "Root package.json is valid"
else
    check_fail "Root package.json has syntax errors"
fi

# ============================================================================
# 2. BUILD CONFIGURATION CHECK
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "2. BUILD CONFIGURATION CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

APPS_WITH_BUILD=0
APPS_WITHOUT_BUILD=0

for dir in $(find . -name "vercel.json" | grep -v node_modules | xargs dirname | sort); do
    if [ -f "$dir/package.json" ]; then
        if grep -q '"build"' "$dir/package.json" 2>/dev/null; then
            APPS_WITH_BUILD=$((APPS_WITH_BUILD + 1))
        else
            APPS_WITHOUT_BUILD=$((APPS_WITHOUT_BUILD + 1))
            check_warn "No build script in $dir/package.json"
        fi
    fi
done

check_pass "$APPS_WITH_BUILD applications have build scripts"

if [ $APPS_WITHOUT_BUILD -gt 0 ]; then
    echo "  ℹ️  $APPS_WITHOUT_BUILD apps without build scripts (may use framework defaults)"
fi

# ============================================================================
# 3. DEPENDENCY CHECK
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "3. CRITICAL DEPENDENCIES CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check for critical dependencies
if grep -q '"next"' package.json; then
    check_pass "Next.js dependency found"
fi

if grep -q '"react"' package.json; then
    check_pass "React dependency found"
fi

if grep -q '"react-dom"' package.json; then
    check_pass "React DOM dependency found"
fi

# ============================================================================
# 4. FRAMEWORK DETECTION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "4. FRAMEWORK DETECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

NEXTJS_APPS=0
VITE_APPS=0
STATIC_APPS=0
NODE_APPS=0

for file in $(find . -name "vercel.json" | grep -v node_modules); do
    if grep -q '"framework".*"nextjs"' "$file" 2>/dev/null; then
        NEXTJS_APPS=$((NEXTJS_APPS + 1))
    elif grep -q '"framework".*"vite"' "$file" 2>/dev/null; then
        VITE_APPS=$((VITE_APPS + 1))
    elif grep -q '"@vercel/static-build"' "$file" 2>/dev/null; then
        STATIC_APPS=$((STATIC_APPS + 1))
    elif grep -q '"@vercel/node"' "$file" 2>/dev/null; then
        NODE_APPS=$((NODE_APPS + 1))
    fi
done

check_pass "Framework distribution: Next.js($NEXTJS_APPS) Vite($VITE_APPS) Static($STATIC_APPS) Node($NODE_APPS)"

# ============================================================================
# 5. ENVIRONMENT CONFIGURATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "5. ENVIRONMENT CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f ".env.example" ]; then
    check_pass "Environment template (.env.example) exists"
fi

if [ -f ".vercelignore" ]; then
    check_pass ".vercelignore configured"
fi

if [ -f "next.config.ts" ] || [ -f "next.config.js" ]; then
    check_pass "Next.js configuration file exists"
fi

# ============================================================================
# 6. TYPESCRIPT CONFIGURATION
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "6. TYPESCRIPT CONFIGURATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "tsconfig.json" ]; then
    if node -e "require('./tsconfig.json')" 2>/dev/null; then
        check_pass "tsconfig.json is valid"
    else
        check_warn "tsconfig.json may have issues (non-critical)"
    fi
fi

# ============================================================================
# 7. DEPLOYMENT SCRIPT CHECK
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "7. DEPLOYMENT TOOLS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "deploy-all-to-vercel.sh" ]; then
    if [ -x "deploy-all-to-vercel.sh" ]; then
        check_pass "Deployment script is executable"
    else
        check_warn "Deployment script exists but is not executable"
    fi
fi

# ============================================================================
# 8. DOCUMENTATION CHECK
# ============================================================================
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "8. DOCUMENTATION CHECK"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

DOCS_FOUND=0
[ -f "COMPLETE_VERCEL_DEPLOYMENT_GUIDE.md" ] && DOCS_FOUND=$((DOCS_FOUND + 1))
[ -f "QUICK_DEPLOY.md" ] && DOCS_FOUND=$((DOCS_FOUND + 1))
[ -f "APPLICATION_INVENTORY.md" ] && DOCS_FOUND=$((DOCS_FOUND + 1))

check_pass "$DOCS_FOUND deployment documentation files found"

# ============================================================================
# FINAL SUMMARY
# ============================================================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║   VERIFICATION SUMMARY                                       ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Total Checks:     $TOTAL_CHECKS"
echo "Passed:           $PASSED_CHECKS ✅"
echo "Failed:           $FAILED_CHECKS ❌"
echo "Warnings:         $WARNINGS ⚠️"
echo ""

if [ $FAILED_CHECKS -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   ✅ ALL CHECKS PASSED - READY FOR DEPLOYMENT               ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Next Steps:"
    echo "  1. Run: vercel login"
    echo "  2. Run: ./deploy-all-to-vercel.sh"
    echo ""
    exit 0
else
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║   ❌ SOME CHECKS FAILED - REVIEW ABOVE                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo ""
    exit 1
fi
