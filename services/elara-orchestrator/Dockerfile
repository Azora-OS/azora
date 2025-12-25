FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --no-audit --no-fund

# Copy source
COPY index.js .

# Expose port
EXPOSE 4000

# Start orchestrator
CMD ["npm", "start"]
