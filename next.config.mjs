let userConfig = undefined;
try {
  userConfig = await import("./v0-user-next.config");
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  webpack: (config) => {
    const oneOfRule = config.module.rules.find(
      (rule) => typeof rule.oneOf === "object"
    );

    if (oneOfRule) {
      const cssRule = oneOfRule.oneOf.find(
        (rule) => rule.test && rule.test.toString().includes("css")
      );

      if (cssRule) {
        cssRule.use.push({
          loader: "postcss-loader",
          options: {
            sourceMap: true,
          },
        });
      }
    }

    return config;
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "https://generativelanguage.googleapis.com/:path*",
      },
    ];
  },
};

mergeConfig(nextConfig, userConfig);

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === "object" &&
      !Array.isArray(nextConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }
}

export default nextConfig;
