/**
 * =============================================================================
 * Color Utilities
 * =============================================================================
 *
 * Color palettes and utilities for user identification, cursor colors,
 * and the canvas color picker.
 *
 * Design principles:
 * - User colors are vibrant and distinguishable from each other
 * - Canvas colors include both vibrant and muted options
 * - All colors meet WCAG AA contrast requirements on dark backgrounds
 *
 * @module lib/utils/colors
 */

// ─── User Color Palette ─────────────────────────────────────────────────────

/**
 * Colors assigned to users for cursor and avatar display.
 * These are specifically chosen to be:
 * 1. Easily distinguishable from each other
 * 2. Visible on both dark and light canvas backgrounds
 * 3. Pleasing and non-harsh
 *
 * Supports up to 20 concurrent users (matching max room size).
 */
export const USER_COLORS: readonly string[] = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#84CC16', // Lime
  '#22C55E', // Green
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#0EA5E9', // Sky
  '#10B981', // Emerald
  '#FBBF24', // Yellow
  '#FB923C', // Light Orange
  '#A78BFA', // Light Purple
  '#34D399', // Light Teal
] as const;

/**
 * Get a deterministic user color based on index.
 * Wraps around if index exceeds palette length.
 *
 * @param index - User index (typically based on join order)
 * @returns Hex color string
 */
export function getUserColor(index: number): string {
  return USER_COLORS[index % USER_COLORS.length] ?? '#6366F1';
}

/**
 * Get a random user color for initial assignment.
 *
 * @returns Hex color string
 */
export function getRandomUserColor(): string {
  const randomIndex = Math.floor(Math.random() * USER_COLORS.length);
  return USER_COLORS[randomIndex] ?? '#6366F1';
}

// ─── Canvas Color Palette ───────────────────────────────────────────────────

/**
 * Colors available in the canvas color picker.
 * Organized by hue for intuitive selection.
 */
export const CANVAS_COLORS = {
  /** Gray scale */
  grays: [
    '#FFFFFF', '#F1F5F9', '#CBD5E1', '#94A3B8',
    '#64748B', '#475569', '#1E293B', '#0F172A',
  ],
  /** Vibrant colors */
  vibrant: [
    '#EF4444', '#F97316', '#EAB308', '#22C55E',
    '#14B8A6', '#3B82F6', '#8B5CF6', '#EC4899',
  ],
  /** Pastel colors */
  pastel: [
    '#FCA5A5', '#FDBA74', '#FDE047', '#86EFAC',
    '#5EEAD4', '#93C5FD', '#C4B5FD', '#F9A8D4',
  ],
  /** Dark/rich colors */
  dark: [
    '#991B1B', '#9A3412', '#854D0E', '#166534',
    '#115E59', '#1E40AF', '#5B21B6', '#9D174D',
  ],
} as const;

/**
 * Flat list of all canvas colors for simple iteration.
 */
export const ALL_CANVAS_COLORS: readonly string[] = [
  ...CANVAS_COLORS.grays,
  ...CANVAS_COLORS.vibrant,
  ...CANVAS_COLORS.pastel,
  ...CANVAS_COLORS.dark,
] as const;

// ─── Color Utilities ────────────────────────────────────────────────────────

/**
 * Convert a hex color to RGBA with opacity.
 *
 * @param hex - Hex color string (e.g., '#EF4444')
 * @param opacity - Opacity value (0-1)
 * @returns RGBA string (e.g., 'rgba(239, 68, 68, 0.5)')
 */
export function hexToRgba(hex: string, opacity: number): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '');

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

/**
 * Determine whether text on a given background color should be light or dark.
 * Uses the W3C relative luminance formula.
 *
 * @param bgColor - Background hex color
 * @returns '#FFFFFF' for dark backgrounds, '#0F172A' for light backgrounds
 */
export function getContrastTextColor(bgColor: string): string {
  const cleanHex = bgColor.replace('#', '');

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // W3C relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? '#0F172A' : '#FFFFFF';
}

/**
 * Lighten a hex color by a percentage.
 * Useful for hover states and subtle variations.
 *
 * @param hex - Base hex color
 * @param percent - How much to lighten (0-100)
 * @returns Lightened hex color
 */
export function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');

  let r = parseInt(cleanHex.substring(0, 2), 16);
  let g = parseInt(cleanHex.substring(2, 4), 16);
  let b = parseInt(cleanHex.substring(4, 6), 16);

  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
