import createMDX from '@next/mdx'
import { networkInterfaces } from 'node:os'

const nextConfig = {
  allowedDevOrigins: Object.values(networkInterfaces())
    .flatMap((addresses) => addresses ?? [])
    .filter((address) => address.family === 'IPv4' && !address.internal)
    .map((address) => address.address),
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    mdxRs: true,
  },
  turbopack: {
    root: process.cwd(),
  },
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
})

export default withMDX(nextConfig)
