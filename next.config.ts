import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },
  env: {
    SERVICE_ACCOUNT_PRIVATE_KEY: process.env.SERVICE_ACCOUNT_PRIVATE_KEY,
    MEGAETH_RPC_URL: process.env.MEGAETH_RPC_URL || 'https://testnet.megaeth.systems',
    MEGAETH_EXPLORER_URL: process.env.MEGAETH_EXPLORER_URL || 'https://www.megaexplorer.xyz',
  },
  poweredByHeader: false,
  // Performance optimizations
  swcMinify: true,
  compress: true,
  // Output configuration for Netlify
  output: 'standalone',
};

export default nextConfig;
