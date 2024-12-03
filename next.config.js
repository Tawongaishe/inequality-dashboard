/**
 * @type {import('next').NextConfig}
 */
  const nextConfig = {
    output: 'export',
    basePath: '/inequality-dashboard',
    images: { unoptimized: true },
    distDir: 'out'
  }
  
  module.exports = nextConfig