import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Self-contained server in .next/standalone, used by the Docker image.
  output: 'standalone',
  async redirects() {
    return [{ source: '/', destination: '/en', permanent: false }];
  },
};

export default nextConfig;
