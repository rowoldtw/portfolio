'use client'

import { ConvexProvider, ConvexReactClient } from 'convex/react'
import type { ReactNode } from 'react'

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
const client = convexUrl ? new ConvexReactClient(convexUrl) : null

export function ReviewsConvexProvider({ children }: { children: ReactNode }) {
  if (!client) throw new Error('Convex URL is not configured.')
  return <ConvexProvider client={client}>{children}</ConvexProvider>
}
