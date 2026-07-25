/**
 * =============================================================================
 * Canvas Export & Import Unit Tests
 * =============================================================================
 *
 * Tests for canvas JSON serialization, SVG vector XML generation, and PNG export.
 *
 * @module __tests__/export.test
 */

import { describe, it, expect } from 'vitest';
import { exportCanvasToJson, exportCanvasToSvg, exportCanvasToJpeg, parseCanvasJson } from '@/lib/export/canvasExport';
import type { CanvasObject } from '@/types/canvas';
import { DEFAULT_SHAPE_DATA, DEFAULT_PHYSICS } from '@/types/canvas';

describe('Canvas Export & Import System', () => {
  it('serializes canvas objects into JSON workspace format', () => {
    const mockObjects: CanvasObject[] = [
      {
        id: 'exp-1',
        type: 'shape',
        x: 100,
        y: 100,
        width: 150,
        height: 150,
        rotation: 0,
        data: DEFAULT_SHAPE_DATA,
        physics: DEFAULT_PHYSICS,
        createdBy: 'Bob',
        createdAt: Date.now(),
        zIndex: 1,
        locked: false,
        opacity: 1,
      },
    ];

    const json = exportCanvasToJson(mockObjects, 'room-test');
    expect(typeof json).toBe('string');
    expect(json).toContain('"version": "1.0.0"');
    expect(json).toContain('"roomId": "room-test"');
  });

  it('generates SVG vector XML markup for canvas objects', () => {
    const mockObjects: CanvasObject[] = [
      {
        id: 'exp-svg-1',
        type: 'shape',
        x: 50,
        y: 50,
        width: 100,
        height: 100,
        rotation: 0,
        data: { ...DEFAULT_SHAPE_DATA, fill: '#D4AF37' },
        physics: DEFAULT_PHYSICS,
        createdBy: 'Alice',
        createdAt: Date.now(),
        zIndex: 1,
        locked: false,
        opacity: 1,
      },
    ];

    const svg = exportCanvasToSvg(mockObjects);
    expect(svg).toContain('<svg xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('fill="#D4AF37"');
    expect(svg).toContain('</svg>');
  });

  it('generates JPEG image data Blob for canvas objects', async () => {
    // Mock toBlob for jsdom environment
    HTMLCanvasElement.prototype.toBlob = function (callback, mimeType) {
      if (callback) {
        callback(new Blob(['mock-jpeg'], { type: mimeType || 'image/jpeg' }));
      }
    };

    const mockObjects: CanvasObject[] = [];
    const blob = await exportCanvasToJpeg(mockObjects);
    expect(blob).toBeDefined();
    expect(blob.type).toBe('image/jpeg');
  });

  it('validates and parses uploaded JSON workspace files', () => {
    const json = JSON.stringify({
      version: '1.0.0',
      exportedAt: Date.now(),
      objects: [
        {
          id: 'exp-2',
          type: 'text',
          x: 0,
          y: 0,
          width: 200,
          height: 50,
        },
      ],
    });

    const parsed = parseCanvasJson(json);
    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe('exp-2');
  });

  it('throws error for invalid JSON workspace files', () => {
    expect(() => parseCanvasJson('{"invalid": true}')).toThrow();
  });
});
