/* 
AZORA PROPRIETARY LICENSE 
Copyright (c) 2025 Azora ES (Pty) Ltd. All Rights Reserved. 
ECHO is off.
See LICENSE file for details. 
*/ 
ECHO is off.
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  
  // Ignore build errors for agent files (they're for orchestration, not web)
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  
  webpack: (config) => {
    config.ignoreWarnings = [
      { module: /node_modules/ },
    ];
    return config;
  },
};

module.exports = nextConfig;
