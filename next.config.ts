import type { NextConfig } from 'next';

/**
 * Next.js Configuration
 *
 * Key decisions:
 * - reactStrictMode: true for catching bugs early
 * - We use a custom server.js for WebSocket support
 * - Konva/react-konva are client-only — 'canvas' aliased to false for Webpack
 * - Standalone output for Docker deployment
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Support audio file uploads
    },
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), 'canvas'];
    }

    // Ignore Node 'canvas' module fallback in Konva
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
    };

    return config;
  },
};

export default nextConfig;
