'use client'

import { useReviewsReady } from '@/components/reviews-readiness'
import { TextEffect } from '@/components/ui/text-effect'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

export function PageTitle({
  children,
  id,
  className,
  entranceKey,
}: {
  children: string
  id?: string
  className?: string
  entranceKey?: string
}) {
  const ready = useReviewsReady()
  const reducedMotion = usePrefersReducedMotion()
  return (
    <div id={id}>
      {reducedMotion ? (
        <h1 className={className}>{children}</h1>
      ) : !ready ? (
        <h1 className={className} style={{ visibility: 'hidden' }}>
          {children}
        </h1>
      ) : (
        <TextEffect
          onceKey={entranceKey ?? `review-title-${children}`}
          as="h1"
          per="char"
          preset="fade"
          delay={0.05}
          speedReveal={0.75}
          speedSegment={0.6}
          className={className}
        >
          {children}
        </TextEffect>
      )}
    </div>
  )
}
