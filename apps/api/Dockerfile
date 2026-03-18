FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/
COPY packages/utils/package*.json ./packages/utils/
COPY packages/blockchain/package*.json ./packages/blockchain/
RUN npm install --workspaces

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build --workspace=@omniwallet/utils
RUN npm run build --workspace=@omniwallet/blockchain
RUN npm run build --workspace=@omniwallet/api

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/main.js"]
