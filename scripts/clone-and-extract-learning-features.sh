#!/bin/bash

# 🎓 Clone and Extract Learning Platform Features
# This script clones GitHub repositories and extracts useful code for integration

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Base directory for cloned repos
CLONE_DIR="cloned-repos"
EXTRACT_DIR="extracted-features"

echo -e "${BLUE}🚀 Starting repository cloning and code extraction...${NC}\n"

# Create directories
mkdir -p "$CLONE_DIR" "$EXTRACT_DIR"

# Function to clone and extract
clone_and_extract() {
    local repo_url=$1
    local repo_name=$2
    local feature_type=$3
    local target_dir="$CLONE_DIR/$feature_type"

    echo -e "${YELLOW}📦 Cloning $repo_name...${NC}"

    mkdir -p "$target_dir"

    if [ -d "$target_dir/$repo_name" ]; then
        echo -e "${YELLOW}  ⚠️  Repository already exists, skipping clone${NC}"
    else
        git clone --depth 1 "$repo_url" "$target_dir/$repo_name" 2>/dev/null || {
            echo -e "${YELLOW}  ⚠️  Failed to clone $repo_name, continuing...${NC}"
            return
        }
    fi

    echo -e "${GREEN}  ✅ Cloned $repo_name${NC}"
}

# ============================================
# 1. COMMUNITY FORUMS
# ============================================
echo -e "\n${BLUE}📚 Community Forums${NC}"
clone_and_extract "https://github.com/Flarum/flarum" "flarum" "forums"
clone_and_extract "https://github.com/discourse/discourse" "discourse" "forums"
clone_and_extract "https://github.com/getfider/fider" "fider" "forums"
clone_and_extract "https://github.com/NodeBB/NodeBB" "nodebb" "forums"
clone_and_extract "https://github.com/withspectrum/spectrum" "spectrum" "forums"

# ============================================
# 2. LIVE CHAT / REAL-TIME MESSAGING
# ============================================
echo -e "\n${BLUE}💬 Live Chat Systems${NC}"
clone_and_extract "https://github.com/RocketChat/Rocket.Chat" "rocketchat" "chat"
clone_and_extract "https://github.com/mattermost/mattermost-server" "mattermost" "chat"
clone_and_extract "https://github.com/zulip/zulip" "zulip" "chat"
clone_and_extract "https://github.com/Sly777/ran" "ran" "chat"
clone_and_extract "https://github.com/twake/twake" "twake" "chat"

# ============================================
# 3. CERTIFICATION / BADGE SYSTEMS
# ============================================
echo -e "\n${BLUE}🏆 Certification Systems${NC}"
clone_and_extract "https://github.com/mozilla/openbadges" "openbadges" "certifications"
clone_and_extract "https://github.com/IMSGlobal/openbadges-specification" "openbadges-spec" "certifications"
clone_and_extract "https://github.com/blockcerts/blockcerts" "blockcerts" "certifications"
clone_and_extract "https://github.com/credly/credly" "credly" "certifications"

# ============================================
# 4. COURSE CREATION / LMS BUILDERS
# ============================================
echo -e "\n${BLUE}📖 Course Creation Tools${NC}"
clone_and_extract "https://github.com/moodle/moodle" "moodle" "course-builder"
clone_and_extract "https://github.com/openedx/edx-platform" "edx-platform" "course-builder"
clone_and_extract "https://github.com/instructure/canvas-lms" "canvas-lms" "course-builder"
clone_and_extract "https://github.com/Chalk/chalk" "chalk" "course-builder"
clone_and_extract "https://github.com/opencraft/opencraft" "opencraft" "course-builder"

# ============================================
# 5. CONTENT MANAGEMENT
# ============================================
echo -e "\n${BLUE}📝 Content Management${NC}"
clone_and_extract "https://github.com/strapi/strapi" "strapi" "cms"
clone_and_extract "https://github.com/directus/directus" "directus" "cms"
clone_and_extract "https://github.com/ghost/ghost" "ghost" "cms"
clone_and_extract "https://github.com/keystonejs/keystone" "keystone" "cms"
clone_and_extract "https://github.com/payloadcms/payload" "payload" "cms"

# ============================================
# 6. ASSESSMENT / QUIZ BUILDERS
# ============================================
echo -e "\n${BLUE}📋 Assessment Builders${NC}"
clone_and_extract "https://github.com/openedx/edx-platform" "edx-platform" "assessments"
clone_and_extract "https://github.com/moodle/moodle" "moodle" "assessments"
clone_and_extract "https://github.com/quizlet/quizlet" "quizlet" "assessments"
clone_and_extract "https://github.com/opencraft/xblock-sdk" "xblock-sdk" "assessments"
clone_and_extract "https://github.com/edx/edx-platform" "edx-platform-v2" "assessments"

# ============================================
# 7. AUTHENTICATION SERVICES
# ============================================
echo -e "\n${BLUE}🔐 Authentication Services${NC}"
clone_and_extract "https://github.com/keycloak/keycloak" "keycloak" "auth"
clone_and_extract "https://github.com/ory/kratos" "kratos" "auth"
clone_and_extract "https://github.com/authelia/authelia" "authelia" "auth"
clone_and_extract "https://github.com/casbin/casbin" "casbin" "auth"
clone_and_extract "https://github.com/oauthjs/node-oauth2-server" "oauth2-server" "auth"

# ============================================
# 8. LMS SERVICES / BACKEND
# ============================================
echo -e "\n${BLUE}⚙️  LMS Backend Services${NC}"
clone_and_extract "https://github.com/moodle/moodle" "moodle" "lms-backend"
clone_and_extract "https://github.com/openedx/edx-platform" "edx-platform" "lms-backend"
clone_and_extract "https://github.com/instructure/canvas-lms" "canvas-lms" "lms-backend"
clone_and_extract "https://github.com/SakaiProject/sakai" "sakai" "lms-backend"
clone_and_extract "https://github.com/opencraft/opencraft" "opencraft" "lms-backend"

# ============================================
# 9. GRAPHQL BACKENDS
# ============================================
echo -e "\n${BLUE}🔷 GraphQL Backends${NC}"
clone_and_extract "https://github.com/graphql/graphql-js" "graphql-js" "graphql"
clone_and_extract "https://github.com/apollographql/apollo-server" "apollo-server" "graphql"
clone_and_extract "https://github.com/graphile/postgraphile" "postgraphile" "graphql"
clone_and_extract "https://github.com/strongloop/loopback-next" "loopback" "graphql"
clone_and_extract "https://github.com/hasura/graphql-engine" "hasura" "graphql"

echo -e "\n${GREEN}✅ Repository cloning complete!${NC}"
echo -e "${BLUE}📁 Cloned repositories are in: $CLONE_DIR${NC}\n"

# Create extraction summary
cat > "$EXTRACT_DIR/EXTRACTION-SUMMARY.md" << EOF
# 🎓 Learning Platform Feature Extraction

## Cloned Repositories

This directory contains cloned repositories organized by feature type.

## Directory Structure

\`\`\`
cloned-repos/
├── forums/          # Community forum systems
├── chat/            # Live chat/messaging
├── certifications/  # Badge/certification systems
├── course-builder/   # Course creation tools
├── cms/             # Content management
├── assessments/     # Quiz/assessment builders
├── auth/            # Authentication services
├── lms-backend/     # LMS backend services
└── graphql/         # GraphQL implementations
\`\`\`

## Next Steps

1. Review cloned repositories
2. Extract relevant code/components
3. Integrate into azora-lms structure
4. Customize for your platform

## Extraction Guidelines

- Focus on React/TypeScript components for frontend
- Extract API routes and schemas for backend
- Look for reusable utilities and hooks
- Document licensing requirements
- Adapt code to match your architecture

EOF

echo -e "${GREEN}📄 Created extraction summary: $EXTRACT_DIR/EXTRACTION-SUMMARY.md${NC}\n"

