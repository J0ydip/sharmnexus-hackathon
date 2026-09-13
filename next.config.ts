import type { NextConfig } from 'next';

// @ts-expect-error next-pwa does not have perfect type definitions yet
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = {
  output: 'standalone',
  turbopack: {},
};

export default withPWA(nextConfig);
