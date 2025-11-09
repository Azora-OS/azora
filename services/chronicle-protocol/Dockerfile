FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY services/chronicle-protocol/ ./

EXPOSE 4400

CMD ["node", "--loader", "tsx", "index.ts"]
