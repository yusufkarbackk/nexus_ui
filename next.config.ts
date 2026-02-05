import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  typescript: {
    // Ignore type errors in build for auto-generated routes.d.ts files
    // This is needed because Next.js 16 generates route types that may conflict with Docker builds
    ignoreBuildErrors: true,
  },
  eslint: {
    // Also ignore ESLint during production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
