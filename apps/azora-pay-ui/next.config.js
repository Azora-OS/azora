/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  env: {
    UBUNTU_PHILOSOPHY: 'Ngiyakwazi ngoba sikwazi - I am because we are'
  }
}

module.exports = nextConfig