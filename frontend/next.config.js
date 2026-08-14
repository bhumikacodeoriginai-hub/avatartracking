/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig;
