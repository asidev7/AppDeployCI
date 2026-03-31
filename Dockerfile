FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

FROM node:20-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY public ./public
COPY src ./src
EXPOSE 3000
ENV PORT=3000
ENV DATA_FILE=/data/items.json
CMD ["node", "src/server.js"]

