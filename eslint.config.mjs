import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: ['.next/**', 'out/**', 'next-env.d.ts'],
  },
  {
    files: ['mdx-components.tsx'],
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
]

export default eslintConfig
