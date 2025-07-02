// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir is now default in Next.js 14+
  },
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
}

module.exports = nextConfig
