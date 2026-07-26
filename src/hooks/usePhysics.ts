/**
 * =============================================================================
 * Matter.js Client-Authority Physics Engine React Hook
 * =============================================================================
 *
 * Connects the Matter.js physics engine to the React animation frame loop:
 * - Implements temporary client authority: only the active interacting client simulates dynamic physics
 * - Throttles Yjs network coordinate broadcasting to 20 Hz (50ms interval)
 * - Releases authority and snaps to rest when velocity drops below threshold
 * - Handles collision cascades (struck resting bodies become active under local authority)
 * - Exposes `throwObject(id, velocity)` for flick/drag throw dynamics
 *
 * @module hooks/usePhysics
 */

import { useEffect, useRef, useCallback } from 'react';
import type { CanvasObject, Position } from '@/types/canvas';
import { createPhysicsEngine, type PhysicsEngineInstance } from '@/lib/physics/engine';
import { applyThrowImpulse, applyAttractionForce, applyRepulsionForce } from '@/lib/physics/forces';
import { useCanvasStore } from '@/store/canvasStore';
import Matter from 'matter-js';

export interface UsePhysicsOptions {
  objects: CanvasObject[];
  onUpdateObject: (id: string, attrs: Partial<CanvasObject>) => void;
  localUserId?: string | null;
}
const DEBUG_PHYSICS = true;

export function usePhysics({ objects, onUpdateObject, localUserId }: UsePhysicsOptions) {
  const physicsEngineRef = useRef<PhysicsEngineInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastBroadcastMapRef = useRef<Map<string, number>>(new Map());

  // Use refs to avoid tearing down the 60 FPS animation loop when props/state change
  const objectsRef = useRef(objects);
  objectsRef.current = objects;
  const onUpdateObjectRef = useRef(onUpdateObject);
  onUpdateObjectRef.current = onUpdateObject;
  const localUserIdRef = useRef(localUserId);
  localUserIdRef.current = localUserId;

  const localOverridesRef = useRef<Map<string, { state: 'active' | 'dragging' | 'resting', authority: string | null | undefined, expireAt: number }>>(new Map());

  const physicsEnabled = useCanvasStore((state) => state.physicsEnabled);

  // Initialize engine instance with collision cascade listener
  useEffect(() => {
    const engineInstance = createPhysicsEngine({
      onCollisionStart: (bodyAId, bodyBId) => {
        const currentObjects = objectsRef.current;
        const currentUserId = localUserIdRef.current;
        if (!currentUserId) return;

        const objA = currentObjects.find((o) => o.id === bodyAId);
        const objB = currentObjects.find((o) => o.id === bodyBId);

        if (!objA || !objB) return;

        // If objA is authoritative and objB is resting/unowned, claim objB via collision cascade!
        const aIsAuthoritative = objA.physics?.state === 'active' && objA.physics?.authority === currentUserId;
        const bIsResting = objB.physics?.state !== 'active' && !objB.physics?.isStatic;

        if (aIsAuthoritative && bIsResting) {
          const bodyB = engineInstance.bodiesMap.get(bodyBId);
          if (bodyB) {
            Matter.Body.setStatic(bodyB, false);
          }
          onUpdateObjectRef.current(bodyBId, {
            physics: {
              ...objB.physics,
              state: 'active',
              authority: currentUserId,
            },
          });
        }

        // Symmetric check: if objB is authoritative and objA is resting/unowned
        const bIsAuthoritative = objB.physics?.state === 'active' && objB.physics?.authority === currentUserId;
        const aIsResting = objA.physics?.state !== 'active' && !objA.physics?.isStatic;

        if (bIsAuthoritative && aIsResting) {
          const bodyA = engineInstance.bodiesMap.get(bodyAId);
          if (bodyA) {
            Matter.Body.setStatic(bodyA, false);
          }
          onUpdateObjectRef.current(bodyAId, {
            physics: {
              ...objA.physics,
              state: 'active',
              authority: currentUserId,
            },
          });
        }
      },
    });

    physicsEngineRef.current = engineInstance;

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      engineInstance.clear();
    };
  }, []);

  // Main 60 FPS physics simulation and throttled sync loop
  useEffect(() => {
    if (!physicsEnabled || !physicsEngineRef.current) return;

    const instance = physicsEngineRef.current;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const deltaTime = Math.min(32, currentTime - lastTime);
      lastTime = currentTime;

      const currentObjects = objectsRef.current;
      const currentUserId = localUserIdRef.current;

      // 1. Sync all objects to bodies in engine
      currentObjects.forEach((obj) => {
        if (obj.physics?.enabled !== false) {
          // Apply local overrides if they exist and haven't expired
          let effectiveObj = obj;
          const override = localOverridesRef.current.get(obj.id);
          if (override) {
            if (Date.now() > override.expireAt) {
              localOverridesRef.current.delete(obj.id);
            } else {
              effectiveObj = {
                ...obj,
                physics: {
                  ...obj.physics,
                  state: override.state,
                  authority: override.authority,
                } as any,
              };
            }
          }
          instance.syncObjectToBody(effectiveObj, currentUserId);
        }
      });

      // 2. Apply active spatial force fields (attract, repel) within 600px range
      currentObjects.forEach((sourceObj) => {
        const forceType = sourceObj.physics?.forceType;
        if (!forceType || forceType === 'none') return;
        const sourceBody = instance.bodiesMap.get(sourceObj.id);
        if (!sourceBody) return;

        currentObjects.forEach((targetObj) => {
          if (targetObj.id === sourceObj.id || targetObj.physics?.isStatic) return;
          const targetBody = instance.bodiesMap.get(targetObj.id);
          if (!targetBody) return;

          if (forceType === 'attract') {
            applyAttractionForce(sourceBody, targetBody, 0.002, 50, 600);
          } else if (forceType === 'repel') {
            applyRepulsionForce(sourceBody, targetBody, 0.005, 50, 500);
          }
        });
      });

      // 3. Step Matter.js simulation
      instance.step(deltaTime);

      // 4. Throttled Yjs synchronization and rest state detection for authoritative bodies
      instance.bodiesMap.forEach((body, id) => {
        let targetObj = currentObjects.find((o) => o.id === id);
        if (!targetObj) return;

        // Apply local overrides for the rest state detection too
        const override = localOverridesRef.current.get(id);
        if (override && Date.now() <= override.expireAt) {
          targetObj = {
            ...targetObj,
            physics: {
              ...targetObj.physics,
              state: override.state,
              authority: override.authority,
            } as any,
          };
        }

        const isActiveOrDragging = targetObj.physics?.state === 'active' || targetObj.physics?.state === 'dragging';
        let isAuthoritative = isActiveOrDragging && targetObj.physics?.authority === currentUserId;

        const speed = Math.sqrt(body.velocity.x * body.velocity.x + body.velocity.y * body.velocity.y);

        // WAKE UP LOGIC: If it's resting but was pushed by a collision or force field, claim authority!
        if (!isAuthoritative && targetObj.physics?.state === 'resting' && speed > 0.05) {
          if (DEBUG_PHYSICS) console.log(`[Physics] Waking up ${id} (speed ${speed.toFixed(2)})`);
          
          localOverridesRef.current.set(id, { state: 'active', authority: currentUserId, expireAt: Date.now() + 2000 });
          
          onUpdateObjectRef.current(id, {
            physics: {
              ...targetObj.physics,
              state: 'active',
              authority: currentUserId,
            },
          });
          isAuthoritative = true;
        }

        if (!isAuthoritative) return;

        const newX = body.position.x - targetObj.width / 2;
        const newY = body.position.y - targetObj.height / 2;
        const newRotation = Math.round(body.angle * (180 / Math.PI));

        // Fallback in case physics engine produces NaN (e.g. from invalid throw impulse)
        if (isNaN(newX) || isNaN(newY) || isNaN(newRotation)) {
          Matter.Body.setPosition(body, { x: targetObj.x + targetObj.width / 2, y: targetObj.y + targetObj.height / 2 });
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          return;
        }

        // If object slows down near rest, snap to stop and release authority
        // (but DO NOT snap it if the user is actively holding/dragging it!)
        if (speed < 0.1 && targetObj.physics?.state !== 'dragging') {
          if (DEBUG_PHYSICS) console.log(`[Physics] Snapping ${id} to rest (speed ${speed.toFixed(2)})`);
          Matter.Body.setVelocity(body, { x: 0, y: 0 });
          Matter.Body.setAngularVelocity(body, 0);
          Matter.Body.setStatic(body, true);
          lastBroadcastMapRef.current.delete(id);
          localOverridesRef.current.delete(id); // Clear local override since it's now resting

          onUpdateObjectRef.current(id, {
            x: newX,
            y: newY,
            rotation: newRotation,
            physics: {
              ...targetObj.physics,
              state: 'resting',
              authority: null,
              velocity: { x: 0, y: 0 },
            },
          });
        } else if (targetObj.physics?.state !== 'dragging') {
          // Throttled network broadcast (20 Hz / every 50ms)
          const lastBroadcast = lastBroadcastMapRef.current.get(id) || 0;
          if (currentTime - lastBroadcast >= 50) {
            lastBroadcastMapRef.current.set(id, currentTime);
            onUpdateObjectRef.current(id, {
              x: newX,
              y: newY,
              rotation: newRotation,
              physics: {
                ...targetObj.physics,
                velocity: { x: body.velocity.x, y: body.velocity.y },
                angularVelocity: body.angularVelocity,
              },
            });
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
  }, [physicsEnabled]);

  /**
   * Apply throw impulse to an object when released on drag and claim authority.
   */
  const throwObject = useCallback((id: string, velocity: { x: number; y: number }, position: { x: number; y: number }) => {
    if (!physicsEnabled || !physicsEngineRef.current) return;
    const body = physicsEngineRef.current.bodiesMap.get(id);
    const targetObj = objectsRef.current.find((o) => o.id === id);
    const currentUserId = localUserIdRef.current;

    if (body && targetObj && currentUserId) {
      if (DEBUG_PHYSICS) console.log(`[Physics] Throwing ${id} with velocity`, velocity);
      
      // Force position to the exact drop coordinates before applying impulse
      // This prevents the physics engine from throwing it from stale coordinates 
      // (since Konva drag move events don't update Yjs in real-time)
      Matter.Body.setPosition(body, {
        x: position.x + targetObj.width / 2,
        y: position.y + targetObj.height / 2,
      });
      Matter.Body.setVelocity(body, { x: 0, y: 0 }); // Reset spurious velocity

      Matter.Body.setStatic(body, false);
      
      // Convert velocity from px/second to px/tick (assuming 60fps)
      const tickVelocity = { x: velocity.x / 60, y: velocity.y / 60 };
      applyThrowImpulse(body, tickVelocity, 60, 1.2);

      localOverridesRef.current.set(id, { state: 'active', authority: currentUserId, expireAt: Date.now() + 2000 });

      onUpdateObjectRef.current(id, {
        physics: {
          ...targetObj.physics,
          state: 'active',
          authority: currentUserId,
        },
      });
    }
  }, []);

  return {
    physicsEngine: physicsEngineRef.current,
    throwObject,
  };
}
