/**
 * =============================================================================
 * Prisma Client Singleton
 * =============================================================================
 *
 * In development, Next.js hot-reloads modules which would create multiple
 * Prisma Client instances, eventually exhausting database connections.
 *
 * This module ensures only ONE PrismaClient instance exists by caching it
 * on the global object (`globalThis`), which persists across hot reloads.
 *
 * Usage:
 *   import { db } from '@/lib/db';
 *   const rooms = await db.room.findMany();
 *
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
 * @module lib/db
 */

import { PrismaClient } from '@prisma/client';

/**
 * Extend globalThis to include our Prisma client cache.
 * This is only used in development to prevent connection exhaustion.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Singleton Prisma Client instance.
 *
 * Configuration:
 * - In development: logs queries and errors for debugging
 * - In production: logs only errors and warnings
 */
export const db: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

// Cache the client on globalThis in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
