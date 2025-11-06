#!/bin/bash
################################################################################
# AZORA REPO CLEANUP SCRIPT
# 
# Moves all scattered documentation to organized folders
# Creates a premium, professional repository structure
################################################################################

set -e

echo "🎨 Starting Azora Repository Cleanup..."
echo ""

# Create archive if doesn't exist
mkdir -p .archive/old-docs

# Move education-related docs to archive
echo "📚 Archiving education docs..."
mv ACADEMY-*.md .archive/old-docs/ 2>/dev/null || true
mv EDUCATION-*.md .archive/old-docs/ 2>/dev/null || true
mv SAPIENS-*.md .archive/old-docs/ 2>/dev/null || true
mv AZORA-EDUCATION-*.md .archive/old-docs/ 2>/dev/null || true
mv AZORA-LMS-*.md .archive/old-docs/ 2>/dev/null || true

# Move UI/cleanup docs to archive
echo "🎨 Archiving UI docs..."
mv ALL-UI-*.md .archive/old-docs/ 2>/dev/null || true
mv UI-*.md .archive/old-docs/ 2>/dev/null || true
mv CLEANUP-*.md .archive/old-docs/ 2>/dev/null || true
mv AZORA-UI-*.md .archive/old-docs/ 2>/dev/null || true

# Move integration/feature docs to archive
echo "🔗 Archiving integration docs..."
mv FEATURE-*.md .archive/old-docs/ 2>/dev/null || true
mv DATABASE-INTEGRATION-*.md .archive/old-docs/ 2>/dev/null || true
mv MARKETPLACE-*.md .archive/old-docs/ 2>/dev/null || true

# Move status/summary docs to archive
echo "📊 Archiving status docs..."
mv *-STATUS*.md .archive/old-docs/ 2>/dev/null || true
mv *-SUMMARY*.md .archive/old-docs/ 2>/dev/null || true
mv *-COMPLETE*.md .archive/old-docs/ 2>/dev/null || true
mv CURRENT-STATUS.md .archive/old-docs/ 2>/dev/null || true
mv ELARA_STATUS.md .archive/old-docs/ 2>/dev/null || true

# Move deployment docs to docs/deployment
echo "🚀 Organizing deployment docs..."
mv DEPLOYMENT*.md docs/deployment/ 2>/dev/null || true
mv VERCEL*.md docs/deployment/ 2>/dev/null || true

# Move mint/business docs
echo "💰 Organizing business docs..."
mv MINT-*.md docs/business/ 2>/dev/null || true
mv DAVID_VS_GOLIATH_STRATEGY.md docs/business/ 2>/dev/null || true

# Move architecture docs
echo "🏗️ Organizing architecture docs..."
mv AZORA-SUPREME-ORGANISM*.md docs/architecture/ 2>/dev/null || true
mv AZORA-COMPLETE-*.md docs/architecture/ 2>/dev/null || true
mv AZORA-INSTITUTIONAL-*.md docs/architecture/ 2>/dev/null || true

# Move old README variants to archive
echo "📄 Archiving old README variants..."
mv README-*.md .archive/old-docs/ 2>/dev/null || true
mv update.md .archive/old-docs/ 2>/dev/null || true

# Move branding/assets docs
echo "🎨 Organizing branding docs..."
mv BRANDING-*.md docs/operations/ 2>/dev/null || true
mv ASSETS-*.md docs/operations/ 2>/dev/null || true

# Move misc docs
echo "📋 Organizing remaining docs..."
mv CONTINUOUS-*.md docs/operations/ 2>/dev/null || true
mv LAUNCH-*.md docs/operations/ 2>/dev/null || true
mv FINAL-*.md docs/reports/ 2>/dev/null || true
mv THANK-YOU.md docs/reports/ 2>/dev/null || true
mv REPO-RESTRUCTURE-PLAN.md docs/reports/ 2>/dev/null || true

# Move security docs
mv SECURITY.md docs/operations/ 2>/dev/null || true

# Count remaining files
REMAINING=$(find . -maxdepth 1 -name "*.md" -not -name "README.md" -not -name "CONTRIBUTING.md" -not -name "CHANGELOG.md" | wc -l)

echo ""
echo "✅ Cleanup Complete!"
echo ""
echo "📊 Results:"
echo "   Root .md files remaining: $REMAINING"
echo "   (Should be: README.md, CONTRIBUTING.md, CHANGELOG.md only)"
echo ""
echo "📁 New Structure:"
echo "   ├── docs/architecture/    (System design)"
echo "   ├── docs/business/        (Business plans)"
echo "   ├── docs/deployment/      (Deploy guides)"
echo "   ├── docs/development/     (Dev guides)"
echo "   ├── docs/operations/      (Ops guides)"
echo "   ├── docs/reports/         (Status reports)"
echo "   └── .archive/old-docs/    (Old files)"
echo ""
echo "🎉 Repository is now premium-grade!"
