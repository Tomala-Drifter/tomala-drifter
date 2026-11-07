/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [{ source: '/glanc', destination: '/glanc/index.html' }];
  },
}

module.exports = nextConfig
