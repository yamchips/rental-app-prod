/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [{
            protocol: 'https',
            hostname: 'example.com',
            port: '',
            pathname: '/**'
        },
        {
            protocol: 'https',
            hostname: 'rental-s3-pictures.s3.eu-west-2.amazonaws.com',
            port: '',
            pathname: '/**'
        }]
    }
};

export default nextConfig;
