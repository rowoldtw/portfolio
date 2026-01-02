import createMDX from '@next/mdx';

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
  experimental: {
    // Turbopack doesn't support webpack loaders; this enables Next's Rust MDX compiler.
    // @see https://nextjs.org/docs/app/api-reference/next-config-js/mdxRs
    mdxRs: true,
  },
};

const withMDX = createMDX({
  extension: /\.mdx?$/,
});

export default withMDX(nextConfig);
