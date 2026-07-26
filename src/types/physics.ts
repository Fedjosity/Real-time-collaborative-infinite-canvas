/**
 * =============================================================================
 * Physics Type Definitions
 * =============================================================================
 *
 * Types for the Matter.js physics engine integration.
 * Physics runs on the client, with positions synced back to Yjs.
 *
 * Architecture:
 * ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
 * │  User Drag   │ ──▶ │  Yjs State   │ ──▶ │ Matter.js    │
 * │  (Konva)     │     │  (CRDT)      │     │ (Physics)    │
 * └──────────────┘     └──────────────┘     └──────────────┘
 *                             ▲                     │
 *                             └─────────────────────┘
 *                          Sync positions back (throttled)
 *
 * @module types/physics
 */

import type { Position } from './canvas';

// ─── Force Types ────────────────────────────────────────────────────────────

/**
 * Types of forces that can be applied to physics-enabled objects.
 * These go beyond basic Matter.js gravity to create interactive experiences.
 */
export type ForceType =
  | 'throw'      // Impulse from drag-release velocity
  | 'attract'    // Gravitational pull toward a point/object
  | 'repel'      // Push away from a point/object
  | 'wind'       // Constant directional force
  | 'explosion'; // Radial impulse from a point

/**
 * A force to be applied to one or more physics bodies.
 */
export interface Force {
  /** What kind of force */
  type: ForceType;
  /** Where the force originates (world coordinates) */
  origin: Position;
  /** Force direction and magnitude */
  vector: Position;
  /** How strong the force is (multiplier) */
  strength: number;
  /** Maximum distance at which the force has effect (0 = unlimited) */
  radius: number;
  /** Whether this force applies once (impulse) or continuously */
  continuous: boolean;
}

// ─── Physics Body ───────────────────────────────────────────────────────────

/**
 * Mapping between a canvas object and its Matter.js body.
 * We maintain this mapping to sync positions bidirectionally.
 */
export interface PhysicsBodyMapping {
  /** Canvas object ID */
  objectId: string;
  /** Matter.js body reference (runtime only, not serialized) */
  bodyId: number;
  /** Last synced position (for dirty checking) */
  lastSyncedPosition: Position;
  /** Last synced rotation in radians */
  lastSyncedAngle: number;
}

// ─── Physics Engine Config ──────────────────────────────────────────────────

/**
 * Configuration for the physics simulation.
 * Can be adjusted per-room or globally.
 */
export interface PhysicsConfig {
  /** Whether physics simulation is running */
  enabled: boolean;
  /** Gravity vector (default: { x: 0, y: 0 } — zero gravity) */
  gravity: Position;
  /** Time step for physics updates (1/60 = 60fps physics) */
  timeStep: number;
  /** How often to sync physics positions to Yjs (ms) */
  syncInterval: number;
  /** Maximum velocity before clamping (prevents objects from flying off) */
  maxVelocity: number;
  /** Velocity threshold below which objects are put to sleep */
  sleepThreshold: number;
  /** Whether to show collision debug wireframes */
  debugMode: boolean;
}

/** Default physics configuration */
export const DEFAULT_PHYSICS_CONFIG: PhysicsConfig = {
  enabled: false,
  gravity: { x: 0, y: 0 },       // No gravity by default (infinite canvas, not a game)
  timeStep: 1000 / 60,             // 60fps physics
  syncInterval: 50,                // Sync to Yjs every 50ms (20 updates/sec)
  maxVelocity: 50,                 // Prevent extreme velocities
  sleepThreshold: 0.05,            // Sleep when nearly still
  debugMode: false,
};

// ─── Collision Events ───────────────────────────────────────────────────────

/**
 * Collision event data, emitted when two physics bodies collide.
 * Used for visual/audio feedback and game-like interactions.
 */
export interface CollisionEvent {
  /** First object involved in collision */
  objectIdA: string;
  /** Second object involved in collision */
  objectIdB: string;
  /** Point of contact in world coordinates */
  contactPoint: Position;
  /** Collision impact speed (for sound/visual intensity) */
  impactSpeed: number;
  /** Normal vector of the collision surface */
  normal: Position;
}

// ─── Interaction Modes ──────────────────────────────────────────────────────

/**
 * Physics interaction modes available in the toolbar.
 * Each mode changes how mouse/touch interactions affect physics.
 */
export type PhysicsInteractionMode =
  | 'drag'       // Standard drag with physics (object follows cursor with spring)
  | 'throw'      // Drag and release to throw (velocity from gesture)
  | 'attract'    // Click/hold to attract nearby objects
  | 'repel'      // Click/hold to push nearby objects away
  | 'explode';   // Click to create a radial explosion force
