/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const cleanBackendUrl = backendUrl.replace(/\/api\/v1\/?$/, '');

const nextConfig = {
  reactStrictMode: true,
  turbopack: {},
  devIndicators: {
    buildActivity: false,
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${cleanBackendUrl}/api/v1/:path*`,
      },
    ];
  },

  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
