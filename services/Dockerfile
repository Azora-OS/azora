# Dockerfile for Education Services

FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY services/*/package*.json ./services/

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose ports
EXPOSE 4202 4203 4204 4205 4206 4207 4208

# Start services
CMD ["npm", "start"]
