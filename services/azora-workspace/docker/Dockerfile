# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY . .

# Production stage
FROM node:18-alpine AS production

# Install system dependencies for email processing
RUN apk add --no-cache \
    curl \
    imagemagick \
    graphicsmagick \
    poppler-utils \
    tesseract-ocr

# Create app directory
WORKDIR /app

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S azora -u 1001

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder /app .

# Create necessary directories
RUN mkdir -p logs uploads && chown -R azora:nodejs /app
USER azora

# Environment variables
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4100/health || exit 1

# Expose port
EXPOSE 4100

# Start the application
CMD ["npm", "start"]