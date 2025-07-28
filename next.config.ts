import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Deshabilitar linting durante el build temporalmente
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Deshabilitar errores de TypeScript durante el build temporalmente
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
