#!/bin/bash

# 🔧 Integrate Extracted Code into Azora LMS
# This script integrates extracted code into the azora-lms structure

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

EXTRACT_DIR="extracted-features"
AZORA_LMS_DIR="azora-lms"
INTEGRATION_DIR="$AZORA_LMS_DIR/integrated-features"

echo -e "${BLUE}🔧 Starting code integration...${NC}\n"

# Create integration directory structure
mkdir -p "$INTEGRATION_DIR"/{forums,chat,certifications,course-builder,assessments,auth,graphql}

# Function to integrate feature
integrate_feature() {
    local feature=$1
    local source="$EXTRACT_DIR/$feature"
    local target="$INTEGRATION_DIR/$feature"

    if [ ! -d "$source" ]; then
        echo -e "${YELLOW}  ⚠️  Source not found: $source${NC}"
        return
    fi

    echo -e "${BLUE}📦 Integrating $feature...${NC}"

    # Copy components
    if [ -d "$source/components" ]; then
        mkdir -p "$target/components"
        cp -r "$source/components"/* "$target/components/" 2>/dev/null || true
        echo -e "${GREEN}  ✅ Copied components${NC}"
    fi

    # Copy API routes
    if [ -d "$source/api" ]; then
        mkdir -p "$target/api"
        cp -r "$source/api"/* "$target/api/" 2>/dev/null || true
        echo -e "${GREEN}  ✅ Copied API routes${NC}"
    fi

    # Copy utilities
    if [ -d "$source/utils" ]; then
        mkdir -p "$target/utils"
        cp -r "$source/utils"/* "$target/utils/" 2>/dev/null || true
        echo -e "${GREEN}  ✅ Copied utilities${NC}"
    fi

    # Copy types
    if [ -d "$source/types" ]; then
        mkdir -p "$target/types"
        cp -r "$source/types"/* "$target/types/" 2>/dev/null || true
        echo -e "${GREEN}  ✅ Copied types${NC}"
    fi

    # Copy hooks
    if [ -d "$source/hooks" ]; then
        mkdir -p "$target/hooks"
        cp -r "$source/hooks"/* "$target/hooks/" 2>/dev/null || true
        echo -e "${GREEN}  ✅ Copied hooks${NC}"
    fi

    # Copy config
    if [ -d "$source/config" ]; then
        mkdir -p "$target/config"
        cp -r "$source/config"/* "$target/config/" 2>/dev/null || true
        echo -e "${GREEN}  ✅ Copied config${NC}"
    fi
}

# Integrate each feature
integrate_feature "forums"
integrate_feature "chat"
integrate_feature "certifications"
integrate_feature "course-builder"
integrate_feature "assessments"
integrate_feature "auth"
integrate_feature "graphql"

# Create integration guide
cat > "$INTEGRATION_DIR/INTEGRATION-GUIDE.md" << 'EOF'
# 🔧 Integration Guide

## Overview

This directory contains extracted and integrated code from various open-source learning platforms.

## Structure

```
integrated-features/
├── forums/          # Community forum components
├── chat/            # Live chat/messaging
├── certifications/  # Badge/certification systems
├── course-builder/  # Course creation tools
├── assessments/     # Quiz/assessment builders
├── auth/            # Authentication services
└── graphql/         # GraphQL implementations
```

## Integration Steps

### 1. Review Extracted Code
- Check license compatibility
- Review code quality
- Identify dependencies

### 2. Adapt to Azora Architecture
- Update imports to match your structure
- Replace external APIs with your GraphQL
- Integrate with your auth system
- Apply your design system

### 3. Test Integration
- Unit tests for components
- Integration tests for APIs
- E2E tests for features

### 4. Document
- Add usage examples
- Document API changes
- Update architecture docs

## Next Steps

1. Review each feature directory
2. Adapt code to your stack
3. Integrate with azora-lms core
4. Test thoroughly
5. Deploy incrementally

EOF

echo -e "\n${GREEN}✅ Integration complete!${NC}"
echo -e "${BLUE}📁 Integrated code is in: $INTEGRATION_DIR${NC}\n"

