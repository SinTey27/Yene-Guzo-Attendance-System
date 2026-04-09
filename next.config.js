/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Enable prefetching for faster navigation
  experimental: {
    // optimizeCss: true,
  },
};

module.exports = nextConfig;
