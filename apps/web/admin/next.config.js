//@ts-check

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
    optimizePackageImports: ['@nlc-ai/web-ui', '@nlc-ai/web-auth', '@nlc-ai/web-shared'],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'admin.nextlevelcoach.ai',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      }
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  transpilePackages: ['@nlc-ai/web-ui', '@nlc-ai/web-auth', '@nlc-ai/web-shared'],
  env: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    // Ensure proper module resolution
    config.resolve.extensions = ['.tsx', '.ts', '.jsx', '.js', '.json'];

    // Prevent duplicate processing
    config.optimization = {
      ...config.optimization,
      providedExports: true,
      // usedExports: true,
    };

    return config;
  },
};

module.exports = nextConfig;
