#!/bin/bash

# Setup Husky pre-commit hooks
# Run this after npm install

echo "🔧 Setting up Husky pre-commit hooks..."

# Initialize Husky
npx husky init

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged
EOF

# Make executable
chmod +x .husky/pre-commit

echo "✅ Husky setup complete!"
echo ""
echo "Pre-commit hook will now:"
echo "  - Run ESLint on staged files"
echo "  - Run Prettier on staged files"
echo "  - Prevent commit if errors found"

