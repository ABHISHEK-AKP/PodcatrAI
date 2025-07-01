/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'lovely-flamingo-139.convex.cloud'
        },
        {
            protocol: 'https',
          hostname: 'd1csarkz8obe9u.cloudfront.net'
        },
        {
            protocol: 'https',
            hostname: 'img.pikbest.com'
        },
        {
          protocol: 'https',
          hostname: 'original-ibis-90.convex.cloud'
        }
      ]
    }
  };
  
  export default nextConfig;