/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@azora/master-ui'],
    experimental: {
        turbo: {
            resolveAlias: {
                '@azora/master-ui': '../../packages/@azora/master-ui',
            },
        },
    },
};

export default nextConfig;
