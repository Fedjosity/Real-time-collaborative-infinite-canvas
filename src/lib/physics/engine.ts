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

export interface PhysicsEngineOptions {
  onCollisionStart?: (bodyAId: string, bodyBId: string) => void;
}

export interface PhysicsEngineInstance {
  engine: Matter.Engine;
  world: Matter.World;
  bodiesMap: Map<string, Matter.Body>;
  step: (deltaTime?: number) => void;
  syncObjectToBody: (object: CanvasObject, localUserId?: string | null) => Matter.Body;
  removeBody: (objectId: string) => void;
  clear: () => void;
}

/**
 * Initialize a custom Matter.js physics engine instance for a room canvas.
 */
export function createPhysicsEngine(options: PhysicsEngineOptions = {}): PhysicsEngineInstance {
  const engine = Matter.Engine.create({
    gravity: { x: 0, y: 0, scale: 0 },
    enableSleeping: false,
  });

  const world = engine.world;
  const bodiesMap = new Map<string, Matter.Body>();

  if (options.onCollisionStart) {
    Matter.Events.on(engine, 'collisionStart', (event) => {
      for (const pair of event.pairs) {
        if (pair.bodyA.label && pair.bodyB.label && options.onCollisionStart) {
          options.onCollisionStart(pair.bodyA.label, pair.bodyB.label);
        }
      }
    });
  }

  /**
   * Sync a CanvasObject into a Matter.js Body representation in the physics world.
   */
  const syncObjectToBody = (object: CanvasObject, localUserId?: string | null): Matter.Body => {
    let body = bodiesMap.get(object.id);

    // Compute center position for Matter.js (Matter origins are centered)
    const centerX = object.x + object.width / 2;
    const centerY = object.y + object.height / 2;
    const frictionAir = object.physics?.frictionAir ?? 0.02;
    const restitution = object.physics?.restitution ?? 0.6;
    const friction = object.physics?.friction ?? 0.1;
    const isPinned = object.physics?.isStatic ?? false;
    const density = 0.001;

    // A body is actively simulated as dynamic ONLY if this client is the temporary authority
    const isActiveOrDragging = object.physics?.state === 'active' || object.physics?.state === 'dragging';
    const isAuthoritative = isActiveOrDragging && object.physics?.authority === localUserId;
    const isOwnedByOther = isActiveOrDragging && !isAuthoritative;
    
    // Static if explicitly pinned, OR if another client is actively simulating it (so we don't fight their network updates)
    // If it's 'resting', it is dynamic (isStatic = false) so it can receive impulses from collisions/force fields!
    const shouldBeStatic = isPinned || isOwnedByOther;

    if (!body) {
      // Create new rigid body based on shape type
      const shapeType = (object.data as any)?.shapeType || 'rectangle';

      if (object.type === 'shape' && shapeType === 'circle') {
        const radius = Math.max(10, Math.min(object.width, object.height) / 2);
        body = Matter.Bodies.circle(centerX, centerY, radius, {
          label: object.id,
          frictionAir,
          restitution,
          friction,
          density,
          isStatic: shouldBeStatic,
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
            friction,
            density,
            isStatic: shouldBeStatic,
          }
        );
      }

      bodiesMap.set(object.id, body);
      Matter.Composite.add(world, body);
    } else {
      // Ensure dynamic/static state and material properties stay in sync
      if (body.isStatic !== shouldBeStatic) {
        Matter.Body.setStatic(body, shouldBeStatic);
      }
      body.restitution = restitution;
      body.frictionAir = frictionAir;
      body.friction = friction;

      // Update position from Yjs if we do NOT own this body (it is resting or owned by another client)
      // or if it was dragged externally while at rest. If the user is actively dragging it, FORCE update.
      const currentPos = body.position;
      const dx = Math.abs(currentPos.x - centerX);
      const dy = Math.abs(currentPos.y - centerY);
      const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);

      const isDragging = object.physics?.state === 'dragging';

      if (!isAuthoritative || isDragging || (speed < 0.1 && (dx > 2 || dy > 2))) {
        if (dx > 1 || dy > 1 || isDragging) {
          Matter.Body.setPosition(body, { x: centerX, y: centerY });
          // ALWAYS reset velocity when we teleport, otherwise Matter.js calculates
          // a massive spurious velocity from (newPosition - positionPrev)
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
        }
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
