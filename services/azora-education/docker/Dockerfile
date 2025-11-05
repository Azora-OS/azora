# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install system dependencies for educational processing
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    curl \
    imagemagick \
    ghostscript \
    poppler-utils \
    libreoffice \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./

# Install dependencies with offline support
RUN npm ci --only=production --prefer-offline || npm ci --only=production

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p logs uploads .offline-cache/npm

# Set proper permissions
RUN chown -R node:node /app
USER node

# Expose port
EXPOSE 4200

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:4200/health || exit 1

# Start the application
CMD ["node", "index.js"]