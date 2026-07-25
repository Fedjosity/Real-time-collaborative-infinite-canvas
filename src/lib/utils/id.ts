/**
 * =============================================================================
 * ID Generation Utilities
 * =============================================================================
 *
 * Centralized ID generation for all entities in the application.
 * Uses nanoid for URL-safe, collision-resistant unique identifiers.
 *
 * Why nanoid over UUID?
 * - 40% smaller (21 chars vs 36 chars)
 * - URL-safe by default (no encoding needed)
 * - Faster generation
 * - Customizable alphabet and length
 *
 * @module lib/utils/id
 */

import { nanoid } from 'nanoid';

/**
 * Generate a unique ID for canvas objects.
 * 12 characters provides ~3.5 billion IDs before 1% collision probability.
 * Short enough to be readable in debug output.
 *
 * @returns A 12-character URL-safe unique ID
 *
 * @example
 * const textId = generateObjectId(); // "V1StGXR8_Z5j"
 */
export function generateObjectId(): string {
  return nanoid(12);
}

/**
 * Generate a unique room ID.
 * 10 characters — shorter for easy sharing in URLs.
 * ~1 billion IDs before 1% collision probability (sufficient for rooms).
 *
 * @returns A 10-character URL-safe unique ID
 *
 * @example
 * const roomId = generateRoomId(); // "abc123DEfg"
 * // URL: /room/abc123DEfg
 */
export function generateRoomId(): string {
  return nanoid(10);
}

/**
 * Generate a unique device ID for guest authentication.
 * 21 characters (nanoid default) for maximum collision resistance.
 * Stored in localStorage and reused across sessions.
 *
 * @returns A 21-character URL-safe unique ID
 */
export function generateDeviceId(): string {
  return nanoid(21);
}
