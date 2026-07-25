import type { NextConfig } from 'next';

/**
 * Next.js Configuration
 *
 * Key decisions:
 * - reactStrictMode: true for catching bugs early
 * - We use a custom server.js (not `next dev`) for WebSocket support
 * - Konva/react-konva are client-only — all canvas components use 'use client'
 * - Server actions disabled (we use API routes + WebSocket instead)
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,

  /**
   * Standalone output for production Docker deployments.
   * Bundles all dependencies into .next/standalone so you can
   * deploy without node_modules.
   */
  output: 'standalone',

  /**
   * Suppress hydration warnings for Konva canvases.
   * Canvas elements are client-only and won't match server HTML.
   */
  experimental: {
    /** Enable server actions for future API endpoints */
    serverActions: {
      bodySizeLimit: '10mb', // Support audio file uploads
    },
  },

  /**
   * Webpack customizations:
   * - Exclude server-incompatible modules from SSR bundles
   */
  webpack: (config, { isServer }) => {
    if (isServer) {
      // These packages use browser APIs (IndexedDB, WebSocket client)
      // and must never be bundled for server-side rendering
      config.externals = config.externals || [];
    }

    return config;
  },
};

export default nextConfig;
