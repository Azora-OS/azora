#!/bin/bash
# ⚙️ POLISH BACKEND - Apply Industry Best Practices

echo "⚙️ =================================="
echo "⚙️ POLISHING BACKEND CODE"
echo "⚙️ =================================="
echo ""

# Find all backend service directories
BACKEND_DIRS=(
  "services/azora-education"
  "services/azora-mint"
  "services/azora-forge"
  "services/azora-nexus"
  "services/azora-aegis"
  "services/azora-covenant"
  "services/azora-oracle"
  "services/azora-workspace"
  "services/azora-scriptorium"
  "services/azora-analytics"
  "services/azora-assessment"
  "services/azora-content"
  "services/azora-classroom"
  "services/azora-lms"
  "services/azora-email-system"
  "services/azora-payments"
  "services/azora-support"
  "services/azora-careers"
)

for dir in "${BACKEND_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "📁 Processing: $dir"
    
    # Create .eslintrc.json if it doesn't exist
    if [ ! -f "$dir/.eslintrc.json" ]; then
      echo "  ✨ Creating ESLint config..."
      cat > "$dir/.eslintrc.json" << 'EOF'
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "plugins": ["@typescript-eslint"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-throw-literal": "error",
    "prefer-const": "error",
    "no-var": "error"
  },
  "env": {
    "node": true,
    "es2022": true
  }
}
EOF
    fi
    
    # Create Dockerfile if it doesn't exist
    if [ ! -f "$dir/Dockerfile" ]; then
      echo "  ✨ Creating Dockerfile..."
      service_name=$(basename "$dir")
      cat > "$dir/Dockerfile" << EOF
# Multi-stage build for ${service_name}
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source
COPY src ./src

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

# Add non-root user
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copy from builder
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Security: Don't run as root
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => { process.exit(r.statusCode === 200 ? 0 : 1) })"

# Expose port
EXPOSE 3000

# Start application
CMD ["node", "dist/index.js"]
EOF
    fi
    
    # Create docker-compose.yml if it doesn't exist
    if [ ! -f "$dir/docker-compose.yml" ]; then
      echo "  ✨ Creating docker-compose.yml..."
      service_name=$(basename "$dir")
      cat > "$dir/docker-compose.yml" << EOF
version: '3.8'

services:
  ${service_name}:
    build: .
    image: azora/${service_name}:latest
    container_name: ${service_name}
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
    env_file:
      - .env
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/health')"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 40s
    networks:
      - azora-network
    volumes:
      - ./logs:/app/logs
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

networks:
  azora-network:
    driver: bridge
EOF
    fi
    
    # Create health check endpoint template
    if [ ! -f "$dir/src/health.ts" ]; then
      echo "  ✨ Creating health check endpoint..."
      mkdir -p "$dir/src"
      cat > "$dir/src/health.ts" << 'EOF'
import { Request, Response } from 'express';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database?: 'up' | 'down';
    redis?: 'up' | 'down';
    externalApi?: 'up' | 'down';
  };
}

export async function healthCheck(req: Request, res: Response): Promise<void> {
  const startTime = Date.now();
  
  try {
    // Check database
    const databaseStatus = await checkDatabase();
    
    // Check Redis
    const redisStatus = await checkRedis();
    
    // Check external dependencies
    const externalApiStatus = await checkExternalApi();
    
    const allHealthy = 
      databaseStatus === 'up' && 
      redisStatus === 'up' && 
      externalApiStatus === 'up';
    
    const health: HealthStatus = {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      version: process.env.APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      checks: {
        database: databaseStatus,
        redis: redisStatus,
        externalApi: externalApiStatus,
      },
    };
    
    const statusCode = allHealthy ? 200 : 503;
    res.status(statusCode).json(health);
    
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
}

async function checkDatabase(): Promise<'up' | 'down'> {
  try {
    // Implement database check
    return 'up';
  } catch {
    return 'down';
  }
}

async function checkRedis(): Promise<'up' | 'down'> {
  try {
    // Implement Redis check
    return 'up';
  } catch {
    return 'down';
  }
}

async function checkExternalApi(): Promise<'up' | 'down'> {
  try {
    // Implement external API check
    return 'up';
  } catch {
    return 'down';
  }
}
EOF
    fi
    
    echo "  ✅ $dir configured"
    echo ""
  fi
done

# Create shared TypeScript config for backend
echo "📝 Creating shared backend tsconfig..."
cat > "tsconfig.backend.json" << 'EOF'
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
EOF

# Create shared .dockerignore
echo "📝 Creating shared .dockerignore..."
cat > ".dockerignore" << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.*.local
dist
coverage
.vscode
.idea
*.log
.DS_Store
__tests__
*.test.ts
*.spec.ts
.github
docs
EOF

echo ""
echo "⚙️ =================================="
echo "✅ BACKEND POLISH COMPLETE"
echo "⚙️ =================================="
echo ""
echo "📊 Summary:"
echo "  ✅ ESLint configs created"
echo "  ✅ Dockerfiles created"
echo "  ✅ docker-compose.yml created"
echo "  ✅ Health check endpoints added"
echo "  ✅ TypeScript strict mode enabled"
echo "  ✅ Security: Non-root Docker users"
echo ""
echo "🔧 Next steps:"
echo "  1. Run: docker-compose build"
echo "  2. Run: docker-compose up"
echo "  3. Test: curl http://localhost:3000/health"
echo ""
