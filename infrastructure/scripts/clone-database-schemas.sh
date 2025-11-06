#!/bin/bash

# 🗄️ Clone Database Schemas from GitHub Repositories
# This script clones repositories known for excellent database schemas

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

DB_SCHEMA_DIR="database-schemas"
EXTRACT_DIR="extracted-schemas"

echo -e "${BLUE}🗄️  Starting database schema cloning...${NC}\n"

mkdir -p "$DB_SCHEMA_DIR" "$EXTRACT_DIR"

# Function to clone and extract schema
clone_schema() {
    local repo_url=$1
    local repo_name=$2
    local category=$3

    echo -e "${YELLOW}📦 Cloning $repo_name...${NC}"

    local target_dir="$DB_SCHEMA_DIR/$category"
    mkdir -p "$target_dir"

    if [ -d "$target_dir/$repo_name" ]; then
        echo -e "${YELLOW}  ⚠️  Repository already exists, skipping${NC}"
    else
        git clone --depth 1 "$repo_url" "$target_dir/$repo_name" 2>/dev/null || {
            echo -e "${YELLOW}  ⚠️  Failed to clone $repo_name, continuing...${NC}"
            return
        }
    fi

    echo -e "${GREEN}  ✅ Cloned $repo_name${NC}"

    # Extract schema files
    find "$target_dir/$repo_name" -type f \( \
        -name "*.prisma" -o \
        -name "schema.prisma" -o \
        -name "*.sql" -o \
        -name "schema.sql" -o \
        -name "migrations/*.sql" -o \
        -name "**/migrations/**/*.sql" \
    \) -exec cp --parents {} "$EXTRACT_DIR/$category/" \; 2>/dev/null || true
}

# ============================================
# 1. LMS DATABASE SCHEMAS
# ============================================
echo -e "\n${BLUE}📚 LMS Database Schemas${NC}"
clone_schema "https://github.com/moodle/moodle" "moodle" "lms"
clone_schema "https://github.com/openedx/edx-platform" "edx-platform" "lms"
clone_schema "https://github.com/instructure/canvas-lms" "canvas-lms" "lms"
clone_schema "https://github.com/SakaiProject/sakai" "sakai" "lms"
clone_schema "https://github.com/opencraft/opencraft" "opencraft" "lms"

# ============================================
# 2. FORUM DATABASE SCHEMAS
# ============================================
echo -e "\n${BLUE}💬 Forum Database Schemas${NC}"
clone_schema "https://github.com/discourse/discourse" "discourse" "forums"
clone_schema "https://github.com/Flarum/flarum" "flarum" "forums"
clone_schema "https://github.com/NodeBB/NodeBB" "nodebb" "forums"
clone_schema "https://github.com/getfider/fider" "fider" "forums"

# ============================================
# 3. CHAT/MESSAGING SCHEMAS
# ============================================
echo -e "\n${BLUE}💬 Chat Database Schemas${NC}"
clone_schema "https://github.com/RocketChat/Rocket.Chat" "rocketchat" "chat"
clone_schema "https://github.com/mattermost/mattermost-server" "mattermost" "chat"
clone_schema "https://github.com/zulip/zulip" "zulip" "chat"

# ============================================
# 4. CERTIFICATION SCHEMAS
# ============================================
echo -e "\n${BLUE}🏆 Certification Database Schemas${NC}"
clone_schema "https://github.com/mozilla/openbadges" "openbadges" "certifications"
clone_schema "https://github.com/blockcerts/blockcerts" "blockcerts" "certifications"

# ============================================
# 5. AUTHENTICATION SCHEMAS
# ============================================
echo -e "\n${BLUE}🔐 Authentication Database Schemas${NC}"
clone_schema "https://github.com/keycloak/keycloak" "keycloak" "auth"
clone_schema "https://github.com/ory/kratos" "kratos" "auth"
clone_schema "https://github.com/authelia/authelia" "authelia" "auth"

# ============================================
# 6. CMS DATABASE SCHEMAS
# ============================================
echo -e "\n${BLUE}📝 CMS Database Schemas${NC}"
clone_schema "https://github.com/strapi/strapi" "strapi" "cms"
clone_schema "https://github.com/directus/directus" "directus" "cms"
clone_schema "https://github.com/ghost/ghost" "ghost" "cms"
clone_schema "https://github.com/payloadcms/payload" "payload" "cms"

# ============================================
# 7. GRAPHQL SCHEMAS
# ============================================
echo -e "\n${BLUE}🔷 GraphQL Database Schemas${NC}"
clone_schema "https://github.com/hasura/graphql-engine" "hasura" "graphql"
clone_schema "https://github.com/graphile/postgraphile" "postgraphile" "graphql"

echo -e "\n${GREEN}✅ Database schema cloning complete!${NC}"
echo -e "${BLUE}📁 Schemas are in: $DB_SCHEMA_DIR${NC}"
echo -e "${BLUE}📁 Extracted files are in: $EXTRACT_DIR${NC}\n"

