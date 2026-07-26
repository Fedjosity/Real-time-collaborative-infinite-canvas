/**
 * =============================================================================
 * Matter.js Interactive Force & Impulse Helpers
 * =============================================================================
 *
 * Implements creative interaction dynamics:
 * Helper functions to apply game-like forces to objects:
 * - Throw impulses
 * - Gravitational attraction
 * - Repulsion fields
 *
 * @module lib/physics/forces
 */

import Matter from 'matter-js';
import type { Position } from '@/types/canvas';

/**
 * Apply a throw / flick linear velocity to a physics body on drag release.
 */
export function applyThrowImpulse(body: Matter.Body, velocity: Position, maxSpeed = 60, multiplier = 1.2): void {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y) * multiplier;
  let finalVx = velocity.x * multiplier;
  let finalVy = velocity.y * multiplier;

  // Cap maximum throw velocity
  if (speed > maxSpeed) {
    const factor = maxSpeed / speed;
    finalVx *= factor;
    finalVy *= factor;
  }

  Matter.Body.setVelocity(body, { x: finalVx, y: finalVy });
}

export function applyAttractionForce(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  strength = 0.001,
  minDistance = 30,
  maxDistance = 600
): void {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < minDistance || dist > maxDistance) return;

  // Linear falloff: stronger when closer, fades to 0 at maxDistance
  const falloff = 1 - (dist / maxDistance);
  const forceMagnitude = strength * bodyB.mass * falloff;
  
  const fx = (dx / dist) * forceMagnitude;
  const fy = (dy / dist) * forceMagnitude;

  Matter.Body.applyForce(bodyB, bodyB.position, { x: -fx, y: -fy });
}

export function applyRepulsionForce(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  strength = 0.002,
  minDistance = 20,
  maxDistance = 400
): void {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < minDistance || dist > maxDistance) return;

  // Linear falloff
  const falloff = 1 - (dist / maxDistance);
  const forceMagnitude = strength * bodyB.mass * falloff;
  
  const fx = (dx / dist) * forceMagnitude;
  const fy = (dy / dist) * forceMagnitude;

  // Push apart
  Matter.Body.applyForce(bodyB, bodyB.position, { x: fx, y: fy });
}
