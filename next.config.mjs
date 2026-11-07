/** @type {import('next').NextConfig} */
const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const cleanBackendUrl = backendUrl.replace(/\/api\/v1\/?$/, '');

const nextConfig = {
  reactStrictMode: true,
<<<<<<< HEAD
  devIndicators: false,
  turbopack: {},
=======
  turbopack: {},
  devIndicators: {
    buildActivity: false,
  },
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
<<<<<<< HEAD
        destination: 'http://127.0.0.1:8000/api/v1/:path*',
=======
        destination: `${cleanBackendUrl}/api/v1/:path*`,
>>>>>>> 050db5a4b1a5a7ab1ae529b9ddc5eb2c1274d9d8
      },
    ];
  },

  webpack: (config) => {
    config.cache = false;
    return config;
  },
};

export default nextConfig;
