FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY core/organs/event-bus/ ./

EXPOSE 3005

CMD ["node", "index.js"]
