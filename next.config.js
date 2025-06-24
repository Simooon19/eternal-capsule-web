/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { dev, isServer }) => {
    // Essential fallback for Node.js modules
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Minimal development optimization only
    if (dev && !isServer) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/studio/**'
        ]
      };
    }

    return config;
  },
  
  // Core Next.js optimizations
  reactStrictMode: true,
  swcMinify: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
  
  // PWA support with critical ESM fix
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
    esmExternals: false, // CRITICAL: Fix webpack module factory issues
    optimizeCss: true,
    optimizePackageImports: ['@sanity/ui', '@sanity/icons'],
  },

  // Custom headers for PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

// Apply Sentry configuration only in production
let config = nextConfig;

if (process.env.NODE_ENV === 'production') {
  const { withSentryConfig } = require('@sentry/nextjs');
  
  const sentryWebpackPluginOptions = {
    // Sentry webpack plugin options
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    
    // Upload source maps only in production
    widenClientFileUpload: true,
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  };

  config = withSentryConfig(config, sentryWebpackPluginOptions);
}

module.exports = config; 