# Syntax for Dockerfile
FROM node:22-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy package manifests and prisma schema
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma/

# Install all dependencies
RUN pnpm install --frozen-lockfile

# Copy application source code
COPY . .

# Generate Prisma client & build Next.js application
RUN pnpm build

# Production image
FROM node:22-alpine AS runner

RUN npm install -g pnpm@9.15.4

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built app and dependencies from builder stage
COPY --from=base /app /app

EXPOSE 3000

# Start custom Node.js server (serves Next.js + Yjs WebSockets)
CMD ["node", "server.js"]
