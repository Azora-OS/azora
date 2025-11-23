/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@azora/premium-ui', '@azora/api-client'],
    env: {
        NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    },
};

export default nextConfig;
