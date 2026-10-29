/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/id-card',
        destination: '/id-cards',
      },
    ];
  },
};

export default nextConfig;
