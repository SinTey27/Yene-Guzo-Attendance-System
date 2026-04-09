/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  // Disable CSS optimization completely to avoid critters error
  experimental: {
    // Remove or comment this line - DO NOT uncomment
    // optimizeCss: true,
  },
  // Essential for Vercel deployment
  output: "standalone",
  // Ignore TypeScript build errors (optional, remove if you want strict type checking)
  typescript: {
    ignoreBuildErrors: false, // Set to true temporarily if needed
  },
  // Ignore ESLint build errors
  eslint: {
    ignoreDuringBuilds: false, // Set to true temporarily if needed
  },
};

module.exports = nextConfig;
