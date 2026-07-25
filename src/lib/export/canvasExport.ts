/**
 * =============================================================================
 * Canvas Export & Import System Utilities (PNG / SVG / JSON)
 * =============================================================================
 *
 * Implements export and import pipelines for the infinite canvas:
 * - Export as JSON workspace file (.json)
 * - Export as SVG vector image file (.svg)
 * - Export as PNG high-res bitmap image file (.png)
 * - Import from JSON workspace file
 *
 * @module lib/export/canvasExport
 */

import type { CanvasObject } from '@/types/canvas';

export interface CanvasExportData {
  version: string;
  exportedAt: number;
  roomId?: string;
  objects: CanvasObject[];
}

/**
 * Serializes canvas objects to a structured JSON string.
 */
export function exportCanvasToJson(objects: CanvasObject[], roomId?: string): string {
  const data: CanvasExportData = {
    version: '1.0.0',
    exportedAt: Date.now(),
    roomId,
    objects,
  };
  return JSON.stringify(data, null, 2);
}

/**
 * Generates SVG vector XML markup string for all canvas objects.
 */
export function exportCanvasToSvg(objects: CanvasObject[]): string {
  if (objects.length === 0) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600" style="background:#070709;"><text x="400" y="300" fill="#D4AF37" text-anchor="middle" font-family="sans-serif">Empty Canvas</text></svg>`;
  }

  // Calculate bounding box enclosing all objects
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  objects.forEach((obj) => {
    minX = Math.min(minX, obj.x);
    minY = Math.min(minY, obj.y);
    maxX = Math.max(maxX, obj.x + obj.width);
    maxY = Math.max(maxY, obj.y + obj.height);
  });

  const padding = 40;
  minX -= padding;
  minY -= padding;
  maxX += padding;
  maxY += padding;

  const width = Math.max(100, maxX - minX);
  const height = Math.max(100, maxY - minY);

  let svgElements = '';

  objects.forEach((obj) => {
    const data = (obj.data as any) || {};

    if (obj.type === 'text') {
      const color = data.color || '#FEF3C7';
      const fontSize = data.fontSize || 18;
      const textContent = data.content || 'Text';
      svgElements += `<text x="${obj.x - minX}" y="${obj.y - minY + fontSize}" fill="${color}" font-size="${fontSize}" font-family="sans-serif">${textContent}</text>\n`;
    } else if (obj.type === 'sticky') {
      const bgColor = data.backgroundColor || '#FEF08A';
      const textColor = data.textColor || '#1C1917';
      const textContent = data.content || 'Note';
      svgElements += `<g transform="translate(${obj.x - minX}, ${obj.y - minY})">
        <rect width="${obj.width}" height="${obj.height}" rx="8" fill="${bgColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1"/>
        <text x="12" y="28" fill="${textColor}" font-size="14" font-family="sans-serif">${textContent}</text>
      </g>\n`;
    } else if (obj.type === 'shape') {
      const fill = data.fill || '#D4AF37';
      const stroke = data.stroke || '#F59E0B';
      const shapeType = data.shapeType || 'rectangle';

      if (shapeType === 'circle') {
        const cx = obj.x - minX + obj.width / 2;
        const cy = obj.y - minY + obj.height / 2;
        const r = Math.min(obj.width, obj.height) / 2;
        svgElements += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>\n`;
      } else {
        svgElements += `<rect x="${obj.x - minX}" y="${obj.y - minY}" width="${obj.width}" height="${obj.height}" rx="${data.cornerRadius || 8}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>\n`;
      }
    } else if (obj.type === 'image') {
      const src = data.src || '';
      svgElements += `<image href="${src}" x="${obj.x - minX}" y="${obj.y - minY}" width="${obj.width}" height="${obj.height}"/>\n`;
    }
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="background:#070709;">\n${svgElements}</svg>`;
}

/**
 * Exports canvas objects as PNG high-res image data URL.
 */
export function exportCanvasToPng(objects: CanvasObject[]): Promise<Blob> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(new Blob([], { type: 'image/png' }));
      return;
    }

    const canvas = document.createElement('canvas');
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    if (objects.length === 0) {
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#070709';
        ctx.fillRect(0, 0, 800, 600);
      }
      canvas.toBlob((blob) => resolve(blob || new Blob([], { type: 'image/png' })), 'image/png');
      return;
    }

    objects.forEach((obj) => {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    });

    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = Math.max(200, maxX - minX);
    const height = Math.max(200, maxY - minY);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(new Blob([], { type: 'image/png' }));
      return;
    }

    // Fill dark obsidian background
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, width, height);

    // Draw objects
    objects.forEach((obj) => {
      const data = (obj.data as any) || {};
      const relX = obj.x - minX;
      const relY = obj.y - minY;

      if (obj.type === 'text') {
        const fontSize = data.fontSize || 18;
        ctx.fillStyle = data.color || '#FEF3C7';
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillText(data.content || 'Text', relX, relY + fontSize);
      } else if (obj.type === 'sticky') {
        ctx.fillStyle = data.backgroundColor || '#FEF08A';
        ctx.beginPath();
        ctx.roundRect(relX, relY, obj.width, obj.height, 8);
        ctx.fill();

        ctx.fillStyle = data.textColor || '#1C1917';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(data.content || 'Sticky Note', relX + 12, relY + 28);
      } else if (obj.type === 'shape') {
        ctx.fillStyle = data.fill || '#D4AF37';
        ctx.strokeStyle = data.stroke || '#F59E0B';
        ctx.lineWidth = 2;

        if (data.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(relX + obj.width / 2, relY + obj.height / 2, Math.min(obj.width, obj.height) / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.roundRect(relX, relY, obj.width, obj.height, data.cornerRadius || 8);
          ctx.fill();
          ctx.stroke();
        }
      }
    });

    if (!canvas.toBlob) {
      resolve(new Blob([], { type: 'image/png' }));
      return;
    }

    try {
      canvas.toBlob((blob) => resolve(blob || new Blob([], { type: 'image/png' })), 'image/png');
    } catch {
      resolve(new Blob([], { type: 'image/png' }));
    }
  });
}

/**
 * Exports canvas objects as JPEG image data Blob with background color.
 */
export function exportCanvasToJpeg(objects: CanvasObject[], quality = 0.92): Promise<Blob> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(new Blob([], { type: 'image/jpeg' }));
      return;
    }

    const canvas = document.createElement('canvas');
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    if (objects.length === 0) {
      canvas.width = 800;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#070709';
        ctx.fillRect(0, 0, 800, 600);
      }
      canvas.toBlob((blob) => resolve(blob || new Blob([], { type: 'image/jpeg' })), 'image/jpeg', quality);
      return;
    }

    objects.forEach((obj) => {
      minX = Math.min(minX, obj.x);
      minY = Math.min(minY, obj.y);
      maxX = Math.max(maxX, obj.x + obj.width);
      maxY = Math.max(maxY, obj.y + obj.height);
    });

    const padding = 40;
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const width = Math.max(200, maxX - minX);
    const height = Math.max(200, maxY - minY);

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(new Blob([], { type: 'image/jpeg' }));
      return;
    }

    // Fill solid dark obsidian background (required for JPEG without transparency)
    ctx.fillStyle = '#070709';
    ctx.fillRect(0, 0, width, height);

    // Draw objects
    objects.forEach((obj) => {
      const data = (obj.data as any) || {};
      const relX = obj.x - minX;
      const relY = obj.y - minY;

      if (obj.type === 'text') {
        const fontSize = data.fontSize || 18;
        ctx.fillStyle = data.color || '#FEF3C7';
        ctx.font = `${fontSize}px Inter, sans-serif`;
        ctx.fillText(data.content || 'Text', relX, relY + fontSize);
      } else if (obj.type === 'sticky') {
        ctx.fillStyle = data.backgroundColor || '#FEF08A';
        ctx.beginPath();
        ctx.roundRect(relX, relY, obj.width, obj.height, 8);
        ctx.fill();

        ctx.fillStyle = data.textColor || '#1C1917';
        ctx.font = '14px Inter, sans-serif';
        ctx.fillText(data.content || 'Sticky Note', relX + 12, relY + 28);
      } else if (obj.type === 'shape') {
        ctx.fillStyle = data.fill || '#D4AF37';
        ctx.strokeStyle = data.stroke || '#F59E0B';
        ctx.lineWidth = 2;

        if (data.shapeType === 'circle') {
          ctx.beginPath();
          ctx.arc(relX + obj.width / 2, relY + obj.height / 2, Math.min(obj.width, obj.height) / 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          ctx.beginPath();
          ctx.roundRect(relX, relY, obj.width, obj.height, data.cornerRadius || 8);
          ctx.fill();
          ctx.stroke();
        }
      }
    });

    if (!canvas.toBlob) {
      resolve(new Blob([], { type: 'image/jpeg' }));
      return;
    }

    try {
      canvas.toBlob(
        (blob) => resolve(blob || new Blob([], { type: 'image/jpeg' })),
        'image/jpeg',
        quality
      );
    } catch {
      resolve(new Blob([], { type: 'image/jpeg' }));
    }
  });
}

/**
 * Triggers a file download in the browser.
 */
export function downloadFile(content: string | Blob, fileName: string, contentType: string): void {
  if (typeof window === 'undefined') return;

  const blob = content instanceof Blob ? content : new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Validates and parses a JSON workspace file.
 */
export function parseCanvasJson(jsonContent: string): CanvasObject[] {
  const parsed = JSON.parse(jsonContent);
  if (!parsed || (!Array.isArray(parsed.objects) && !Array.isArray(parsed))) {
    throw new Error('Invalid canvas JSON workspace file structure');
  }
  return Array.isArray(parsed.objects) ? parsed.objects : parsed;
}
