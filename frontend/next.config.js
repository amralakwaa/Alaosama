/** @type {import('next').NextConfig} */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";
const parsedUrl = new URL(API_URL);
const API_HOST = parsedUrl.hostname;
const API_PORT = parsedUrl.port;

const nextConfig = {
  images: {
    formats: ["image/webp", "image/avif"],
    remotePatterns: [
      {
        protocol: "http",
        hostname: API_HOST,
        port: API_PORT || "",
        pathname: "/public/uploads/**",
      },
      {
        protocol: "https",
        hostname: API_HOST,
        port: API_PORT || "",
        pathname: "/public/uploads/**",
      },
      // Allow any https image (for external covers/avatars)
      {
        protocol: "https",
        hostname: "**",
      },
      // Explicitly allow localhost on port 3000 as fallback
      {
        protocol: "http",
        hostname: "localhost",
        port: "3000",
        pathname: "/**",
      },
      // Explicitly allow localhost on port 3001 as fallback
      {
        protocol: "http",
        hostname: "localhost",
        port: "3001",
        pathname: "/**",
      }
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
};

module.exports = nextConfig;
