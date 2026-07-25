/**
 * =============================================================================
 * Matter.js Physics Engine React Hook
 * =============================================================================
 *
 * Connects the Matter.js physics engine to the React animation frame loop:
 * - Runs physics engine step at 60 FPS when physics is enabled
 * - Synchronizes computed rigid body positions back to Yjs shared objects
 * - Exposes `throwObject(id, velocity)` for flick/drag throw dynamics
 *
 * @module hooks/usePhysics
 */

import { useEffect, useRef, useCallback } from 'react';
import type { CanvasObject, Position } from '@/types/canvas';
import { createPhysicsEngine, type PhysicsEngineInstance } from '@/lib/physics/engine';
import { applyThrowImpulse, applyAttractionForce } from '@/lib/physics/forces';
import { useCanvasStore } from '@/store/canvasStore';

export interface UsePhysicsOptions {
  objects: CanvasObject[];
  onUpdateObject: (id: string, attrs: Partial<CanvasObject>) => void;
}

export function usePhysics({ objects, onUpdateObject }: UsePhysicsOptions) {
  const physicsEngineRef = useRef<PhysicsEngineInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const physicsEnabled = useCanvasStore((state) => state.physicsEnabled);

  // Initialize engine instance
  useEffect(() => {
    const engineInstance = createPhysicsEngine();
    physicsEngineRef.current = engineInstance;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      engineInstance.clear();
    };
  }, []);

  // Main 60 FPS physics loop
  useEffect(() => {
    if (!physicsEnabled || !physicsEngineRef.current) return;

    const instance = physicsEngineRef.current;

    // Sync all objects to bodies in engine
    objects.forEach((obj) => {
      if (obj.physics?.enabled !== false) {
        instance.syncObjectToBody(obj);
      }
    });

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      // 1. Apply global object forces (attraction between objects)
      const bodies = Array.from(instance.bodiesMap.values());
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const bodyA = bodies[i];
          const bodyB = bodies[j];
          if (bodyA && bodyB) {
            applyAttractionForce(bodyA, bodyB, 0.002);
          }
        }
      }

      // 2. Step Matter.js simulation
      instance.step(deltaTime);

      // 3. Sync body positions back to Yjs objects
      instance.bodiesMap.forEach((body, id) => {
        const speed = Math.sqrt(body.velocity.x ** 2 + body.velocity.y ** 2);
        // Only trigger update if body is moving
        if (speed > 0.05) {
          const targetObj = objects.find((o) => o.id === id);
          if (targetObj) {
            const newX = body.position.x - targetObj.width / 2;
            const newY = body.position.y - targetObj.height / 2;
            onUpdateObject(id, { x: newX, y: newY });
          }
        }
      });

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [physicsEnabled, objects, onUpdateObject]);

  /**
   * Apply throw impulse to an object when released on drag.
   */
  const throwObject = useCallback((id: string, velocity: Position) => {
    const instance = physicsEngineRef.current;
    if (!instance) return;

    const body = instance.bodiesMap.get(id);
    if (body) {
      applyThrowImpulse(body, velocity);
    }
  }, []);

  return {
    physicsEngine: physicsEngineRef.current,
    throwObject,
  };
}
