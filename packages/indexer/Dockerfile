FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/indexer/package.json ./packages/indexer/
RUN npm ci

COPY packages/indexer/ ./packages/indexer/
RUN npx --workspace=packages/indexer prisma generate
RUN npm run build:indexer

# Production stage
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4000

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/indexer/dist ./packages/indexer/dist
COPY --from=builder /app/packages/indexer/prisma ./packages/indexer/prisma

EXPOSE 4000

CMD ["node", "packages/indexer/dist/index.js"]
