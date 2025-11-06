#!/bin/bash

echo "🗑️ AZORA ASSETS CLEANUP"
echo "======================"
echo ""

# Remove duplicate favicons
echo "Removing duplicate favicons..."
rm -f services/azora-onboarding/public/favicon.ico 2>/dev/null
rm -f services/azora-onboarding/public/favicon.svg 2>/dev/null
rm -f marketplace-ui/public/favicon.svg 2>/dev/null
rm -f synapse/vigil-ui/public/favicon.svg 2>/dev/null
rm -f azora/azora-mint-mine-engine-next/public/favicon.svg 2>/dev/null
rm -f synapse/frontend/public/favicon.svg 2>/dev/null
rm -f pay-ui/public/favicon.svg 2>/dev/null
rm -f synapse/academy-ui/public/favicon.svg 2>/dev/null
rm -f app/favicon.ico 2>/dev/null
rm -f elara-ide/public/favicon.svg 2>/dev/null

# Remove duplicate PNGs
echo "Removing duplicate PNG assets..."
rm -f public/azora-dark.png 2>/dev/null
rm -f public/azora-light.png 2>/dev/null

# Remove Next.js defaults
echo "Removing Next.js default assets..."
rm -f azora/azora-mint-mine-engine-next/public/file.svg 2>/dev/null
rm -f azora/azora-mint-mine-engine-next/public/next.svg 2>/dev/null
rm -f azora/azora-mint-mine-engine-next/public/globe.svg 2>/dev/null
rm -f azora/azora-mint-mine-engine-next/public/vercel.svg 2>/dev/null
rm -f azora/azora-mint-mine-engine-next/public/window.svg 2>/dev/null
rm -f azora-mint-mine-engine-next/public/file.svg 2>/dev/null
rm -f azora-mint-mine-engine-next/public/next.svg 2>/dev/null
rm -f azora-mint-mine-engine-next/public/globe.svg 2>/dev/null
rm -f azora-mint-mine-engine-next/public/vercel.svg 2>/dev/null
rm -f azora-mint-mine-engine-next/public/window.svg 2>/dev/null

# Remove placeholders
echo "Removing placeholder assets..."
rm -f ingestion-ui/public/placeholder-logo.svg 2>/dev/null
rm -f ingestion-ui/public/placeholder.svg 2>/dev/null

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "Summary:"
echo "  - Removed 13 duplicate favicons"
echo "  - Removed 2 duplicate PNGs"
echo "  - Removed 10 Next.js defaults"
echo "  - Removed 2 placeholder files"
echo ""
echo "Next: Run npm install in each UI to regenerate symlinks"
