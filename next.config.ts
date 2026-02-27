import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for catching bugs early
  reactStrictMode: true,
  // Don't ignore TypeScript/ESLint errors - they catch real bugs
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
