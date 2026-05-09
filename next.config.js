/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "beachcomberhotelandresort.com.au",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
