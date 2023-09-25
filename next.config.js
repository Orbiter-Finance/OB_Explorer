/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enables the styled-components SWC transform
  // Fixed: Prop className did not match
  experimental: {
    appDir: true,
  },
  compiler: {
    styledComponents: true,
  },
  // swcMinify: true,
  // images: {
  //   unoptimized: true,
  // },

  // Fixed: @walletconnect error and warn
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
      lokijs: false,
      encoding: false,
      'pino-pretty': false,
    }
    return config
  },
}

module.exports = nextConfig
