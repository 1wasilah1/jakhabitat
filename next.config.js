/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: '/jakhabitat',
  assetPrefix: '/jakhabitat',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
      {
        source: '/jakhabitat/:path*',
        destination: '/public/:path*',
      },
    ]
  },
}

module.exports = nextConfig