import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { isWipModeEnabled } from '@/lib/wip-mode'

const PUBLIC_FILE = /\.[^/]+$/

export function proxy(request: NextRequest) {
  if (!isWipModeEnabled()) {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  if (
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const url = request.nextUrl.clone()
  url.pathname = '/'
  url.search = ''

  return NextResponse.redirect(url)
}

export const config = {
  matcher: '/:path*',
}
