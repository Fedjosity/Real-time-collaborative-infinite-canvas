/**
 * =============================================================================
 * Matter.js 2D Physics Engine Setup
 * =============================================================================
 *
 * Configures Matter.js rigid body simulation for the infinite 2D canvas:
 * - Top-down zero gravity space (gravity.y = 0, gravity.x = 0)
 * - Map canvas objects to Matter.js rigid bodies (Rectangles, Circles, Polygons)
 * - Synchronizes simulation steps at 60 FPS
 *
 * @module lib/physics/engine
 */

import Matter from 'matter-js';
import type { CanvasObject } from '@/types/canvas';

export interface PhysicsEngineInstance {
  engine: Matter.Engine;
  world: Matter.World;
  bodiesMap: Map<string, Matter.Body>;
  step: (deltaTime?: number) => void;
  syncObjectToBody: (object: CanvasObject) => Matter.Body;
  removeBody: (objectId: string) => void;
  clear: () => void;
}

/**
 * Initialize a custom Matter.js physics engine instance for a room canvas.
 */
export function createPhysicsEngine(): PhysicsEngineInstance {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 0, scale: 0 },
    enableSleeping: true,
  });

  const world = engine.world;
  const bodiesMap = new Map<string, Matter.Body>();

  /**
   * Sync a CanvasObject into a Matter.js Body representation in the physics world.
   */
  const syncObjectToBody = (object: CanvasObject): Matter.Body => {
    let body = bodiesMap.get(object.id);

    // Compute center position for Matter.js (Matter origins are centered)
    const centerX = object.x + object.width / 2;
    const centerY = object.y + object.height / 2;

    if (!body) {
      // Create new rigid body based on shape type
      const shapeType = (object.data as any)?.shapeType || 'rectangle';
      const frictionAir = object.physics?.friction ?? 0.05;
      const restitution = object.physics?.restitution ?? 0.8;
      const density = 0.001;

      if (object.type === 'shape' && shapeType === 'circle') {
        const radius = Math.max(10, Math.min(object.width, object.height) / 2);
        body = Matter.Bodies.circle(centerX, centerY, radius, {
          label: object.id,
          frictionAir,
          restitution,
          density,
        });
      } else {
        body = Matter.Bodies.rectangle(
          centerX,
          centerY,
          Math.max(20, object.width),
          Math.max(20, object.height),
          {
            label: object.id,
            frictionAir,
            restitution,
            density,
          }
        );
      }

      bodiesMap.set(object.id, body);
      Matter.Composite.add(world, body);
    } else {
      // Update position if body was moved externally
      const currentPos = body.position;
      const dx = Math.abs(currentPos.x - centerX);
      const dy = Math.abs(currentPos.y - centerY);

      // Only update body position if offset is significant
      if (dx > 2 || dy > 2) {
        Matter.Body.setPosition(body, { x: centerX, y: centerY });
      }
    }

    return body;
  };

  /**
   * Remove a body from the physics simulation.
   */
  const removeBody = (objectId: string) => {
    const body = bodiesMap.get(objectId);
    if (body) {
      Matter.Composite.remove(world, body);
      bodiesMap.delete(objectId);
    }
  };

  /**
   * Step the physics engine forward by deltaTime (default 16.66ms for 60 FPS).
   */
  const step = (deltaTime = 1000 / 60) => {
    Matter.Engine.update(engine, deltaTime);
  };

  /**
   * Clear all bodies from the physics world.
   */
  const clear = () => {
    Matter.Composite.clear(world, false);
    bodiesMap.clear();
  };

  return {
    engine,
    world,
    bodiesMap,
    step,
    syncObjectToBody,
    removeBody,
    clear,
  };
}
