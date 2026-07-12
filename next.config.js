const path = require('path');
const os = require('os');
const webpack = require('webpack');

/** @type {import('next').NextConfig} */
const emptyModulePath = path.resolve(__dirname, 'utils/emptyModule.js');
const localDevelopmentHosts = Object.values(os.networkInterfaces())
  .flat()
  .filter((network) => network && network.family === 'IPv4' && !network.internal)
  .map((network) => network.address);

const nextConfig = {
  output: 'export',
  allowedDevOrigins: ['localhost', '127.0.0.1', ...localDevelopmentHosts],
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Enable experimental WASM support
  experimental: {
    webpackBuildWorker: true,
  },
  // Turbopack configuration for Next.js 16+
  turbopack: {
    resolveAlias: {
      fs: { browser: './utils/emptyModule.js' },
      path: { browser: './utils/emptyModule.js' },
      url: { browser: './utils/emptyModule.js' },
    },
  },
  // Webpack fallback for WASM support (used in production build)
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'webassembly/async',
    });

    // Fixes for tiktoken and transformers.js in browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: emptyModulePath,
        path: emptyModulePath,
        url: emptyModulePath,
        module: false,
        perf_hooks: false,
      };

      // onnxruntime-web (a transitive dep of @huggingface/transformers)
      // ships emscripten-asyncify bundles that emit dynamic imports of
      // single-character stub modules (`import('a')`, `import('b')`, ...).
      // These are runtime placeholders that emscripten swaps at runtime;
      // webpack's static analyzer can't resolve them and fails the build.
      // Scope an IgnorePlugin so only requests issued from inside the
      // onnxruntime-web package skip resolution — no other single-char
      // imports elsewhere in the tree are affected.
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.IgnorePlugin({
          resourceRegExp: /^[a-z]$/,
          contextRegExp: /[\\/]onnxruntime-web[\\/]/,
        })
      );

      // The asyncWebAssembly experiment emits spurious "target environment
      // does not appear to support async/await" warnings for tiktoken and
      // onnxruntime-web WASM bundles. All evergreen browsers DO support
      // async/await and top-level await, so the warning is incorrect.
      // Filter it from the dev overlay so it doesn't pollute the console.
      config.ignoreWarnings = [
        ...(config.ignoreWarnings || []),
        /The generated code contains 'async\/await' because this module is using "asyncWebAssembly"/,
      ];
    }

    return config;
  },
};

module.exports = nextConfig;
