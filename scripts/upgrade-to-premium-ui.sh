#!/bin/bash

# 💎 PREMIUM UI UPGRADE SCRIPT
# Chief Architect Approval: Sizwe Ngwenya ✨
# Systematically upgrades all apps to premium UI

echo "💎 Starting Premium UI Upgrade..."
echo "Chief Architect: Sizwe Ngwenya ✨"
echo ""

# Function to upgrade common class patterns
upgrade_classes() {
    local file=$1
    echo "Upgrading: $file"
    
    # Backup original
    cp "$file" "$file.bak"
    
    # Apply premium class upgrades
    sed -i 's/bg-card border border-border rounded-lg/glass-medium border border-border\/50 rounded-2xl shadow-premium-md/g' "$file"
    sed -i 's/bg-white rounded-lg shadow/glass-medium rounded-2xl shadow-premium-md/g' "$file"
    sed -i 's/bg-card border-b border-border/glass-medium border-b border-border\/50 backdrop-blur-xl/g' "$file"
    sed -i 's/bg-card border-r border-border/glass-medium border-r border-border\/50 backdrop-blur-xl/g' "$file"
    sed -i 's/rounded-md/rounded-xl/g' "$file"
    sed -i 's/rounded-lg/rounded-2xl/g' "$file"
    sed -i 's/shadow-md/shadow-premium-md/g' "$file"
    sed -i 's/shadow-lg/shadow-premium-lg/g' "$file"
    sed -i 's/border border-border/border border-border\/50/g' "$file"
    sed -i 's/bg-primary/gradient-premium-sapphire/g' "$file"
    sed -i 's/hover:bg-accent/hover:glass-light hover:shadow-premium-sm/g' "$file"
    
    echo "✅ Upgraded: $file"
}

# Upgrade all JSX/TSX files in apps
echo "Upgrading components..."

find apps -type f \( -name "*.jsx" -o -name "*.tsx" \) -exec bash -c 'upgrade_classes "$0"' {} \;

echo ""
echo "💎 Premium UI Upgrade Complete!"
echo "Chief Architect: Sizwe Ngwenya ✨"
