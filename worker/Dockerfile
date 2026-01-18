FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY tsconfig.json ./
COPY src ./src
RUN npm install typescript --save-dev && npm run build && rm -rf node_modules && npm ci --only=production
CMD ["node", "dist/index.js"]
