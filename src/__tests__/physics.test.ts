/**
 * =============================================================================
 * Matter.js Physics Engine Unit Tests
 * =============================================================================
 *
 * Tests for physics engine creation, rigid body syncing, step execution,
 * and force calculations.
 *
 * @module __tests__/physics.test
 */

import { describe, it, expect } from 'vitest';
import Matter from 'matter-js';
import { createPhysicsEngine } from '@/lib/physics/engine';
import { applyThrowImpulse, applyAttractionForce } from '@/lib/physics/forces';
import type { CanvasObject } from '@/types/canvas';
import { DEFAULT_PHYSICS, DEFAULT_SHAPE_DATA } from '@/types/canvas';

describe('Matter.js Physics Engine', () => {
  it('initializes physics engine with zero gravity', () => {
    const { engine, world } = createPhysicsEngine();
    expect(engine).toBeDefined();
    expect(world.gravity.x).toBe(0);
    expect(world.gravity.y).toBe(0);
  });

  it('syncs CanvasObjects into rigid bodies', () => {
    const { syncObjectToBody, bodiesMap } = createPhysicsEngine();

    const mockObject: CanvasObject = {
      id: 'phys-1',
      type: 'shape',
      x: 100,
      y: 100,
      width: 200,
      height: 200,
      rotation: 0,
      data: DEFAULT_SHAPE_DATA,
      physics: DEFAULT_PHYSICS,
      createdBy: 'Tester',
      createdAt: Date.now(),
      zIndex: 1,
      locked: false,
      opacity: 1,
    };

    const body = syncObjectToBody(mockObject);

    expect(body).toBeDefined();
    expect(bodiesMap.has('phys-1')).toBe(true);
    // Position origin in Matter.js is centered: x + width/2 = 200, y + height/2 = 200
    expect(body.position.x).toBe(200);
    expect(body.position.y).toBe(200);
  });

  it('applies throw impulse velocity vectors', () => {
    const { syncObjectToBody } = createPhysicsEngine();

    const mockObject: CanvasObject = {
      id: 'phys-2',
      type: 'shape',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      rotation: 0,
      data: DEFAULT_SHAPE_DATA,
      physics: DEFAULT_PHYSICS,
      createdBy: 'Tester',
      createdAt: Date.now(),
      zIndex: 1,
      locked: false,
      opacity: 1,
    };

    const body = syncObjectToBody(mockObject);
    applyThrowImpulse(body, { x: 15, y: -10 });

    expect(body.velocity.x).toBe(18);
    expect(body.velocity.y).toBe(-12);
  });

  it('calculates gravitational attraction force between bodies', () => {
    const bodyA = Matter.Bodies.rectangle(0, 0, 50, 50);
    const bodyB = Matter.Bodies.rectangle(100, 0, 50, 50);

    applyAttractionForce(bodyA, bodyB, 0.05);

    // BodyA should be pulled towards BodyB (+x direction)
    // BodyB should be pulled towards BodyA (-x direction)
    expect(bodyA.force.x).toBeGreaterThan(0);
    expect(bodyB.force.x).toBeLessThan(0);
  });
});
