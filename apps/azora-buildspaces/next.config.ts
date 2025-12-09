import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    transpilePackages: ['@azora/shared-design', '@azora/shared-ai', '@azora/spec-kit', 'reactflow'],
    eslint: {
        // Allow production builds to complete even if there are ESLint errors
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Allow production builds to complete even if there are type errors
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
