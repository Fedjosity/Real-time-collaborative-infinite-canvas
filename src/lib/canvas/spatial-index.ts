/**
 * =============================================================================
 * Spatial Indexing (rbush R-Tree)
 * =============================================================================
 *
 * Implements high-performance spatial indexing using rbush (R-Tree).
 * Enables fast logarithmic-time $O(\log N)$ queries to find which objects
 * intersect the current screen viewport.
 *
 * Performance Impact:
 * - Without spatial index: O(N) array filter on every pan/zoom frame (slow at 500+ objects)
 * - With rbush R-tree: O(log N) bounding box lookup (smooth 60fps at 10,000+ objects)
 *
 * @module lib/canvas/spatial-index
 */

import RBush from 'rbush';
import type { CanvasObject, BoundingBox } from '@/types/canvas';
import { createBoundingBox } from '@/lib/utils/math';

export interface SpatialItem extends BoundingBox {
  id: string;
  object: CanvasObject;
}

export class CanvasSpatialIndex {
  private tree: RBush<SpatialItem>;

  constructor() {
    this.tree = new RBush<SpatialItem>(16); // Max 16 entries per node
  }

  /**
   * Convert a CanvasObject into a SpatialItem for rbush indexing.
   */
  private objectToSpatialItem(obj: CanvasObject): SpatialItem {
    const box = createBoundingBox(obj.x, obj.y, obj.width, obj.height);
    return {
      ...box,
      id: obj.id,
      object: obj,
    };
  }

  /**
   * Rebuild the entire spatial index from a list of CanvasObjects.
   * Useful when Yjs sync fires a bulk update.
   */
  public rebuild(objects: CanvasObject[]): void {
    this.tree.clear();
    const items = objects.map((obj) => this.objectToSpatialItem(obj));
    this.tree.load(items);
  }

  /**
   * Insert a single canvas object into the spatial index.
   */
  public insert(obj: CanvasObject): void {
    this.tree.insert(this.objectToSpatialItem(obj));
  }

  /**
   * Remove a single canvas object by ID.
   */
  public remove(obj: CanvasObject): void {
    const item = this.objectToSpatialItem(obj);
    this.tree.remove(item, (a: SpatialItem, b: SpatialItem) => a.id === b.id);
  }

  /**
   * Search for all canvas objects intersecting the given bounding box (e.g. viewport).
   *
   * @param bounds - Target bounding box { minX, minY, maxX, maxY }
   * @returns Array of visible CanvasObject entities
   */
  public search(bounds: BoundingBox): CanvasObject[] {
    const results = this.tree.search(bounds);
    return results.map((item: SpatialItem) => item.object);
  }

  /**
   * Find the top-most object under a point.
   */
  public getObjectAtPoint(point: { x: number; y: number }): CanvasObject | null {
    const searchBox = {
      minX: point.x - 1,
      minY: point.y - 1,
      maxX: point.x + 1,
      maxY: point.y + 1,
    };

    const matches = this.search(searchBox);
    if (matches.length === 0) return null;

    // Return the object with highest zIndex
    return matches.reduce((highest, current) =>
      current.zIndex > highest.zIndex ? current : highest
    );
  }

  /**
   * Clear all items from the spatial index.
   */
  public clear(): void {
    this.tree.clear();
  }
}
