/** @type {import('next').NextConfig} */
const nextConfig = { eslint: { ignoreDuringBuilds: true }, 
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['azora.cloud'],
  },
  env: {
    AZORA_VERSION: '1.0.0',
    DEPLOYMENT_ENV: 'production'
  }
}

module.exports = nextConfig
