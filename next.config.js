/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  images: {
    domains: [],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
  },
    env: {
        JWT_SECRET: process.env.JWT_SECRET || 'albashayer_secret_key_2024',
        MYSQL_HOST: process.env.MYSQL_HOST || 'localhost',
        MYSQL_PORT: process.env.MYSQL_PORT || '3306',
        MYSQL_USER: process.env.MYSQL_USER || 'u522164605_albashayer_2',
        MYSQL_PASSWORD: process.env.MYSQL_PASSWORD || 'Gmag@0130',
        MYSQL_DATABASE: process.env.MYSQL_DATABASE || 'u522164605_albashayer_2',
    },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.join(__dirname, 'src'),
    };
    return config;
  },
};

module.exports = nextConfig;
