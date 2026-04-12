import type { MetadataRoute } from 'next'
import { WEBSITE_URL } from '@/lib/constants'
import { isWipModeEnabled } from '@/lib/wip-mode'

export default function robots(): MetadataRoute.Robots {
  if (isWipModeEnabled()) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    }
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/private/',
    },
    sitemap: `${WEBSITE_URL}/sitemap.xml`,
  }
}
