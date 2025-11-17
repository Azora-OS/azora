/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: { appDir: true },
  images: { domains: ['azora.world'] },
  env: { UBUNTU_PHILOSOPHY: 'I create because we build together' }
};
module.exports = nextConfig;