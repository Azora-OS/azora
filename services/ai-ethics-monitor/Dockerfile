# AI Ethics Monitor Service Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for ML libraries
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    sqlite3 \
    && ln -sf python3 /usr/bin/python

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S azora -u 1001

# Create necessary directories and set permissions
RUN mkdir -p /app/logs /app/models && \
    chown -R azora:nodejs /app

# Switch to non-root user
USER azora

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3010/health', (res) => { \
        process.exit(res.statusCode === 200 ? 0 : 1) \
    }).on('error', () => process.exit(1))"

# Expose port
EXPOSE 3010

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3010

# Start the service
CMD ["node", "index.js"]