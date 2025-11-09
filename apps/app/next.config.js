/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    appDir: false
  },
  async rewrites() {
    return [
      {
        source: '/api/education/:path*',
        destination: 'http://localhost:4500/api/:path*'
      },
      {
        source: '/api/codespaces/:path*',
        destination: 'http://localhost:4200/api/:path*'
      },
      {
        source: '/api/studyspaces/:path*',
        destination: 'http://localhost:4300/:path*'
      }
    ]
  }
}

module.exports = nextConfig