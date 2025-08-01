/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'example.com',
            port: '',
            pathname: '/**'
        }]
    }
};

export default nextConfig;
