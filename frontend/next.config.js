/** @type {import('next').NextConfig} */

const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      // Production domain
      {
        protocol: "https",
        hostname: "yellowgreen-bear-642887.hostingersite.com",
        pathname: "/**",
      },
      // Allow any https image (for external covers/avatars)
      {
        protocol: "https",
        hostname: "**",
      },
      // Localhost fallbacks for development
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3001",
        pathname: "/**",
      },
    ],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // API proxy to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `http://127.0.0.1:3001/api/:path*`,
      },
      {
        source: '/public/:path*',
        destination: `http://127.0.0.1:3001/public/:path*`,
      },
    ];
  },

  // Disable aggressive parallelization and workers for Hostinger shared hosting (prevents EAGAIN errors)
  experimental: {
    workerThreads: false,
    cpus: 1,
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
};

module.exports = nextConfig;
