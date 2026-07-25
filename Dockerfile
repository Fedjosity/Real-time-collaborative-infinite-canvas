FROM node:22-alpine AS base

# Install pnpm
RUN npm install -g pnpm@9.15.4

WORKDIR /app

# Copy dependency manifests
COPY package.json pnpm-lock.yaml .npmrc ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Generate Prisma Client and build Next.js application
RUN pnpm prisma generate
RUN pnpm next build

# Production runner stage
FROM node:22-alpine AS runner

RUN npm install -g pnpm@9.15.4

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy built application and dependencies
COPY --from=base /app /app

EXPOSE 3000

CMD ["node", "server.js"]
