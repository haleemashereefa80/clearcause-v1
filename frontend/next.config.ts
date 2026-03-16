import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  // @ts-ignore - Turbopack is stabilized in Next.js 15+ but types may lag
  turbopack: {},
};

export default nextConfig;
