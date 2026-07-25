/**
 * =============================================================================
 * Color Palettes & Utilities
 * =============================================================================
 *
 * Defines luxury Gold & Obsidian Black branding color palettes:
 * - USER_COLORS: 20 distinct presence cursor colors for concurrent users
 * - CANVAS_OBJECT_COLORS: Preset color options for canvas shapes & sticky notes
 * - Color transformation math (hexToRgba, contrast, lighten, darken)
 *
 * @module lib/utils/colors
 */

/**
 * 20 distinct colors for user presence cursors & avatars.
 */
export const USER_COLORS: readonly string[] = [
  '#D4AF37', // Metallic Gold
  '#F59E0B', // Amber Gold
  '#EAB308', // Yellow Gold
  '#B48E26', // Rich Deep Gold
  '#EC4899', // Rose Pink
  '#10B981', // Emerald
  '#38BDF8', // Sky Blue
  '#A855F7', // Imperial Purple
  '#F97316', // Bronze Orange
  '#06B6D4', // Cyan
  '#84CC16', // Lime Gold
  '#6366F1', // Indigo Accent
  '#F43F5E', // Ruby Red
  '#14B8A6', // Teal
  '#E11D48', // Crimson
  '#8B5CF6', // Violet
  '#D97706', // Deep Gold
  '#0EA5E9', // Deep Sky
  '#22C55E', // Green
  '#C084FC', // Soft Lavender
] as const;

/**
 * Palette of preset fill colors for shapes, text, and sticky notes.
 */
export const CANVAS_OBJECT_COLORS: readonly string[] = [
  '#D4AF37', // Metallic Gold
  '#F59E0B', // Warm Amber
  '#FEF08A', // Soft Pastel Gold
  '#0F172A', // Obsidian Surface
  '#1E293B', // Slate Dark
  '#334155', // Muted Obsidian
  '#EF4444', // Crimson Red
  '#F97316', // Bronze
  '#10B981', // Emerald
  '#06B6D4', // Cyan
  '#3B82F6', // Sapphire Blue
  '#8B5CF6', // Amethyst Purple
  '#EC4899', // Rose Pink
  '#FFFFFF', // Pure White
] as const;

export const ALL_CANVAS_COLORS = CANVAS_OBJECT_COLORS;

/**
 * Get user color by index.
 */
export function getUserColor(index: number): string {
  return USER_COLORS[Math.abs(index) % USER_COLORS.length] || '#D4AF37';
}

/**
 * Pick a random user presence color from the palette.
 */
export function getRandomUserColor(): string {
  const index = Math.floor(Math.random() * USER_COLORS.length);
  return USER_COLORS[index] || '#D4AF37';
}

/**
 * Convert 6-digit hex color string to RGBA CSS string.
 */
export function hexToRgba(hex: string, alpha = 1.0): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return `rgba(212, 175, 55, ${alpha})`;

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Compute readable text color (black or white) given a background hex color.
 */
export function getContrastingTextColor(bgHex: string): '#0F172A' | '#FFFFFF' {
  const cleanHex = bgHex.replace('#', '');
  if (cleanHex.length !== 6) return '#FFFFFF';

  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);

  // Relative luminance formula (WCAG 2.0)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#0F172A' : '#FFFFFF';
}

export const getContrastTextColor = getContrastingTextColor;

/**
 * Lighten a hex color by a given percentage.
 */
export function lightenColor(hex: string, percent: number): string {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return hex;

  const num = parseInt(cleanHex, 16);
  const amt = Math.round(255 * (percent / 100));
  const R = Math.min(255, Math.max(0, (num >> 16) + amt));
  const G = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amt));
  const B = Math.min(255, Math.max(0, (num & 0x0000ff) + amt));

  return `#${((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
}
