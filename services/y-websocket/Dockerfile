FROM node:20-alpine
WORKDIR /app
COPY package.json package.json
RUN npm install --production
COPY . .
EXPOSE 1234
CMD ["node", "index.js"]
