/**
 * =============================================================================
 * Redis Client
 * =============================================================================
 *
 * Redis is used for:
 * 1. Pub/Sub — Broadcasting events across multiple server instances
 *    (horizontal scaling of WebSocket connections)
 * 2. Caching — Room metadata, user sessions, rate limiting
 * 3. Presence — Fast read/write for real-time user status
 *
 * Uses ioredis for its superior TypeScript support, cluster mode,
 * and automatic reconnection handling.
 *
 * Usage:
 *   import { redis, redisPub, redisSub } from '@/lib/redis';
 *
 *   // Simple key-value
 *   await redis.set('room:abc', JSON.stringify(roomData));
 *   const room = await redis.get('room:abc');
 *
 *   // Pub/Sub
 *   await redisSub.subscribe('room-events');
 *   redisSub.on('message', (channel, message) => { ... });
 *   await redisPub.publish('room-events', JSON.stringify(event));
 *
 * @module lib/redis
 */

import Redis, { type RedisOptions } from 'ioredis';

// ─── Configuration ──────────────────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

/**
 * Shared Redis connection options.
 * Applied to all Redis clients for consistency.
 */
const redisOptions: RedisOptions = {
  // Reconnection strategy: exponential backoff with max delay
  retryStrategy(times: number) {
    const delay = Math.min(times * 100, 3000);
    console.log(
      `[Redis] Reconnection attempt ${times}, retrying in ${delay}ms...`
    );
    return delay;
  },

  // Maximum number of reconnection attempts before giving up
  maxRetriesPerRequest: 3,

  // Connection timeout (ms)
  connectTimeout: 10000,

  // Enable offline queue: commands are queued when disconnected
  // and replayed when reconnected
  enableOfflineQueue: true,

  // Lazy connect: don't connect until first command
  lazyConnect: true,
};

// ─── Client Instances ───────────────────────────────────────────────────────

/**
 * Primary Redis client for general key-value operations.
 * Used for caching room data, user sessions, etc.
 */
export const redis = new Redis(REDIS_URL, {
  ...redisOptions,
  // Tag for logging
  connectionName: 'collabcanvas:main',
});

/**
 * Redis client dedicated to PUBLISHING Pub/Sub messages.
 * Separated from the subscriber because Redis clients in subscribe mode
 * cannot execute other commands.
 */
export const redisPub = new Redis(REDIS_URL, {
  ...redisOptions,
  connectionName: 'collabcanvas:pub',
});

/**
 * Redis client dedicated to SUBSCRIBING to Pub/Sub channels.
 * This client enters subscribe mode and can ONLY listen for messages.
 */
export const redisSub = new Redis(REDIS_URL, {
  ...redisOptions,
  connectionName: 'collabcanvas:sub',
});

// ─── Event Handlers ─────────────────────────────────────────────────────────

// Log connection events for debugging
[
  { client: redis, name: 'main' },
  { client: redisPub, name: 'pub' },
  { client: redisSub, name: 'sub' },
].forEach(({ client, name }) => {
  client.on('connect', () => {
    console.log(`[Redis:${name}] ✓ Connected`);
  });

  client.on('error', (err: Error) => {
    console.error(`[Redis:${name}] ✗ Error:`, err.message);
  });

  client.on('close', () => {
    console.log(`[Redis:${name}] Connection closed`);
  });
});

// ─── Redis Key Prefixes ─────────────────────────────────────────────────────

/**
 * Standardized key prefixes for Redis data organization.
 * Using prefixes prevents key collisions and enables pattern-based operations.
 */
export const REDIS_KEYS = {
  /** Room metadata: room:{roomId} */
  room: (roomId: string) => `room:${roomId}`,
  /** Room user count: room:{roomId}:users */
  roomUsers: (roomId: string) => `room:${roomId}:users`,
  /** User session: user:{deviceId} */
  userSession: (deviceId: string) => `user:${deviceId}`,
  /** Rate limit counter: ratelimit:{key} */
  rateLimit: (key: string) => `ratelimit:${key}`,
} as const;

// ─── Pub/Sub Channels ──────────────────────────────────────────────────────

/**
 * Pub/Sub channel names for cross-instance communication.
 */
export const REDIS_CHANNELS = {
  /** Room-level events (user join/leave, room config changes) */
  roomEvents: (roomId: string) => `channel:room:${roomId}`,
  /** Global system events (server shutdown, maintenance) */
  systemEvents: 'channel:system',
} as const;

// ─── Graceful Shutdown Helper ───────────────────────────────────────────────

/**
 * Disconnect all Redis clients gracefully.
 * Call this during server shutdown to release connections.
 */
export async function disconnectRedis(): Promise<void> {
  console.log('[Redis] Disconnecting all clients...');
  await Promise.allSettled([
    redis.quit(),
    redisPub.quit(),
    redisSub.quit(),
  ]);
  console.log('[Redis] All clients disconnected');
}
