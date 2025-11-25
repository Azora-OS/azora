FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 4200

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4200/api/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "index.js"]
