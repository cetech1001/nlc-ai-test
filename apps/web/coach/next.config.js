//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');


/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  output: 'standalone',

  nx: {
    svgr: false,
  },

  images: {
    domains: [],
  },

  env: {},
  async headers() {
    return [
      {
        source: '/embed/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET' },
        ],
      },
    ];
  },

  webpack: (config, { dev, isServer }) => {
    if (dev) {
      config.plugins.push(new CaseSensitivePathsPlugin());
      config.cache = { type: 'memory' };
    }

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    return config;
  },
};

const plugins = [
  withNx,
];

module.exports = composePlugins(...plugins)(nextConfig);
