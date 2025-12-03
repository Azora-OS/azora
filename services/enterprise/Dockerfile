FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY server-simple.js ./server-simple.js
EXPOSE 3023
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
RUN chown -R nextjs:nodejs /app
USER nextjs
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3023/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"
CMD ["node", "server-simple.js"]