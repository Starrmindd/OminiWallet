/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@omniwallet/utils', '@omniwallet/blockchain'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'assets.coingecko.com' },
    ],
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
  },
};

export default nextConfig;
