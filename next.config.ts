import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable image optimization for external domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.in',
      },
    ],
    // Smaller image sizes optimized for mobile-first
    deviceSizes: [320, 420, 640, 768, 1024],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // Use modern formats
    formats: ['image/avif', 'image/webp'],
  },
  // Compress responses
  compress: true,
  // Reduce powered-by header
  poweredByHeader: false,
};

export default nextConfig;
