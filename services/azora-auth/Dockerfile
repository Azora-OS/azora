FROM node:18-alpine

# Ubuntu Philosophy
LABEL ubuntu="I containerize because we deploy together"

WORKDIR /app

# Copy Ubuntu dependencies
COPY package*.json ./
RUN npm install

# Copy Ubuntu application
COPY . .

# Ubuntu security
RUN addgroup -g 1001 -S ubuntu && \
  adduser -S ubuntu -u 1001
USER ubuntu

EXPOSE 3999

# Ubuntu health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

CMD ["node", "server-simple.js"]