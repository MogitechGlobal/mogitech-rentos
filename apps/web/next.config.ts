import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker/Render/Vercel deployments
  //output: 'standalone',

  // 1. Solves the CORS & 3rd-Party Cookie Issue
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://mogitech-rentos.onrender.com/api/:path*', // Proxies the request to your backend
      },
    ];
  },

  // 2. Applies your strict security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          }
        ],
      },
    ];
  },
};

export default nextConfig;