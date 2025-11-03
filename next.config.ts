import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep webpack config for legacy support if needed
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/node_modules/**", "**/minconda/**"],
    };
    return config;
  },
  // Turbopack config for Next.js 16+
  turbopack: {
    resolveAlias: {},
  },
  // Exclude minconda from TypeScript compilation
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
