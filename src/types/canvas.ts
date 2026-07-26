/**
 * =============================================================================
 * Canvas Type Definitions
 * =============================================================================
 *
 * Core types for the infinite canvas system. These types define the shape of
 * every object on the canvas, the camera/viewport state, and tool configuration.
 *
 * These types are used across the entire application:
 * - Zustand stores (canvasStore)
 * - Yjs shared types (Y.Map<CanvasObject>)
 * - Konva rendering components
 * - Physics engine sync layer
 * - Export/import serialization
 *
 * @module types/canvas
 */

// ─── Primitive Types ────────────────────────────────────────────────────────

/** 2D position in world coordinates */
export interface Position {
  x: number;
  y: number;
}

/** 2D dimensions */
export interface Size {
  width: number;
  height: number;
}

/** Axis-aligned bounding box for spatial queries (rbush format) */
export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

// ─── Camera & Viewport ──────────────────────────────────────────────────────

/**
 * Camera state for the infinite canvas.
 *
 * The camera maps between "world space" (infinite coordinates where objects
 * live) and "screen space" (pixel coordinates on the user's display).
 *
 * World-to-screen: screenPos = (worldPos - camera.offset) * camera.scale
 * Screen-to-world: worldPos = screenPos / camera.scale + camera.offset
 */
export interface Camera {
  /** Horizontal pan offset in world units */
  x: number;
  /** Vertical pan offset in world units */
  y: number;
  /** Zoom level: 1.0 = 100%, 0.1 = 10% (min), 5.0 = 500% (max) */
  scale: number;
}

/** The visible portion of the canvas in world coordinates */
export interface Viewport extends BoundingBox {
  width: number;
  height: number;
}

/** Zoom level constraints */
export const ZOOM_LIMITS = {
  MIN: 0.1,   // 10% — see entire canvas overview
  MAX: 5.0,   // 500% — pixel-level detail
  DEFAULT: 1.0,
  STEP: 0.1,  // Increment per scroll tick
} as const;

// ─── Object Types ───────────────────────────────────────────────────────────

/** Supported canvas object types */
export type ObjectType = 'text' | 'shape' | 'image' | 'sticky' | 'audio';

/** Supported shape subtypes */
export type ShapeType =
  | 'rectangle'
  | 'circle'
  | 'triangle'
  | 'star'
  | 'arrow'
  | 'line'
  | 'hexagon'
  | 'diamond';

// ─── Object-Specific Data ───────────────────────────────────────────────────

/** Data for text objects */
export interface TextData {
  /** The text content (supports multi-line) */
  content: string;
  /** Font size in pixels */
  fontSize: number;
  /** CSS font family */
  fontFamily: string;
  /** Font weight */
  fontWeight: 'normal' | 'bold';
  /** Font style */
  fontStyle: 'normal' | 'italic';
  /** Text decoration */
  textDecoration: 'none' | 'underline' | 'line-through';
  /** Text color (hex) */
  color: string;
  /** Text alignment */
  align: 'left' | 'center' | 'right';
  /** Line height multiplier */
  lineHeight: number;
}

/** Data for shape objects */
export interface ShapeData {
  /** Which shape to render */
  shapeType: ShapeType;
  /** Fill color (hex or 'transparent') */
  fill: string;
  /** Stroke/border color (hex) */
  stroke: string;
  /** Stroke width in pixels */
  strokeWidth: number;
  /** Corner radius for rounded rectangles */
  cornerRadius: number;
  /** Number of points (for star shapes) */
  numPoints: number;
  /** Inner radius ratio for stars (0-1) */
  innerRadius: number;
}

/** Data for image objects */
export interface ImageData {
  /** Image source: data URL (base64) or server URL */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Image opacity (0-1) */
  opacity: number;
  /** Whether to maintain aspect ratio on resize */
  preserveAspectRatio: boolean;
}

/** Data for sticky note objects */
export interface StickyData {
  /** Note text content */
  content: string;
  /** Background color (from sticky color palette) */
  backgroundColor: string;
  /** Text color */
  textColor: string;
  /** Font size in pixels */
  fontSize: number;
  /** Author name (for attribution) */
  author: string;
}

/** Data for audio recording objects */
export interface AudioData {
  /** Server-side audio file ID (references AudioFile in Prisma) */
  audioId: string;
  /** Audio duration in seconds */
  duration: number;
  /** Normalized waveform data (0-1 values) for visualization */
  waveform: number[];
  /** Whether audio is currently playing (local state, not synced) */
  isPlaying: boolean;
  /** Current playback position in seconds */
  currentTime: number;
}

/** Union type: the `data` field of a CanvasObject is one of these */
export type ObjectData =
  | TextData
  | ShapeData
  | ImageData
  | StickyData
  | AudioData;

// ─── Physics Properties ─────────────────────────────────────────────────────

export type PhysicsState = 'resting' | 'active' | 'dragging';
export type ForceFieldType = 'none' | 'attract' | 'repel';

/**
 * Physics simulation properties attached to each canvas object.
 * Synced via Yjs so all users see the same physics state.
 */
export interface PhysicsProperties {
  /** Whether this object participates in physics simulation */
  enabled: boolean;
  /** Simulation lifecycle state (active = simulated by authority, resting = static) */
  state?: PhysicsState;
  /** Username or ID of the client currently governing this object's simulation */
  authority?: string | null;
  /** Current velocity vector (pixels/second) */
  velocity: Position;
  /** Angular velocity (radians/second) */
  angularVelocity: number;
  /** Object mass (affects collision response) */
  mass: number;
  /** Surface friction (0 = ice, 1 = sandpaper) */
  friction: number;
  /** Air resistance / deceleration (prevents sliding forever) */
  frictionAir?: number;
  /** Bounciness on collision (0 = no bounce, 1 = perfect bounce) */
  restitution: number;
  /** Static objects don't move but others can collide with them */
  isStatic: boolean;
  /** Active spatial force field emitted by this object */
  forceType?: ForceFieldType;
}

// ─── Canvas Object (Core Entity) ────────────────────────────────────────────

/**
 * The fundamental entity on the canvas.
 *
 * Every object — text, shape, image, sticky note, audio — is represented
 * by this interface. The `type` field determines which rendering component
 * is used and which `data` variant is expected.
 *
 * All properties are synced via Yjs CRDT, meaning:
 * - Changes propagate to all connected users in real-time
 * - Offline edits merge automatically on reconnect
 * - No conflicts possible (CRDT guarantees convergence)
 */
export interface CanvasObject {
  /** Unique identifier (nanoid, 12 characters) */
  id: string;
  /** Object type — determines rendering and behavior */
  type: ObjectType;
  /** X position in world coordinates */
  x: number;
  /** Y position in world coordinates */
  y: number;
  /** Width in world units */
  width: number;
  /** Height in world units */
  height: number;
  /** Rotation angle in degrees */
  rotation: number;
  /** Type-specific data payload */
  data: ObjectData;
  /** Physics simulation properties */
  physics: PhysicsProperties;
  /** Username of the creator */
  createdBy: string;
  /** Unix timestamp (ms) of creation */
  createdAt: number;
  /** Stacking order (higher = rendered on top) */
  zIndex: number;
  /** If true, object cannot be moved/edited/deleted */
  locked: boolean;
  /** Visual opacity (0 = invisible, 1 = fully opaque) */
  opacity: number;
}

// ─── Tool Types ─────────────────────────────────────────────────────────────

/** Available canvas tools in the toolbar */
export type CanvasTool =
  | 'select'   // Click to select, drag to move
  | 'pan'      // Drag to pan the canvas
  | 'text'     // Click to place a text block
  | 'shape'    // Click+drag to draw a shape
  | 'sticky'   // Click to place a sticky note
  | 'image'    // Click to upload/paste an image
  | 'audio'    // Click to start recording
  | 'eraser';  // Click or drag to erase objects

/** Active tool state with configuration */
export interface ToolState {
  /** Currently active tool */
  tool: CanvasTool;
  /** Shape subtype (when tool === 'shape') */
  shapeType: ShapeType;
  /** Primary fill color */
  color: string;
  /** Stroke/border color */
  strokeColor: string;
  /** Stroke width */
  strokeWidth: number;
  /** Text font size */
  fontSize: number;
  /** Font family */
  fontFamily: string;
}

// ─── Default Factories ──────────────────────────────────────────────────────

/** Default physics properties for new objects */
export const DEFAULT_PHYSICS: PhysicsProperties = {
  enabled: false,
  state: 'resting',
  authority: null,
  velocity: { x: 0, y: 0 },
  angularVelocity: 0,
  mass: 1,
  friction: 0.1,
  frictionAir: 0.02,
  restitution: 0.6,
  isStatic: false,
  forceType: 'none',
};

/** Default text data for new text objects */
export const DEFAULT_TEXT_DATA: TextData = {
  content: 'Double-click to edit',
  fontSize: 18,
  fontFamily: "'Inter', sans-serif",
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  color: '#0061a5',
  align: 'left',
  lineHeight: 1.5,
};

/** Default shape data for new shapes */
export const DEFAULT_SHAPE_DATA: ShapeData = {
  shapeType: 'rectangle',
  fill: '#0d99ff',
  stroke: '#0061a5',
  strokeWidth: 2,
  cornerRadius: 8,
  numPoints: 5,
  innerRadius: 0.5,
};

/** Default sticky note data */
export const DEFAULT_STICKY_DATA: StickyData = {
  content: '',
  backgroundColor: '#f8f9fa',
  textColor: '#191c1d',
  fontSize: 14,
  author: '',
};

/** Sticky note color palette */
export const STICKY_COLORS = [
  '#FEF08A', // Yellow
  '#BBF7D0', // Green
  '#BFDBFE', // Blue
  '#FED7AA', // Orange
  '#FBCFE8', // Pink
  '#DDD6FE', // Purple
  '#FCA5A5', // Red
  '#A7F3D0', // Teal
] as const;
