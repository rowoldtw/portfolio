'use client'

import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import { ReviewsReadinessContext } from '@/components/reviews-readiness'
import { usePrefersReducedMotion } from '@/hooks/use-prefers-reduced-motion'

function subscribeToLoading(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.body, { childList: true, subtree: true })
  return () => observer.disconnect()
}

function getLoadingSnapshot() {
  return document.querySelector('[data-reviews-loading]') !== null
}

export default function ReviewsLayout({ children }: { children: ReactNode }) {
  const loading = useSyncExternalStore(
    subscribeToLoading,
    getLoadingSnapshot,
    () => false,
  )

  const reducedMotion = usePrefersReducedMotion()
  const [ready, setReady] = useState(false)
  const hasShownLoader = useRef(false)
  useEffect(() => {
    if (loading) hasShownLoader.current = true
    const timer = window.setTimeout(
      () => setReady(!loading),
      !loading && hasShownLoader.current && !reducedMotion ? 120 : 0,
    )
    return () => window.clearTimeout(timer)
  }, [loading, reducedMotion])
  const animationsReady = ready && !loading
  const barRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const bar = barRef.current
    if (!bar) return
    if (reducedMotion) {
      bar.style.transform = loading ? 'scaleX(0.4)' : 'scaleX(1)'
      return
    }
    const animation = bar.animate(
      loading
        ? [{ transform: 'scaleX(0.08)' }, { transform: 'scaleX(0.92)' }]
        : [
            { transform: getComputedStyle(bar).transform },
            { transform: 'scaleX(1)' },
          ],
      { duration: loading ? 4000 : 120, easing: 'linear', fill: 'forwards' },
    )
    return () => {
      bar.style.transform = getComputedStyle(bar).transform
      animation.cancel()
    }
  }, [loading, reducedMotion])

  return (
    <ReviewsReadinessContext value={animationsReady}>
      <div data-reviews-ready={animationsReady} aria-busy={!animationsReady}>
        {children}
      </div>
      <div
        data-reviews-progress=""
        data-loading={loading}
        aria-hidden={!loading}
        className={`bg-background pointer-events-none fixed inset-0 z-40 flex items-center justify-center transition-opacity duration-120 motion-reduce:transition-none ${loading ? 'opacity-100' : 'opacity-0'}`}
      >
        <div
          role="progressbar"
          aria-label="Loading reviews"
          className="h-1 w-40 overflow-hidden rounded-full bg-zinc-200/70 dark:bg-zinc-800"
        >
          <div
            ref={barRef}
            className="reviews-loading-bar h-full w-full rounded-full bg-zinc-700 dark:bg-zinc-300"
            style={{ transform: loading ? 'scaleX(0.08)' : 'scaleX(1)' }}
          />
        </div>
      </div>
    </ReviewsReadinessContext>
  )
}
