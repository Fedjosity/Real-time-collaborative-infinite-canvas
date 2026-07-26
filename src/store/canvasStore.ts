/**
 * =============================================================================
 * Canvas Store (Zustand)
 * =============================================================================
 *
 * Manages local client state for canvas interactions:
 * - Active tool (select, text, shape, sticky, image, audio)
 * - Selected object IDs
 * - Camera state (x, y, scale zoom level)
 * - Current shape type selection
 * - Current color selection
 * - Global physics toggle state
 *
 * @module store/canvasStore
 */

import { create } from 'zustand';
import type { Camera, CanvasTool, ShapeType, ForceFieldType } from '@/types/canvas';

export interface CanvasStoreState {
  /** Active tool in toolbar */
  activeTool: CanvasTool;
  /** IDs of currently selected canvas objects */
  selectedObjectIds: string[];
  /** Camera viewport transform { x, y, scale } */
  camera: Camera;
  /** Shape type selected when shape tool is active */
  shapeType: ShapeType;
  /** Active fill color for tools */
  currentColor: string;
  /** Active stroke color */
  strokeColor: string;
  /** Active stroke width */
  strokeWidth: number;
  /** Active font size for text tools */
  fontSize: number;
  /** Whether global physics simulation is active */
  physicsEnabled: boolean;
  /** Rubber-band selection box in world coordinates */
  selectionBox: { x: number; y: number; width: number; height: number } | null;
  /** Default force type applied to newly created objects */
  creationForceType: ForceFieldType;

  // Actions
  setActiveTool: (tool: CanvasTool) => void;
  setSelectedObjectIds: (ids: string[]) => void;
  selectObject: (id: string, multiSelect?: boolean) => void;
  clearSelection: () => void;
  setCamera: (camera: Camera | ((prev: Camera) => Camera)) => void;
  setZoom: (scale: number, center?: { x: number; y: number }) => void;
  panBy: (dx: number, dy: number) => void;
  setShapeType: (shapeType: ShapeType) => void;
  setCurrentColor: (color: string) => void;
  setStrokeColor: (color: string) => void;
  setStrokeWidth: (width: number) => void;
  setFontSize: (size: number) => void;
  setPhysicsEnabled: (enabled: boolean) => void;
  togglePhysics: () => void;
  setSelectionBox: (box: { x: number; y: number; width: number; height: number } | null) => void;
  setCreationForceType: (force: ForceFieldType) => void;
  resetCanvasState: () => void;
}

const DEFAULT_CAMERA: Camera = {
  x: 0,
  y: 0,
  scale: 1.0,
};

export const useCanvasStore = create<CanvasStoreState>((set) => ({
  activeTool: 'select',
  selectedObjectIds: [],
  camera: DEFAULT_CAMERA,
  shapeType: 'rectangle',
  currentColor: '#0061a5',
  strokeColor: '#00497e',
  strokeWidth: 2,
  fontSize: 18,
  physicsEnabled: false,
  selectionBox: null,
  creationForceType: 'none',

  setActiveTool: (tool) => set({ activeTool: tool }),

  setSelectedObjectIds: (ids) => set({ selectedObjectIds: ids }),

  selectObject: (id, multiSelect = false) =>
    set((state) => {
      if (multiSelect) {
        const isSelected = state.selectedObjectIds.includes(id);
        return {
          selectedObjectIds: isSelected
            ? state.selectedObjectIds.filter((objId) => objId !== id)
            : [...state.selectedObjectIds, id],
        };
      }
      return { selectedObjectIds: [id] };
    }),

  clearSelection: () => set({ selectedObjectIds: [], selectionBox: null }),

  setCamera: (cameraOrUpdater) =>
    set((state) => ({
      camera:
        typeof cameraOrUpdater === 'function'
          ? cameraOrUpdater(state.camera)
          : cameraOrUpdater,
    })),

  setZoom: (scale, center) =>
    set((state) => {
      const clampedScale = Math.min(Math.max(scale, 0.1), 5.0);
      if (!center) {
        return { camera: { ...state.camera, scale: clampedScale } };
      }

      // Zoom towards center point
      const scaleChange = clampedScale / state.camera.scale;
      const newX = center.x - (center.x - state.camera.x) * scaleChange;
      const newY = center.y - (center.y - state.camera.y) * scaleChange;

      return {
        camera: { x: newX, y: newY, scale: clampedScale },
      };
    }),

  panBy: (dx, dy) =>
    set((state) => ({
      camera: {
        ...state.camera,
        x: state.camera.x + dx,
        y: state.camera.y + dy,
      },
    })),

  setShapeType: (shapeType) => set({ shapeType }),

  setCurrentColor: (color) => set({ currentColor: color }),

  setStrokeColor: (color) => set({ strokeColor: color }),

  setStrokeWidth: (width) => set({ strokeWidth: width }),

  setFontSize: (size) => set({ fontSize: size }),

  setPhysicsEnabled: (enabled) => set({ physicsEnabled: enabled }),

  togglePhysics: () =>
    set((state) => ({ physicsEnabled: !state.physicsEnabled })),

  setSelectionBox: (box) => set({ selectionBox: box }),

  setCreationForceType: (force) => set({ creationForceType: force }),

  resetCanvasState: () =>
    set({
      activeTool: 'select',
      selectedObjectIds: [],
      camera: DEFAULT_CAMERA,
      selectionBox: null,
    }),
}));
