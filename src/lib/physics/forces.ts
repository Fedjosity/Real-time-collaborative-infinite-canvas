/**
 * =============================================================================
 * Matter.js Interactive Force & Impulse Helpers
 * =============================================================================
 *
 * Implements creative interaction dynamics:
 * - Throw / Flick momentum velocity vectors
 * - Inverse-square gravitational attraction
 * - Magnetic repulsion forces
 * - Vortex / Swirl forces
 *
 * @module lib/physics/forces
 */

import Matter from 'matter-js';
import type { Position } from '@/types/canvas';

/**
 * Apply a throw / flick linear velocity to a physics body on drag release.
 */
export function applyThrowImpulse(body: Matter.Body, velocity: Position, maxSpeed = 30): void {
  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  let finalVx = velocity.x;
  let finalVy = velocity.y;

  // Cap maximum throw velocity
  if (speed > maxSpeed) {
    const factor = maxSpeed / speed;
    finalVx *= factor;
    finalVy *= factor;
  }

  Matter.Body.setVelocity(body, { x: finalVx, y: finalVy });
}

/**
 * Apply gravitational attraction force between two physics bodies.
 * Force magnitude = (G * m1 * m2) / r^2
 */
export function applyAttractionForce(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  G = 0.005,
  minDistance = 30,
  maxDistance = 600
): void {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  if (dist < minDistance || dist > maxDistance) return;

  const forceMagnitude = (G * bodyA.mass * bodyB.mass) / distSq;
  const fx = (dx / dist) * forceMagnitude;
  const fy = (dy / dist) * forceMagnitude;

  Matter.Body.applyForce(bodyA, bodyA.position, { x: fx, y: fy });
  Matter.Body.applyForce(bodyB, bodyB.position, { x: -fx, y: -fy });
}

/**
 * Apply magnetic repulsion force between two physics bodies.
 */
export function applyRepulsionForce(
  bodyA: Matter.Body,
  bodyB: Matter.Body,
  strength = 0.05,
  minDistance = 20,
  maxDistance = 300
): void {
  const dx = bodyB.position.x - bodyA.position.x;
  const dy = bodyB.position.y - bodyA.position.y;
  const distSq = dx * dx + dy * dy;
  const dist = Math.sqrt(distSq);

  if (dist < minDistance || dist > maxDistance) return;

  const forceMagnitude = (strength * bodyA.mass * bodyB.mass) / (distSq + 100);
  const fx = (dx / dist) * forceMagnitude;
  const fy = (dy / dist) * forceMagnitude;

  // Push apart
  Matter.Body.applyForce(bodyA, bodyA.position, { x: -fx, y: -fy });
  Matter.Body.applyForce(bodyB, bodyB.position, { x: fx, y: fy });
}

/**
 * Apply vortex swirl force around a central point.
 */
export function applyVortexForce(
  bodies: Matter.Body[],
  center: Position,
  strength = 0.002
): void {
  bodies.forEach((body) => {
    const dx = body.position.x - center.x;
    const dy = body.position.y - center.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10 || dist > 800) return;

    // Perpendicular tangent vector for rotation
    const tx = -dy / dist;
    const ty = dx / dist;

    const forceMagnitude = strength * body.mass;
    Matter.Body.applyForce(body, body.position, {
      x: tx * forceMagnitude,
      y: ty * forceMagnitude,
    });
  });
}
