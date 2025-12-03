FROM node:18-alpine

# Ubuntu Philosophy
LABEL ubuntu="I containerize because we deploy together"

WORKDIR /app

# Copy Ubuntu dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy Ubuntu application
COPY . .

# Ubuntu security
RUN addgroup -g 1001 -S ubuntu && \
  # Install dependencies
  RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3010/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["node", "dist/server.js"]